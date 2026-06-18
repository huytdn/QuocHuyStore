package com.quochuystore.backend.dto.auth.response;

import com.quochuystore.backend.dto.user.response.UserResponseDto;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class LoginResult {
    private final String accessToken;
    private final String refreshToken;
    private final UserResponseDto user;
}
