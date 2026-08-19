package com.quochuystore.backend.dto.message.response;

import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatEventDto {

    public enum EventType {
        MESSAGE,
        TYPING,
        READ_RECEIPT
    }

    private EventType type;
    private Long conversationId;
    private UUID senderId;
    private String senderDisplayName;
    private Boolean isTyping;
    private OffsetDateTime readAt;
}
