package com.quochuystore.backend.dto.embedding.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EmbedBatchResultDto {
    private Long id;
    private float[] embedding;
    private Boolean cropped;
}
