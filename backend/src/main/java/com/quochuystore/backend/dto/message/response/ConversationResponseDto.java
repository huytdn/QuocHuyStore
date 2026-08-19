package com.quochuystore.backend.dto.message.response;

import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConversationResponseDto {

    private Long id;
    private UUID userId;
    private String username;
    private String userDisplayName;
    private String lastMessage;
    private Long unreadCount;
    private OffsetDateTime adminLastSeenAt;
    private OffsetDateTime userLastSeenAt;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
