package com.quochuystore.backend.dto.mapper;

import com.quochuystore.backend.dto.message.response.ConversationResponseDto;
import com.quochuystore.backend.dto.message.response.MessageResponseDto;
import com.quochuystore.backend.entity.Conversation;
import com.quochuystore.backend.entity.Message;

public final class MessageMapper {

    private MessageMapper() {
    }

    public static MessageResponseDto toMessageResponseDto(Message message) {
        if (message == null) {
            return null;
        }

        return MessageResponseDto.builder()
                .id(message.getId())
                .conversationId(message.getConversation() != null ? message.getConversation().getId() : null)
                .senderId(message.getSender() != null ? message.getSender().getId() : null)
                .senderDisplayName(message.getSender() != null ? message.getSender().getDisplayName() : null)
                .senderRole(message.getSender() != null ? message.getSender().getRole() : null)
                .receiverId(message.getReceiver() != null ? message.getReceiver().getId() : null)
                .content(message.getContent())
                .isRead(message.getIsRead())
                .createdAt(message.getCreatedAt())
                .build();
    }

    public static ConversationResponseDto toConversationResponseDto(Conversation conversation, Long unreadCount) {
        if (conversation == null) {
            return null;
        }

        return ConversationResponseDto.builder()
                .id(conversation.getId())
                .userId(conversation.getUser() != null ? conversation.getUser().getId() : null)
                .username(conversation.getUser() != null ? conversation.getUser().getUsername() : null)
                .userDisplayName(conversation.getUser() != null ? conversation.getUser().getDisplayName() : null)
                .lastMessage(conversation.getLastMessage())
                .unreadCount(unreadCount != null ? unreadCount : 0L)
                .adminLastSeenAt(conversation.getAdminLastSeenAt())
                .userLastSeenAt(conversation.getUserLastSeenAt())
                .createdAt(conversation.getCreatedAt())
                .updatedAt(conversation.getUpdatedAt())
                .build();
    }
}
