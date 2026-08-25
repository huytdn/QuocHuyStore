package com.quochuystore.backend.dto.message.response;

import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BulkMessageResponseDto {
    private Integer totalSent;
    private BigDecimal minTotalSpent;
    private String content;
    private OffsetDateTime sentAt;
}
