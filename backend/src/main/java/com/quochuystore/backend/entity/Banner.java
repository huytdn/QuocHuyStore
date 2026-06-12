package com.quochuystore.backend.entity;

import com.quochuystore.backend.entity.enums.BannerPosition;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "banners")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Banner {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", updatable = false, nullable = false)
    private Long id;

    @Column(name = "title", nullable = false, length = 150)
    private String title;

    @Column(name = "image_url", nullable = false, columnDefinition = "TEXT")
    private String imageUrl;

    @Column(name = "image_public_id", nullable = false, columnDefinition = "TEXT")
    private String imagePublicId;

    @Column(name = "link_url", columnDefinition = "TEXT")
    private String linkUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "position", nullable = false, columnDefinition = "banner_position_enum")
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    private BannerPosition position;

    @Column(name = "priority", nullable = false)
    @Builder.Default
    private Integer priority = 0;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "start_at")
    private OffsetDateTime startAt;

    @Column(name = "end_at")
    private OffsetDateTime endAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
