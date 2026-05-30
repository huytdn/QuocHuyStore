package com.quochuystore.backend.dto.product.response;

import lombok.*;
import java.time.OffsetDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryResponseDto {
    private Long id;
    private String name;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
