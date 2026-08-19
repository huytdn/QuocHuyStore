package com.quochuystore.backend.dto.message.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MessageRequestDto {

    @Min(value = 1, message = "Conversation ID must be positive")
    private Long conversationId;

    private UUID receiverId;

    @NotBlank(message = "Message content must not be blank")
    @Size(max = 2000, message = "Message content cannot exceed 2000 characters")
    private String content;
}
