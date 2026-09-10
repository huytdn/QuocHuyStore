package com.quochuystore.backend.dto.embedding.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EmbedBatchRequestDto {
    private List<EmbedBatchItemDto> items;
}
