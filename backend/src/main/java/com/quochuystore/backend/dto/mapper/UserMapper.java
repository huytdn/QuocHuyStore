package com.quochuystore.backend.dto.mapper;

import com.quochuystore.backend.dto.address.response.AddressResponseDto;
import com.quochuystore.backend.dto.user.response.UserDetailResponseDto;
import com.quochuystore.backend.dto.user.response.UserResponseDto;
import com.quochuystore.backend.entity.Address;
import com.quochuystore.backend.entity.User;

import java.util.List;

public final class UserMapper {
    private UserMapper() {
    }

    public static UserResponseDto toUserResponseDto(User user) {
        return UserResponseDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .displayName(user.getDisplayName())
                .phone(user.getPhone())
                .role(user.getRole())
                .isActive(user.getIsActive())
                .build();
    }

    public static UserDetailResponseDto toUserDetailResponseDto(User user, List<Address> addresses) {
        List<AddressResponseDto> addressDtos = addresses.stream()
                .map(UserMapper::toAddressResponseDto)
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

    public static AddressResponseDto toAddressResponseDto(Address address) {
        return AddressResponseDto.builder()
                .id(address.getId())
                .addressDetail(address.getAddressDetail())
                .receiverName(address.getReceiverName())
                .receiverPhone(address.getReceiverPhone())
                .isDefault(address.getIsDefault())
                .build();
    }
}
