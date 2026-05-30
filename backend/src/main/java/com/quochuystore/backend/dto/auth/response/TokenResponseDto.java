package com.quochuystore.backend.dto.auth.response;

import com.quochuystore.backend.dto.user.response.UserResponseDto;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TokenResponseDto {
    private String accessToken;
    private String refreshToken;
    private UserResponseDto user;
}
