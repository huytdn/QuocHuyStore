package com.quochuystore.backend.dto.mapper;

import com.quochuystore.backend.dto.order.response.CartItemResponseDto;
import com.quochuystore.backend.entity.CartItem;
import com.quochuystore.backend.entity.ProductColor;
import com.quochuystore.backend.entity.ProductVariation;

import java.math.BigDecimal;

public final class CartMapper {

    private CartMapper() {
    }

    public static CartItemResponseDto toCartItemResponseDto(CartItem cartItem) {
        if (cartItem == null) {
            return null;
        }

        ProductVariation variation = cartItem.getProductVariation();
        ProductColor color = variation != null ? variation.getProductColor() : null;
        String productName = (color != null && color.getProduct() != null) ? color.getProduct().getName() : null;
        String colorName = color != null ? color.getColorName() : null;
        String imageUrl = color != null ? color.getImageUrl() : null;
        String size = variation != null ? variation.getSize() : null;
        BigDecimal unitPrice = variation != null ? variation.getUnitPrice() : BigDecimal.ZERO;
        Integer quantity = cartItem.getQuantity() != null ? cartItem.getQuantity() : 0;
        BigDecimal totalItemPrice = unitPrice.multiply(BigDecimal.valueOf(quantity));

        return CartItemResponseDto.builder()
                .cartItemId(cartItem.getId())
                .variationId(variation != null ? variation.getId() : null)
                .productName(productName)
                .colorName(colorName)
                .size(size)
                .imageUrl(imageUrl)
                .unitPrice(unitPrice)
                .quantity(quantity)
                .totalItemPrice(totalItemPrice)
                .build();
    }
}
