package com.quochuystore.backend.service;

import com.quochuystore.backend.dto.PageResponseDto;
import com.quochuystore.backend.dto.message.request.ChatTypingDto;
import com.quochuystore.backend.dto.message.request.MessageRequestDto;
import com.quochuystore.backend.dto.message.response.ConversationResponseDto;
import com.quochuystore.backend.dto.message.response.MessageResponseDto;
import com.quochuystore.backend.security.UserPrincipal;

public interface ChatService {

    MessageResponseDto sendMessage(UserPrincipal principal, MessageRequestDto request);

    PageResponseDto<MessageResponseDto> getMessages(UserPrincipal principal, Long conversationId, int page, int size);

    ConversationResponseDto getOrCreateMyConversation(UserPrincipal principal);

    PageResponseDto<ConversationResponseDto> getAdminConversations(int page, int size, String search);

    void markConversationAsRead(UserPrincipal principal, Long conversationId);

    void broadcastTyping(UserPrincipal principal, ChatTypingDto typingDto);
}
