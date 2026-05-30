package com.quochuystore.backend.dto.user.response;

import com.quochuystore.backend.entity.enums.UserRole;
import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponseDto {
    private UUID id;
    private String username;
    private String displayName;
    private String phone;
    private UserRole role;
    private Boolean isActive;
}
