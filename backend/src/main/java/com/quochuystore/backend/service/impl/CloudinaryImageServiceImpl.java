package com.quochuystore.backend.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.quochuystore.backend.service.base.ImageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class CloudinaryImageServiceImpl implements ImageService {

    private final Cloudinary cloudinary;

    @Override
    public Map<String, String> uploadImage(MultipartFile file) {
        try {
            log.info("Uploading image to Cloudinary: {}", file.getOriginalFilename());
            Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                    "folder", "qhstore"));

            return Map.of(
                    "url", uploadResult.get("secure_url").toString(),
                    "public_id", uploadResult.get("public_id").toString());
        } catch (IOException e) {
            log.error("Failed to upload image to Cloudinary", e);
            throw new RuntimeException("Image upload failed due to cloud service error");
        }
    }

    @Override
    public void deleteImage(String publicId) {
        try {
            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            log.info("Successfully deleted image from Cloudinary: {}", publicId);
        } catch (IOException e) {
            log.error("Failed to delete image from Cloudinary: {}", publicId, e);
        }
    }
}
