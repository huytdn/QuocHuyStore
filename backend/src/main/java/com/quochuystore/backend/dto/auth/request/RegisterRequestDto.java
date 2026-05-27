package com.quochuystore.backend.dto.auth.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterRequestDto {
    @NotBlank(message = "Username is required")
    @Size(max = 30, message = "Username must be at most 30 characters")
    private String username;

    @NotBlank(message = "Password is required")
    @Size(min = 6, max = 255, message = "Password must be between 6 and 255 characters")
    private String password;

    @NotBlank(message = "Display name is required")
    @Size(max = 30, message = "Display name must be at most 30 characters")
    private String displayName;

    @NotBlank(message = "Phone number is required")
    @Size(max = 11, message = "Phone must be at most 11 characters")
    private String phone;
}
