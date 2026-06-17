package com.quochuystore.backend.controller;

import com.quochuystore.backend.dto.user.request.UserUpdateRequestDto;
import com.quochuystore.backend.dto.user.response.UserDetailResponseDto;
import com.quochuystore.backend.dto.user.response.UserResponseDto;
import com.quochuystore.backend.security.UserPrincipal;
import com.quochuystore.backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserDetailResponseDto> getProfile(@AuthenticationPrincipal UserPrincipal principal) {
        UserDetailResponseDto response = userService.getProfile(principal.getId());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/me")
    public ResponseEntity<UserResponseDto> updateProfile(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody UserUpdateRequestDto request) {
        UserResponseDto response = userService.updateProfile(principal.getId(), request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/me")
    public ResponseEntity<Void> softDelete(@AuthenticationPrincipal UserPrincipal principal) {
        userService.softDelete(principal.getId());
        return ResponseEntity.noContent().build();
    }
}
