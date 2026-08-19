package com.quochuystore.backend.dto.message.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatReadRequestDto {

    @NotNull(message = "Conversation ID is required")
    private Long conversationId;
}
