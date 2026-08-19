package com.quochuystore.backend.controller;

import com.quochuystore.backend.dto.PageResponseDto;
import com.quochuystore.backend.dto.message.request.MessageRequestDto;
import com.quochuystore.backend.dto.message.response.ConversationResponseDto;
import com.quochuystore.backend.dto.message.response.MessageResponseDto;
import com.quochuystore.backend.security.UserPrincipal;
import com.quochuystore.backend.service.ChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/messages")
@RequiredArgsConstructor
@Slf4j
public class MessageController {

    private final ChatService chatService;

    @GetMapping("/my-conversation")
    public ResponseEntity<ConversationResponseDto> getMyConversation(
            @AuthenticationPrincipal UserPrincipal principal) {
        log.info("REST request to fetch my conversation for user: {}", principal.getId());
        ConversationResponseDto response = chatService.getOrCreateMyConversation(principal);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<PageResponseDto<MessageResponseDto>> getMessages(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) Long conversationId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        log.info("REST request to fetch messages. user: {}, conversationId: {}, page: {}, size: {}",
                principal.getId(), conversationId, page, size);
        PageResponseDto<MessageResponseDto> response = chatService.getMessages(principal, conversationId, page, size);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<MessageResponseDto> sendMessage(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody MessageRequestDto request) {
        log.info("REST request to send message from user: {}", principal.getId());
        MessageResponseDto response = chatService.sendMessage(principal, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PatchMapping("/{conversationId}/read")
    public ResponseEntity<Map<String, Object>> markAsRead(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long conversationId) {
        log.info("REST request to mark conversation {} as read by user: {}", conversationId, principal.getId());
        chatService.markConversationAsRead(principal, conversationId);
        return ResponseEntity.ok(Map.of("success", true, "message", "Marked as read"));
    }
}
