package com.quochuystore.backend.controller;

import com.quochuystore.backend.dto.order.request.CartItemQuantityUpdateRequestDto;
import com.quochuystore.backend.dto.order.request.CartItemRequestDto;
import com.quochuystore.backend.dto.order.response.CartItemResponseDto;
import com.quochuystore.backend.security.UserPrincipal;
import com.quochuystore.backend.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/cart")
@RequiredArgsConstructor
@Slf4j
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ResponseEntity<List<CartItemResponseDto>> getCartItems(
            @AuthenticationPrincipal UserPrincipal principal) {
        log.info("REST request to fetch cart items for user id: {}", principal.getId());
        List<CartItemResponseDto> response = cartService.getCartItems(principal.getId());
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<CartItemResponseDto> addCartItem(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CartItemRequestDto request) {
        log.info("REST request to add item to cart. user id: {}, variation id: {}, quantity: {}",
                principal.getId(), request.getVariationId(), request.getQuantity());
        CartItemResponseDto response = cartService.addCartItem(principal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PatchMapping("/{cartItemId}")
    public ResponseEntity<CartItemResponseDto> updateCartItemQuantity(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID cartItemId,
            @Valid @RequestBody CartItemQuantityUpdateRequestDto request) {
        log.info("REST request to update cart item quantity. user id: {}, cart item id: {}, new quantity: {}",
                principal.getId(), cartItemId, request.getQuantity());
        CartItemResponseDto response = cartService.updateCartItemQuantity(principal.getId(), cartItemId, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{cartItemId}")
    public ResponseEntity<Void> deleteCartItem(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID cartItemId) {
        log.info("REST request to delete cart item. user id: {}, cart item id: {}",
                principal.getId(), cartItemId);
        cartService.deleteCartItem(principal.getId(), cartItemId);
        return ResponseEntity.noContent().build();
    }
}
