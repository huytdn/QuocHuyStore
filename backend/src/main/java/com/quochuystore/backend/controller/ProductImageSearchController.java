package com.quochuystore.backend.controller;

import com.quochuystore.backend.dto.product.response.ImageSearchResponseDto;
import com.quochuystore.backend.security.UserPrincipal;
import com.quochuystore.backend.service.ImageSearchService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/products")
@RequiredArgsConstructor
@Slf4j
public class ProductImageSearchController {

    private final ImageSearchService imageSearchService;

    @PostMapping(value = "/search-by-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ImageSearchResponseDto> searchByImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam(required = false) Integer k,
            @AuthenticationPrincipal UserPrincipal principal,
            HttpServletRequest request) {
        String clientIp = extractClientIp(request);
        log.info("REST request to search products by image. user: {}, clientIp: {}",
                principal != null ? principal.getId() : "anonymous", clientIp);

        ImageSearchResponseDto response = imageSearchService.searchByImage(file, k, clientIp, principal);
        return ResponseEntity.ok(response);
    }

    private String extractClientIp(HttpServletRequest request) {
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            return forwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
