package com.quochuystore.backend.service;

import com.quochuystore.backend.dto.product.request.VariationRequestDto;
import com.quochuystore.backend.dto.product.request.VariationStockUpdateRequestDto;
import com.quochuystore.backend.dto.product.response.ProductVariationResponseDto;

public interface ProductVariationService {

    ProductVariationResponseDto createVariation(Long colorId, VariationRequestDto request);

    ProductVariationResponseDto updateVariation(Long id, VariationRequestDto request);

    ProductVariationResponseDto updateStock(Long id, VariationStockUpdateRequestDto request);

    void deleteVariation(Long id);
}
