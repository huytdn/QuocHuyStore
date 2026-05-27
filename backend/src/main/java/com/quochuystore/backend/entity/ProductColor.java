package com.quochuystore.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
    name = "product_colors",
    uniqueConstraints = @UniqueConstraint(name = "unique_prod_color_name", columnNames = {"product_id", "color_name"})
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductColor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", updatable = false, nullable = false)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "color_name", nullable = false, length = 30)
    private String colorName;

    @Column(name = "image_url", nullable = false, columnDefinition = "TEXT")
    private String imageUrl;

    @Column(name = "image_public_id", nullable = false, columnDefinition = "TEXT")
    private String imagePublicId;
}
