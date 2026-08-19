package com.quochuystore.backend.dto.message.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatTypingDto {

    @NotNull(message = "Conversation ID is required")
    private Long conversationId;

    @NotNull(message = "isTyping flag is required")
    private Boolean isTyping;

    private String userDisplayName;
}
