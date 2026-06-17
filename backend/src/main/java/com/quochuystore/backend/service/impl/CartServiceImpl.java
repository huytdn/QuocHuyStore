package com.quochuystore.backend.service.impl;

import com.quochuystore.backend.dto.mapper.CartMapper;
import com.quochuystore.backend.dto.order.request.CartItemQuantityUpdateRequestDto;
import com.quochuystore.backend.dto.order.request.CartItemRequestDto;
import com.quochuystore.backend.dto.order.response.CartItemResponseDto;
import com.quochuystore.backend.entity.CartItem;
import com.quochuystore.backend.entity.ProductVariation;
import com.quochuystore.backend.entity.User;
import com.quochuystore.backend.exception.BadRequestException;
import com.quochuystore.backend.exception.ResourceNotFoundException;
import com.quochuystore.backend.repository.CartItemRepository;
import com.quochuystore.backend.repository.ProductVariationRepository;
import com.quochuystore.backend.repository.UserRepository;
import com.quochuystore.backend.service.CartService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class CartServiceImpl implements CartService {

    private final CartItemRepository cartItemRepository;
    private final ProductVariationRepository productVariationRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<CartItemResponseDto> getCartItems(UUID userId) {
        log.info("Fetching cart items for user id: {}", userId);
        List<CartItem> cartItems = cartItemRepository.findByUserIdWithDetails(userId);
        return cartItems.stream()
                .map(CartMapper::toCartItemResponseDto)
                .toList();
    }

    @Override
    @Transactional
    public CartItemResponseDto addCartItem(UUID userId, CartItemRequestDto request) {
        log.info("Adding variation id: {} with quantity: {} for user: {}",
                request.getVariationId(), request.getQuantity(), userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        ProductVariation variation = productVariationRepository.findByIdWithDetails(request.getVariationId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Product variation not found with id: " + request.getVariationId()));

        // Validate variation, color, and product active status
        if (!variation.getIsActive() ||
                !variation.getProductColor().getIsActive() ||
                !variation.getProductColor().getProduct().getIsActive()) {
            log.warn("Variation id: {} is inactive or its color/product is inactive", request.getVariationId());
            throw new ResourceNotFoundException("Product variation is inactive or unavailable");
        }

        // Check if item already exists in user's cart
        CartItem cartItem = cartItemRepository.findByUserIdAndProductVariationIdWithDetails(userId, request.getVariationId())
                .orElse(null);

        int currentCartQty = (cartItem != null) ? cartItem.getQuantity() : 0;
        int targetQty = currentCartQty + request.getQuantity();

        // Check stock quantity limits
        if (targetQty > variation.getStockQuantity()) {
            log.warn("Requested quantity {} (current in cart: {}) exceeds stock {} for variation id: {}",
                    request.getQuantity(), currentCartQty, variation.getStockQuantity(), request.getVariationId());
            throw new BadRequestException(
                    "Requested quantity exceeds available stock (" + variation.getStockQuantity() + ")");
        }

        if (cartItem != null) {
            cartItem.setQuantity(targetQty);
        } else {
            cartItem = CartItem.builder()
                    .user(user)
                    .productVariation(variation)
                    .quantity(targetQty)
                    .build();
        }

        CartItem savedItem = cartItemRepository.save(cartItem);
        log.info("Successfully added/updated cart item id: {} for user id: {}", savedItem.getId(), userId);

        return CartMapper.toCartItemResponseDto(savedItem);
    }

    @Override
    @Transactional
    public CartItemResponseDto updateCartItemQuantity(UUID userId, UUID cartItemId,
            CartItemQuantityUpdateRequestDto request) {
        log.info("Updating cart item id: {} to quantity: {} for user id: {}", cartItemId, request.getQuantity(),
                userId);

        CartItem cartItem = cartItemRepository.findByIdWithDetails(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found with id: " + cartItemId));

        if (!cartItem.getUser().getId().equals(userId)) {
            log.warn("Security check failed: User {} attempted to access cart item {} belonging to a different user",
                    userId, cartItemId);
            throw new ResourceNotFoundException("Cart item not found with id: " + cartItemId);
        }

        ProductVariation variation = cartItem.getProductVariation();

        // Validate variation status
        if (!variation.getIsActive() ||
                !variation.getProductColor().getIsActive() ||
                !variation.getProductColor().getProduct().getIsActive()) {
            log.warn("Attempted to update cart item {} but product variation is inactive", cartItemId);
            throw new ResourceNotFoundException("Product variation is inactive or unavailable");
        }

        // Validate stock
        if (request.getQuantity() > variation.getStockQuantity()) {
            log.warn("Requested quantity {} exceeds stock {} for variation id: {}",
                    request.getQuantity(), variation.getStockQuantity(), variation.getId());
            throw new BadRequestException(
                    "Requested quantity exceeds available stock (" + variation.getStockQuantity() + ")");
        }

        cartItem.setQuantity(request.getQuantity());
        CartItem updatedItem = cartItemRepository.save(cartItem);
        log.info("Successfully updated quantity of cart item id: {} to {}", cartItemId, request.getQuantity());

        return CartMapper.toCartItemResponseDto(updatedItem);
    }

    @Override
    @Transactional
    public void deleteCartItem(UUID userId, UUID cartItemId) {
        log.info("Deleting cart item id: {} for user id: {}", cartItemId, userId);

        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found with id: " + cartItemId));

        if (!cartItem.getUser().getId().equals(userId)) {
            log.warn("Security check failed: User {} attempted to delete cart item {} belonging to a different user",
                    userId, cartItemId);
            throw new ResourceNotFoundException("Cart item not found with id: " + cartItemId);
        }

        cartItemRepository.delete(cartItem);
        log.info("Successfully deleted cart item id: {}", cartItemId);
    }
}
