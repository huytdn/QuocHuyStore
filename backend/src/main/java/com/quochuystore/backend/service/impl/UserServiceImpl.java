package com.quochuystore.backend.service.impl;

import com.quochuystore.backend.dto.auth.request.UserUpdateRequestDto;
import com.quochuystore.backend.dto.auth.response.AddressResponseDto;
import com.quochuystore.backend.dto.auth.response.UserDetailResponseDto;
import com.quochuystore.backend.dto.auth.response.UserResponseDto;
import com.quochuystore.backend.entity.Address;
import com.quochuystore.backend.entity.User;
import com.quochuystore.backend.exception.ResourceNotFoundException;
import com.quochuystore.backend.repository.AddressRepository;
import com.quochuystore.backend.repository.RefreshTokenRepository;
import com.quochuystore.backend.repository.UserRepository;
import com.quochuystore.backend.service.base.UserService;
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
        return mapToUserDetailResponseDto(user, addresses);
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
        return mapToUserResponseDto(updatedUser);
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

    private AddressResponseDto mapToAddressResponseDto(Address address) {
        return AddressResponseDto.builder()
                .id(address.getId())
                .addressDetail(address.getAddressDetail())
                .receiverName(address.getReceiverName())
                .receiverPhone(address.getReceiverPhone())
                .isDefault(address.getIsDefault())
                .build();
    }

    private UserDetailResponseDto mapToUserDetailResponseDto(User user, List<Address> addresses) {
        List<AddressResponseDto> addressDtos = addresses.stream()
                .map(this::mapToAddressResponseDto)
                .toList();

        return UserDetailResponseDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .displayName(user.getDisplayName())
                .phone(user.getPhone())
                .role(user.getRole())
                .isActive(user.getIsActive())
                .createdAt(user.getCreatedAt())
                .addresses(addressDtos)
                .build();
    }

    private UserResponseDto mapToUserResponseDto(User user) {
        return UserResponseDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .displayName(user.getDisplayName())
                .phone(user.getPhone())
                .role(user.getRole())
                .isActive(user.getIsActive())
                .build();
    }
}
