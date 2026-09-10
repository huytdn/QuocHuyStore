package com.quochuystore.backend.dto.embedding.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EmbedBatchFailureDto {
    private Long id;
    private String error;
}
