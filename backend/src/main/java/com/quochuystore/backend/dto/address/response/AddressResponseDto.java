package com.quochuystore.backend.dto.address.response;

import lombok.*;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddressResponseDto {
    private UUID id;
    private String addressDetail;
    private String receiverName;
    private String receiverPhone;
    private Boolean isDefault;
}
