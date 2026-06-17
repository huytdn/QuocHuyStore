package com.quochuystore.backend.service;

import com.quochuystore.backend.dto.order.request.CartItemQuantityUpdateRequestDto;
import com.quochuystore.backend.dto.order.request.CartItemRequestDto;
import com.quochuystore.backend.dto.order.response.CartItemResponseDto;

import java.util.List;
import java.util.UUID;

public interface CartService {
    List<CartItemResponseDto> getCartItems(UUID userId);

    CartItemResponseDto addCartItem(UUID userId, CartItemRequestDto request);

    CartItemResponseDto updateCartItemQuantity(UUID userId, UUID cartItemId, CartItemQuantityUpdateRequestDto request);

    void deleteCartItem(UUID userId, UUID cartItemId);
}
