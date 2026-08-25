package com.quochuystore.backend.dto.user.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminUserListItemDto {
    private UUID id;
    private String username;
    private String displayName;
    private String phone;
    private BigDecimal totalSpent;
    private Boolean isActive;
    private OffsetDateTime createdAt;
}
