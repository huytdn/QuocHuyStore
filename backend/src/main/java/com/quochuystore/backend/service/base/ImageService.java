package com.quochuystore.backend.service.base;

import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.Map;

public interface ImageService {
    Map<String, String> uploadImage(MultipartFile file);
    void deleteImage(String publicId);
}
