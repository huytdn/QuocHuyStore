package com.quochuystore.backend.service;

import com.quochuystore.backend.dto.product.response.ImageSearchResponseDto;
import com.quochuystore.backend.security.UserPrincipal;
import org.springframework.web.multipart.MultipartFile;

public interface ImageSearchService {
    ImageSearchResponseDto searchByImage(MultipartFile file, Integer topK, String clientIp, UserPrincipal principal);
}
