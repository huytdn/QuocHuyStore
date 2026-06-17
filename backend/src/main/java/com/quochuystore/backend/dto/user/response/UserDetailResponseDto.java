package com.quochuystore.backend.dto.user.response;

import com.quochuystore.backend.entity.enums.UserRole;
import lombok.*;
import com.quochuystore.backend.dto.address.response.AddressResponseDto;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDetailResponseDto {
    private UUID id;
    private String username;
    private String displayName;
    private String phone;
    private UserRole role;
    private Boolean isActive;
    private OffsetDateTime createdAt;
    private List<AddressResponseDto> addresses;
}
