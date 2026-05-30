package com.quochuystore.backend.controller;

import com.quochuystore.backend.service.base.ImageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.MediaType;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/images")
@RequiredArgsConstructor
public class ImageController {

    private final ImageService imageService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> uploadImage(
            @RequestPart(value = "file", required = false) MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        Map<String, String> result = imageService.uploadImage(file);
        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/{publicId}")
    public ResponseEntity<Void> deleteImage(
            @PathVariable String publicId) {
        imageService.deleteImage(publicId);
        return ResponseEntity.ok().build();
    }
}
