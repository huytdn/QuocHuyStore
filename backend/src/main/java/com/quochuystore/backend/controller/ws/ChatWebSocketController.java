package com.quochuystore.backend.controller.ws;

import com.quochuystore.backend.dto.message.request.ChatReadRequestDto;
import com.quochuystore.backend.dto.message.request.ChatTypingDto;
import com.quochuystore.backend.dto.message.request.MessageRequestDto;
import com.quochuystore.backend.security.UserPrincipal;
import com.quochuystore.backend.service.ChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
@RequiredArgsConstructor
@Slf4j
public class ChatWebSocketController {

    private final ChatService chatService;

    @MessageMapping("/chat.send")
    public void handleSendMessage(@Payload MessageRequestDto request, Principal principal) {
        UserPrincipal userPrincipal = extractUserPrincipal(principal);
        if (userPrincipal == null) {
            log.warn("Unauthorized STOMP /chat.send attempt");
            return;
        }

        log.info("STOMP message received from user: {}", userPrincipal.getId());
        chatService.sendMessage(userPrincipal, request);
    }

    @MessageMapping("/chat.read")
    public void handleMarkAsRead(@Payload ChatReadRequestDto request, Principal principal) {
        UserPrincipal userPrincipal = extractUserPrincipal(principal);
        if (userPrincipal == null || request == null || request.getConversationId() == null) {
            return;
        }

        log.info("STOMP mark-as-read received for conversation: {} from user: {}",
                request.getConversationId(), userPrincipal.getId());
        chatService.markConversationAsRead(userPrincipal, request.getConversationId());
    }

    @MessageMapping("/chat.typing")
    public void handleTyping(@Payload ChatTypingDto typingDto, Principal principal) {
        UserPrincipal userPrincipal = extractUserPrincipal(principal);
        if (userPrincipal == null || typingDto == null) {
            return;
        }

        chatService.broadcastTyping(userPrincipal, typingDto);
    }

    private UserPrincipal extractUserPrincipal(Principal principal) {
        if (principal instanceof Authentication authentication) {
            if (authentication.getPrincipal() instanceof UserPrincipal userPrincipal) {
                return userPrincipal;
            }
        }
        return null;
    }
}
