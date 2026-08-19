package com.quochuystore.backend.service.impl;

import tools.jackson.databind.ObjectMapper;
import com.quochuystore.backend.config.CacheKeyConstants;
import com.quochuystore.backend.dto.PageResponseDto;
import com.quochuystore.backend.dto.mapper.MessageMapper;
import com.quochuystore.backend.dto.message.request.ChatTypingDto;
import com.quochuystore.backend.dto.message.request.MessageRequestDto;
import com.quochuystore.backend.dto.message.response.ChatEventDto;
import com.quochuystore.backend.dto.message.response.ConversationResponseDto;
import com.quochuystore.backend.dto.message.response.MessageResponseDto;
import com.quochuystore.backend.entity.Conversation;
import com.quochuystore.backend.entity.Message;
import com.quochuystore.backend.entity.User;
import com.quochuystore.backend.entity.enums.UserRole;
import com.quochuystore.backend.exception.BadRequestException;
import com.quochuystore.backend.exception.ResourceNotFoundException;
import com.quochuystore.backend.exception.UnauthorizedException;
import com.quochuystore.backend.repository.ConversationRepository;
import com.quochuystore.backend.repository.MessageRepository;
import com.quochuystore.backend.repository.UserRepository;
import com.quochuystore.backend.security.UserPrincipal;
import com.quochuystore.backend.service.ChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatServiceImpl implements ChatService {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final RedisTemplate<String, Object> redisTemplate;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional
    public MessageResponseDto sendMessage(UserPrincipal principal, MessageRequestDto request) {
        if (principal == null) {
            throw new UnauthorizedException("User must be authenticated to send messages");
        }

        User sender = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Sender user not found"));

        Conversation conversation;
        User receiver = null;

        if (principal.getRole() == UserRole.USER) {
            // Regular user: find or create their personal conversation room
            conversation = conversationRepository.findByUserId(principal.getId())
                    .orElseGet(() -> {
                        Conversation newConv = Conversation.builder()
                                .user(sender)
                                .userLastSeenAt(OffsetDateTime.now())
                                .build();
                        return conversationRepository.save(newConv);
                    });

            if (request.getReceiverId() != null) {
                receiver = userRepository.findById(request.getReceiverId()).orElse(null);
            }
        } else {
            // ADMIN: must specify target conversation ID
            if (request.getConversationId() == null) {
                throw new BadRequestException("conversationId is required for ADMIN when sending messages");
            }

            conversation = conversationRepository.findWithUserById(request.getConversationId())
                    .orElseThrow(() -> new ResourceNotFoundException("Conversation not found with id: " + request.getConversationId()));

            receiver = conversation.getUser();
        }

        // 1. Create and persist Message entity
        Message message = Message.builder()
                .conversation(conversation)
                .sender(sender)
                .receiver(receiver)
                .content(request.getContent().trim())
                .isRead(false)
                .build();

        Message savedMessage = messageRepository.save(message);

        // 2. Update conversation last message & timestamp
        OffsetDateTime now = OffsetDateTime.now();
        conversation.setLastMessage(savedMessage.getContent());
        conversation.setUpdatedAt(now);
        if (principal.getRole() == UserRole.USER) {
            conversation.setUserLastSeenAt(now);
        } else {
            conversation.setAdminLastSeenAt(now);
        }
        conversationRepository.save(conversation);

        // 3. Map to response DTO
        MessageResponseDto responseDto = MessageMapper.toMessageResponseDto(savedMessage);

        // 4. Update Redis Real-time Buffer
        pushMessageToRedisBuffer(conversation.getId(), responseDto);

        // 5. Broadcast to WebSocket topics
        broadcastMessageViaWebSocket(conversation, responseDto, principal.getRole());

        return responseDto;
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponseDto<MessageResponseDto> getMessages(UserPrincipal principal, Long conversationId, int page, int size) {
        if (principal == null) {
            throw new UnauthorizedException("User must be authenticated to view messages");
        }

        Long targetConversationId;

        if (principal.getRole() == UserRole.USER) {
            Conversation userConv = conversationRepository.findByUserId(principal.getId()).orElse(null);
            if (userConv == null) {
                return PageResponseDto.<MessageResponseDto>builder()
                        .content(new ArrayList<>())
                        .pageNo(page)
                        .pageSize(size)
                        .totalElements(0L)
                        .totalPages(0)
                        .last(true)
                        .build();
            }

            if (conversationId != null && !conversationId.equals(userConv.getId())) {
                throw new UnauthorizedException("Access denied to conversation " + conversationId);
            }
            targetConversationId = userConv.getId();
        } else {
            // ADMIN
            if (conversationId == null) {
                throw new BadRequestException("conversationId is required for ADMIN");
            }
            if (!conversationRepository.existsById(conversationId)) {
                throw new ResourceNotFoundException("Conversation not found with id: " + conversationId);
            }
            targetConversationId = conversationId;
        }

        // Attempt Redis buffer read on page 0 if requested size fits in buffer
        if (page == 0 && size <= CacheKeyConstants.CHAT_ROOM_BUFFER_SIZE) {
            List<MessageResponseDto> cachedMessages = getMessagesFromRedisBuffer(targetConversationId, size);
            if (cachedMessages != null && !cachedMessages.isEmpty()) {
                long totalElements = messageRepository.count();
                int totalPages = (int) Math.ceil((double) totalElements / size);
                return PageResponseDto.<MessageResponseDto>builder()
                        .content(cachedMessages)
                        .pageNo(0)
                        .pageSize(size)
                        .totalElements(totalElements)
                        .totalPages(totalPages)
                        .last(cachedMessages.size() < size || totalPages <= 1)
                        .build();
            }
        }

        Pageable pageable = PageRequest.of(page, size);
        Page<Message> messagePage = messageRepository.findByConversationIdWithSenderOrderByCreatedAtDesc(targetConversationId, pageable);

        List<MessageResponseDto> content = messagePage.getContent().stream()
                .map(MessageMapper::toMessageResponseDto)
                .collect(Collectors.toList());

        return PageResponseDto.<MessageResponseDto>builder()
                .content(content)
                .pageNo(messagePage.getNumber())
                .pageSize(messagePage.getSize())
                .totalElements(messagePage.getTotalElements())
                .totalPages(messagePage.getTotalPages())
                .last(messagePage.isLast())
                .build();
    }

    @Override
    @Transactional
    public ConversationResponseDto getOrCreateMyConversation(UserPrincipal principal) {
        if (principal == null) {
            throw new UnauthorizedException("User must be authenticated");
        }

        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Conversation conversation = conversationRepository.findByUserId(principal.getId())
                .orElseGet(() -> {
                    Conversation newConv = Conversation.builder()
                            .user(user)
                            .userLastSeenAt(OffsetDateTime.now())
                            .build();
                    return conversationRepository.save(newConv);
                });

        long unreadCount = messageRepository.countUnreadByConversationAndSenderRole(conversation.getId(), UserRole.ADMIN);
        return MessageMapper.toConversationResponseDto(conversation, unreadCount);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponseDto<ConversationResponseDto> getAdminConversations(int page, int size, String search) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Conversation> conversationPage;

        if (StringUtils.hasText(search)) {
            conversationPage = conversationRepository.searchConversations(search.trim(), pageable);
        } else {
            conversationPage = conversationRepository.findAllByOrderByUpdatedAtDesc(pageable);
        }

        List<ConversationResponseDto> dtos = conversationPage.getContent().stream()
                .map(conv -> {
                    long unreadCount = messageRepository.countUnreadByConversationAndSenderRole(conv.getId(), UserRole.USER);
                    return MessageMapper.toConversationResponseDto(conv, unreadCount);
                })
                .collect(Collectors.toList());

        return PageResponseDto.<ConversationResponseDto>builder()
                .content(dtos)
                .pageNo(conversationPage.getNumber())
                .pageSize(conversationPage.getSize())
                .totalElements(conversationPage.getTotalElements())
                .totalPages(conversationPage.getTotalPages())
                .last(conversationPage.isLast())
                .build();
    }

    @Override
    @Transactional
    public void markConversationAsRead(UserPrincipal principal, Long conversationId) {
        if (principal == null) {
            throw new UnauthorizedException("User must be authenticated");
        }
        if (conversationId == null) {
            throw new BadRequestException("conversationId is required");
        }

        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found with id: " + conversationId));

        OffsetDateTime now = OffsetDateTime.now();

        if (principal.getRole() == UserRole.USER) {
            if (!conversation.getUser().getId().equals(principal.getId())) {
                throw new UnauthorizedException("Access denied to conversation " + conversationId);
            }
            messageRepository.markMessagesAsReadBySenderRole(conversationId, UserRole.ADMIN);
            conversation.setUserLastSeenAt(now);
        } else {
            // ADMIN
            messageRepository.markMessagesAsReadBySenderRole(conversationId, UserRole.USER);
            conversation.setAdminLastSeenAt(now);
        }

        conversationRepository.save(conversation);

        // Broadcast read receipt event via WebSocket
        ChatEventDto readEvent = ChatEventDto.builder()
                .type(ChatEventDto.EventType.READ_RECEIPT)
                .conversationId(conversationId)
                .senderId(principal.getId())
                .senderDisplayName(principal.getDisplayName())
                .readAt(now)
                .build();

        try {
            messagingTemplate.convertAndSend("/topic/chat/" + conversationId, readEvent);
        } catch (Exception ex) {
            log.error("Failed to broadcast read receipt via WebSocket", ex);
        }
    }

    @Override
    public void broadcastTyping(UserPrincipal principal, ChatTypingDto typingDto) {
        if (principal == null || typingDto == null || typingDto.getConversationId() == null) {
            return;
        }

        // Broadcast typing indicator to chat room topic
        ChatEventDto typingEvent = ChatEventDto.builder()
                .type(ChatEventDto.EventType.TYPING)
                .conversationId(typingDto.getConversationId())
                .senderId(principal.getId())
                .senderDisplayName(principal.getDisplayName())
                .isTyping(typingDto.getIsTyping())
                .build();

        try {
            messagingTemplate.convertAndSend("/topic/chat/" + typingDto.getConversationId(), typingEvent);
        } catch (Exception ex) {
            log.error("Failed to broadcast typing event via WebSocket", ex);
        }
    }

    // ==========================================
    // Internal Redis & WebSocket Helper Methods
    // ==========================================

    private void pushMessageToRedisBuffer(Long conversationId, MessageResponseDto dto) {
        String cacheKey = CacheKeyConstants.CHAT_ROOM_PREFIX + conversationId;
        try {
            redisTemplate.opsForList().leftPush(cacheKey, dto);
            redisTemplate.opsForList().trim(cacheKey, 0, CacheKeyConstants.CHAT_ROOM_BUFFER_SIZE - 1);
            redisTemplate.expire(cacheKey, Duration.ofHours(CacheKeyConstants.CHAT_ROOM_TTL_HOURS));
        } catch (Exception ex) {
            log.warn("Redis buffer push failed for key: {}. Error: {}", cacheKey, ex.getMessage());
        }
    }

    private List<MessageResponseDto> getMessagesFromRedisBuffer(Long conversationId, int size) {
        String cacheKey = CacheKeyConstants.CHAT_ROOM_PREFIX + conversationId;
        try {
            List<Object> rawList = redisTemplate.opsForList().range(cacheKey, 0, size - 1);
            if (rawList != null && !rawList.isEmpty()) {
                List<MessageResponseDto> dtos = new ArrayList<>();
                for (Object item : rawList) {
                    if (item instanceof MessageResponseDto) {
                        dtos.add((MessageResponseDto) item);
                    } else {
                        MessageResponseDto dto = objectMapper.convertValue(item, MessageResponseDto.class);
                        dtos.add(dto);
                    }
                }
                return dtos;
            }
        } catch (Exception ex) {
            log.warn("Redis buffer read failed for key: {}. Error: {}", cacheKey, ex.getMessage());
        }
        return null;
    }

    private void broadcastMessageViaWebSocket(Conversation conversation, MessageResponseDto responseDto, UserRole senderRole) {
        try {
            // 1. Broadcast message to specific room
            messagingTemplate.convertAndSend("/topic/chat/" + conversation.getId(), responseDto);

            // 2. Broadcast conversation summary update to admin stream
            long unreadForAdmin = messageRepository.countUnreadByConversationAndSenderRole(conversation.getId(), UserRole.USER);
            ConversationResponseDto convDto = MessageMapper.toConversationResponseDto(conversation, unreadForAdmin);
            messagingTemplate.convertAndSend("/topic/admin/conversations", convDto);
        } catch (Exception ex) {
            log.error("Failed to broadcast message via WebSocket", ex);
        }
    }
}
