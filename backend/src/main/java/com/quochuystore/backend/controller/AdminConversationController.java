package com.quochuystore.backend.controller;

import com.quochuystore.backend.dto.PageResponseDto;
import com.quochuystore.backend.dto.message.request.BulkMessageRequestDto;
import com.quochuystore.backend.dto.message.response.BulkMessageResponseDto;
import com.quochuystore.backend.dto.message.response.ConversationResponseDto;
import com.quochuystore.backend.security.UserPrincipal;
import com.quochuystore.backend.service.ChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/conversations")
@RequiredArgsConstructor
@Slf4j
public class AdminConversationController {

    private final ChatService chatService;

    @GetMapping
    public ResponseEntity<PageResponseDto<ConversationResponseDto>> getConversations(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search) {
        log.info("REST request for admin conversations. page: {}, size: {}, search: {}", page, size, search);
        PageResponseDto<ConversationResponseDto> response = chatService.getAdminConversations(page, size, search);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/broadcast")
    public ResponseEntity<BulkMessageResponseDto> sendBulkMessage(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody BulkMessageRequestDto request) {
        log.info("REST request by ADMIN to broadcast message. minTotalSpent: {}", request.getMinTotalSpent());
        BulkMessageResponseDto response = chatService.sendBulkMessage(principal, request);
        return ResponseEntity.ok(response);
    }
}
