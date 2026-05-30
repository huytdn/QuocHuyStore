package com.quochuystore.backend.service.base;

import com.quochuystore.backend.dto.PageResponseDto;
import com.quochuystore.backend.dto.auth.request.AddressRequestDto;
import com.quochuystore.backend.dto.auth.response.AddressResponseDto;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface AddressService {
    PageResponseDto<AddressResponseDto> getAddresses(UUID userId, Pageable pageable);

    AddressResponseDto createAddress(UUID userId, AddressRequestDto request);

    AddressResponseDto getAddress(UUID userId, UUID addressId);

    AddressResponseDto updateAddress(UUID userId, UUID addressId, AddressRequestDto request);

    void deleteAddress(UUID userId, UUID addressId);
}
