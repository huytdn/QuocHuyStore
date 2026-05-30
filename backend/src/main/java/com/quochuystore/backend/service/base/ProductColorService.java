package com.quochuystore.backend.service.base;

import com.quochuystore.backend.dto.product.response.ProductColorResponseDto;
import org.springframework.web.multipart.MultipartFile;

public interface ProductColorService {

    ProductColorResponseDto createColor(Long productId, String colorName, MultipartFile file);

    ProductColorResponseDto updateColor(Long id, String colorName, MultipartFile file);

    void deleteColor(Long id);
}
