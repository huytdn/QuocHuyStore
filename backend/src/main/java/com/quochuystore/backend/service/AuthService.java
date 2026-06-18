package com.quochuystore.backend.service;

import com.quochuystore.backend.dto.auth.request.LoginRequestDto;
import com.quochuystore.backend.dto.auth.request.RefreshTokenRequestDto;
import com.quochuystore.backend.dto.auth.request.RegisterRequestDto;
import com.quochuystore.backend.dto.auth.response.LoginResult;
import com.quochuystore.backend.dto.auth.response.TokenResponseDto;
import com.quochuystore.backend.dto.user.response.UserResponseDto;

public interface AuthService {
    UserResponseDto register(RegisterRequestDto request);

    LoginResult login(LoginRequestDto request);

    LoginResult refresh(RefreshTokenRequestDto request);

    void logout(java.util.UUID userId);
}
