package com.quochuystore.backend.service;

import com.quochuystore.backend.dto.user.request.UserUpdateRequestDto;
import com.quochuystore.backend.dto.user.response.UserDetailResponseDto;
import com.quochuystore.backend.dto.user.response.UserResponseDto;

import java.util.UUID;

public interface UserService {
    UserDetailResponseDto getProfile(UUID userId);

    UserResponseDto updateProfile(UUID userId, UserUpdateRequestDto request);

    void softDelete(UUID userId);
}
