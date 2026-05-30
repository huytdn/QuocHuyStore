package com.quochuystore.backend.service.base;

import com.quochuystore.backend.dto.product.request.VariationRequestDto;
import com.quochuystore.backend.dto.product.request.VariationStockUpdateRequestDto;
import com.quochuystore.backend.dto.product.response.ProductVariationResponseDto;

import java.util.List;

public interface ProductVariationService {

    ProductVariationResponseDto createVariation(Long colorId, VariationRequestDto request);

    ProductVariationResponseDto updateVariation(Long id, VariationRequestDto request);

    ProductVariationResponseDto updateStock(Long id, VariationStockUpdateRequestDto request);

    void deleteVariation(Long id);
}
