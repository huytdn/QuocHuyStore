package com.quochuystore.backend.service.impl;

import com.quochuystore.backend.dto.mapper.UserMapper;
import com.quochuystore.backend.dto.user.request.UserUpdateRequestDto;
import com.quochuystore.backend.dto.user.response.UserDetailResponseDto;
import com.quochuystore.backend.dto.user.response.UserResponseDto;
import com.quochuystore.backend.entity.Address;
import com.quochuystore.backend.entity.User;
import com.quochuystore.backend.exception.ResourceNotFoundException;
import com.quochuystore.backend.repository.AddressRepository;
import com.quochuystore.backend.repository.RefreshTokenRepository;
import com.quochuystore.backend.repository.UserRepository;
import com.quochuystore.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final AddressRepository addressRepository;
    private final RefreshTokenRepository refreshTokenRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetailResponseDto getProfile(UUID userId) {
        log.info("Fetching profile details for user id: {}", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        List<Address> addresses = addressRepository.findByUser(user);
        return UserMapper.toUserDetailResponseDto(user, addresses);
    }

    @Override
    @Transactional
    public UserResponseDto updateProfile(UUID userId, UserUpdateRequestDto request) {
        log.info("Updating profile metadata for user id: {}", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        user.setDisplayName(request.getDisplayName());
        user.setPhone(request.getPhone());

        User updatedUser = userRepository.save(user);
        return UserMapper.toUserResponseDto(updatedUser);
    }

    @Override
    @Transactional
    public void softDelete(UUID userId) {
        log.info("Performing soft delete / deactivation for user id: {}", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        user.setIsActive(false);
        userRepository.save(user);

        // Revoke all active sessions for this user
        refreshTokenRepository.deleteByUser(user);
        log.info("User id: {} has been deactivated and refresh tokens revoked.", userId);
    }
}
