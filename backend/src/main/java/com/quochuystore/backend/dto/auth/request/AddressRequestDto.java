package com.quochuystore.backend.dto.auth.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddressRequestDto {

    @NotBlank(message = "Address detail is required")
    private String addressDetail;

    @NotBlank(message = "Receiver name is required")
    @Size(max = 50, message = "Receiver name must not exceed 50 characters")
    private String receiverName;

    @NotBlank(message = "Receiver phone is required")
    @Size(max = 11, message = "Receiver phone must not exceed 11 characters")
    private String receiverPhone;

    @NotNull(message = "isDefault flag is required")
    private Boolean isDefault;
}
