package com.quochuystore.backend.service.base;

import com.quochuystore.backend.dto.auth.request.UserUpdateRequestDto;
import com.quochuystore.backend.dto.auth.response.UserDetailResponseDto;
import com.quochuystore.backend.dto.auth.response.UserResponseDto;

import java.util.UUID;

public interface UserService {
    UserDetailResponseDto getProfile(UUID userId);
    UserResponseDto updateProfile(UUID userId, UserUpdateRequestDto request);
    void softDelete(UUID userId);
}
