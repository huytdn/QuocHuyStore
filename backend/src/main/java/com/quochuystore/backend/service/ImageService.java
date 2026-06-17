package com.quochuystore.backend.service;

import org.springframework.web.multipart.MultipartFile;
import java.util.Map;

public interface ImageService {
    Map<String, String> uploadImage(MultipartFile file);

    void deleteImage(String publicId);
}
