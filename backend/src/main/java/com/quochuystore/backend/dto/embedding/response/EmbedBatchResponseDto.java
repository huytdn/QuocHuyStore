package com.quochuystore.backend.dto.embedding.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EmbedBatchResponseDto {
    private List<EmbedBatchResultDto> results;
    private List<EmbedBatchFailureDto> failures;
}
