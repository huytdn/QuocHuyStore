package com.quochuystore.backend.dto.product.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ImageSearchResultDto {
    private ProductListResponseDto product;
    private Long colorId;
    private String colorName;
    private String colorImageUrl;
    private Double similarity;
}
