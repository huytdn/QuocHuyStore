package com.quochuystore.backend.dto.user.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserUpdateRequestDto {

    @NotBlank(message = "Display name is required")
    @Size(max = 30, message = "Display name must not exceed 30 characters")
    private String displayName;

    @NotBlank(message = "Phone number is required")
    @Size(max = 11, message = "Phone number must not exceed 11 characters")
    private String phone;
}
