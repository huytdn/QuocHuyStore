package com.quochuystore.backend.service;

import java.util.Map;

public interface EmbeddingService {
    float[] embedImage(byte[] imageBytes, String filename);

    /**
     * Embeds each image URL, keyed by an arbitrary caller-supplied id (the color id in
     * practice). Entries that fail on the AI service side are logged and simply absent
     * from the returned map — a partial batch failure never throws.
     */
    Map<Long, float[]> embedImageUrls(Map<Long, String> imageUrlsById);

    String toVectorLiteral(float[] embedding);
}
