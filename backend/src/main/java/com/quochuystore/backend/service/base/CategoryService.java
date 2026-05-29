package com.quochuystore.backend.service.base;

import com.quochuystore.backend.dto.PageResponseDto;
import com.quochuystore.backend.dto.product.request.CategoryRequestDto;
import com.quochuystore.backend.dto.product.response.CategoryResponseDto;
import org.springframework.data.domain.Pageable;

public interface CategoryService {
    PageResponseDto<CategoryResponseDto> getCategories(String search, Pageable pageable);
    CategoryResponseDto createCategory(CategoryRequestDto request);
    CategoryResponseDto updateCategory(Long id, CategoryRequestDto request);
    void deleteCategory(Long id);
}
