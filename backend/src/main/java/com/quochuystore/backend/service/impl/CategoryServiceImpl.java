package com.quochuystore.backend.service.impl;

import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;
import com.quochuystore.backend.dto.PageResponseDto;
import com.quochuystore.backend.dto.product.request.CategoryRequestDto;
import com.quochuystore.backend.dto.product.response.CategoryResponseDto;
import com.quochuystore.backend.entity.Category;
import com.quochuystore.backend.exception.BadRequestException;
import com.quochuystore.backend.exception.ResourceNotFoundException;
import com.quochuystore.backend.repository.CategoryRepository;
import com.quochuystore.backend.repository.ProductRepository;
import com.quochuystore.backend.service.base.CategoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    private static final String CACHE_KEY = "qhs:categories:all";
    private static final long CACHE_TTL_HOURS = 24;

    @Override
    @Transactional(readOnly = true)
    public PageResponseDto<CategoryResponseDto> getCategories(String search, Pageable pageable) {
        log.info("Fetching categories pageable: {}, search: {}", pageable, search);
        List<CategoryResponseDto> allCategories = null;

        // 1. Try to fetch from Redis Cache
        try {
            String cachedJson = redisTemplate.opsForValue().get(CACHE_KEY);
            if (cachedJson != null) {
                log.info("Cache Hit for categories key: {}", CACHE_KEY);
                allCategories = objectMapper.readValue(cachedJson, new TypeReference<List<CategoryResponseDto>>() {
                });
            }
        } catch (Exception e) {
            log.error("Failed to read categories from Redis cache", e);
        }

        // 2. Cache Miss: fetch from database and write back to Redis
        if (allCategories == null) {
            log.info("Cache Miss for categories key: {}. Loading from database.", CACHE_KEY);
            List<Category> dbCategories = categoryRepository.findAll();
            allCategories = dbCategories.stream()
                    .map(this::mapToCategoryResponseDto)
                    .toList();

            try {
                String jsonToCache = objectMapper.writeValueAsString(allCategories);
                redisTemplate.opsForValue().set(CACHE_KEY, jsonToCache, CACHE_TTL_HOURS, TimeUnit.HOURS);
                log.info("Successfully populated categories cache key: {} with TTL of {} hours", CACHE_KEY,
                        CACHE_TTL_HOURS);
            } catch (Exception e) {
                log.error("Failed to write categories to Redis cache", e);
            }
        }

        // 3. Perform in-memory filtering based on search query
        List<CategoryResponseDto> filteredCategories = allCategories;
        if (search != null && !search.isBlank()) {
            String query = search.trim().toLowerCase();
            filteredCategories = allCategories.stream()
                    .filter(c -> c.getName() != null && c.getName().toLowerCase().contains(query))
                    .toList();
        }

        // 4. Perform in-memory pagination
        int totalElements = filteredCategories.size();
        int pageNo = pageable.getPageNumber();
        int pageSize = pageable.getPageSize();

        int fromIndex = Math.min(pageNo * pageSize, totalElements);
        int toIndex = Math.min(fromIndex + pageSize, totalElements);

        List<CategoryResponseDto> pageContent = (fromIndex < toIndex)
                ? filteredCategories.subList(fromIndex, toIndex)
                : Collections.emptyList();

        int totalPages = (pageSize > 0) ? (int) Math.ceil((double) totalElements / pageSize) : 0;
        boolean last = pageNo >= totalPages - 1;

        return PageResponseDto.<CategoryResponseDto>builder()
                .content(pageContent)
                .pageNo(pageNo)
                .pageSize(pageSize)
                .totalElements((long) totalElements)
                .totalPages(totalPages)
                .last(last)
                .build();
    }

    @Override
    @Transactional
    public CategoryResponseDto createCategory(CategoryRequestDto request) {
        log.info("Creating category with name: {}", request.getName());

        if (categoryRepository.existsByNameIgnoreCase(request.getName().trim())) {
            log.warn("Category creation failed: Name '{}' already exists", request.getName());
            throw new BadRequestException("Category name already exists");
        }

        Category category = Category.builder()
                .name(request.getName().trim())
                .build();

        Category savedCategory = categoryRepository.save(category);
        log.info("Successfully created category with id: {}", savedCategory.getId());

        // Evict Cache
        evictCache();

        return mapToCategoryResponseDto(savedCategory);
    }

    @Override
    @Transactional
    public CategoryResponseDto updateCategory(Long id, CategoryRequestDto request) {
        log.info("Updating category with id: {}, new name: {}", id, request.getName());

        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));

        if (categoryRepository.existsByNameIgnoreCaseAndIdNot(request.getName().trim(), id)) {
            log.warn("Category update failed: Name '{}' already exists on another category", request.getName());
            throw new BadRequestException("Category name already exists");
        }

        category.setName(request.getName().trim());
        Category updatedCategory = categoryRepository.save(category);
        log.info("Successfully updated category with id: {}", updatedCategory.getId());

        // Evict Cache
        evictCache();

        return mapToCategoryResponseDto(updatedCategory);
    }

    @Override
    @Transactional
    public void deleteCategory(Long id) {
        log.info("Hard deleting category with id: {}", id);

        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));

        // Check if there are active products in this category (is_active = true)
        boolean hasActiveProducts = productRepository.existsByCategoryIdAndIsActive(id, true);
        if (hasActiveProducts) {
            log.warn("Category deletion failed: Category {} contains active products", id);
            throw new BadRequestException("Cannot delete category because it contains active products");
        }

        categoryRepository.delete(category);
        log.info("Successfully deleted category with id: {}", id);

        // Evict Cache
        evictCache();
    }

    private void evictCache() {
        try {
            Boolean deleted = redisTemplate.delete(CACHE_KEY);
            if (Boolean.TRUE.equals(deleted)) {
                log.info("Successfully evicted categories cache key: {}", CACHE_KEY);
            } else {
                log.info("Categories cache key: {} was not present for eviction", CACHE_KEY);
            }
        } catch (Exception e) {
            log.error("Failed to evict categories cache key: {} from Redis", CACHE_KEY, e);
        }
    }

    private CategoryResponseDto mapToCategoryResponseDto(Category category) {
        return CategoryResponseDto.builder()
                .id(category.getId())
                .name(category.getName())
                .createdAt(category.getCreatedAt())
                .updatedAt(category.getUpdatedAt())
                .build();
    }
}
