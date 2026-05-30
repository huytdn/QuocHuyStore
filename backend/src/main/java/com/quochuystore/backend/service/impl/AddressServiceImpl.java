package com.quochuystore.backend.service.impl;

import com.quochuystore.backend.dto.PageResponseDto;
import com.quochuystore.backend.dto.address.request.AddressRequestDto;
import com.quochuystore.backend.dto.address.response.AddressResponseDto;
import com.quochuystore.backend.dto.mapper.UserMapper;
import com.quochuystore.backend.entity.Address;
import com.quochuystore.backend.entity.User;
import com.quochuystore.backend.exception.ResourceNotFoundException;
import com.quochuystore.backend.repository.AddressRepository;
import com.quochuystore.backend.repository.UserRepository;
import com.quochuystore.backend.service.AddressService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AddressServiceImpl implements AddressService {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public PageResponseDto<AddressResponseDto> getAddresses(UUID userId, Pageable pageable) {
        log.info("Fetching paginated addresses for user id: {}", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        // Enforce sorting strictly by isDefault DESC
        Pageable sortedPageable = PageRequest.of(
                pageable.getPageNumber(),
                pageable.getPageSize(),
                Sort.by(Sort.Direction.DESC, "isDefault"));

        Page<Address> addressPage = addressRepository.findByUser(user, sortedPageable);

        List<AddressResponseDto> content = addressPage.getContent().stream()
                .map(UserMapper::toAddressResponseDto)
                .toList();

        return PageResponseDto.<AddressResponseDto>builder()
                .content(content)
                .pageNo(addressPage.getNumber())
                .pageSize(addressPage.getSize())
                .totalElements(addressPage.getTotalElements())
                .totalPages(addressPage.getTotalPages())
                .last(addressPage.isLast())
                .build();
    }

    @Override
    @Transactional
    public AddressResponseDto createAddress(UUID userId, AddressRequestDto request) {
        log.info("Creating new address for user id: {}", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (request.getIsDefault()) {
            addressRepository.resetDefaultByUser(user);
        }

        Address address = Address.builder()
                .user(user)
                .addressDetail(request.getAddressDetail())
                .receiverName(request.getReceiverName())
                .receiverPhone(request.getReceiverPhone())
                .isDefault(request.getIsDefault())
                .build();

        Address savedAddress = addressRepository.save(address);
        log.info("Successfully created address with id: {} for user: {}", savedAddress.getId(), userId);
        return UserMapper.toAddressResponseDto(savedAddress);
    }

    @Override
    @Transactional(readOnly = true)
    public AddressResponseDto getAddress(UUID userId, UUID addressId) {
        log.info("Fetching address with id: {} for user id: {}", addressId, userId);
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found with id: " + addressId));

        if (!address.getUser().getId().equals(userId)) {
            log.warn("Security check failed: User {} attempted to access address {} belonging to a different user",
                    userId, addressId);
            throw new ResourceNotFoundException("Address not found with id: " + addressId);
        }

        return UserMapper.toAddressResponseDto(address);
    }

    @Override
    @Transactional
    public AddressResponseDto updateAddress(UUID userId, UUID addressId, AddressRequestDto request) {
        log.info("Updating address with id: {} for user id: {}", addressId, userId);
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found with id: " + addressId));

        if (!address.getUser().getId().equals(userId)) {
            log.warn("Security check failed: User {} attempted to update address {} belonging to a different user",
                    userId, addressId);
            throw new ResourceNotFoundException("Address not found with id: " + addressId);
        }

        if (request.getIsDefault()) {
            addressRepository.resetDefaultByUser(address.getUser());
        }

        address.setAddressDetail(request.getAddressDetail());
        address.setReceiverName(request.getReceiverName());
        address.setReceiverPhone(request.getReceiverPhone());
        address.setIsDefault(request.getIsDefault());

        Address updatedAddress = addressRepository.save(address);
        log.info("Successfully updated address with id: {} for user: {}", updatedAddress.getId(), userId);
        return UserMapper.toAddressResponseDto(updatedAddress);
    }

    @Override
    @Transactional
    public void deleteAddress(UUID userId, UUID addressId) {
        log.info("Hard deleting address with id: {} for user id: {}", addressId, userId);
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found with id: " + addressId));

        if (!address.getUser().getId().equals(userId)) {
            log.warn("Security check failed: User {} attempted to delete address {} belonging to a different user",
                    userId, addressId);
            throw new ResourceNotFoundException("Address not found with id: " + addressId);
        }

        addressRepository.delete(address);
        log.info("Successfully deleted address with id: {} from database", addressId);
    }

}
