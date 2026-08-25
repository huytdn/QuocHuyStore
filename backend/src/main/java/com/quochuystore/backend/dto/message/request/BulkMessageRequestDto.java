package com.quochuystore.backend.dto.message.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BulkMessageRequestDto {

    @NotBlank(message = "Nội dung tin nhắn không được để trống")
    @Size(max = 2000, message = "Nội dung tin nhắn tối đa 2000 ký tự")
    private String content;

    @DecimalMin(value = "0.0", message = "Tổng tiền tối thiểu không được âm")
    @Builder.Default
    private BigDecimal minTotalSpent = BigDecimal.ZERO;
}
