package com.quochuystore.backend.service.base;

import com.quochuystore.backend.dto.auth.request.LoginRequestDto;
import com.quochuystore.backend.dto.auth.request.RefreshTokenRequestDto;
import com.quochuystore.backend.dto.auth.request.RegisterRequestDto;
import com.quochuystore.backend.dto.auth.response.TokenResponseDto;
import com.quochuystore.backend.dto.auth.response.UserResponseDto;

public interface AuthService {
    UserResponseDto register(RegisterRequestDto request);
    TokenResponseDto login(LoginRequestDto request);
    TokenResponseDto refresh(RefreshTokenRequestDto request);
}
