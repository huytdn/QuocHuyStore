package com.quochuystore.backend.dto.message.response;

import com.quochuystore.backend.entity.enums.UserRole;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MessageResponseDto {

    private Long id;
    private Long conversationId;
    private UUID senderId;
    private String senderDisplayName;
    private UserRole senderRole;
    private UUID receiverId;
    private String content;
    private Boolean isRead;
    private OffsetDateTime createdAt;
}
