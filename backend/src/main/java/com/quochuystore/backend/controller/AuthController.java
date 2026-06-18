package com.quochuystore.backend.controller;

import com.quochuystore.backend.dto.auth.request.LoginRequestDto;
import com.quochuystore.backend.dto.auth.request.RefreshTokenRequestDto;
import com.quochuystore.backend.dto.auth.request.RegisterRequestDto;
import com.quochuystore.backend.dto.auth.response.LoginResult;
import com.quochuystore.backend.dto.auth.response.TokenResponseDto;
import com.quochuystore.backend.dto.user.response.UserResponseDto;
import com.quochuystore.backend.exception.BadRequestException;
import com.quochuystore.backend.security.UserPrincipal;
import com.quochuystore.backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @Value("${app.jwt.refresh-expiration-ms}")
    private long jwtRefreshExpirationInMs;

    @PostMapping("/register")
    public ResponseEntity<UserResponseDto> register(@Valid @RequestBody RegisterRequestDto request) {
        UserResponseDto response = authService.register(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<TokenResponseDto> login(@Valid @RequestBody LoginRequestDto request) {
        LoginResult result = authService.login(request);
        
        ResponseCookie cookie = ResponseCookie.from("refreshToken", result.getRefreshToken())
                .httpOnly(true)
                .secure(true)
                .path("/api/v1/auth")
                .maxAge(jwtRefreshExpirationInMs / 1000)
                .sameSite("Strict")
                .build();

        TokenResponseDto responseBody = TokenResponseDto.builder()
                .accessToken(result.getAccessToken())
                .user(result.getUser())
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(responseBody);
    }

    @PostMapping("/refresh")
    public ResponseEntity<TokenResponseDto> refresh(
            @CookieValue(name = "refreshToken", required = false) String cookieRefreshToken,
            @RequestBody(required = false) RefreshTokenRequestDto requestBody) {
        
        String refreshToken = cookieRefreshToken;
        if (refreshToken == null && requestBody != null) {
            refreshToken = requestBody.getRefreshToken();
        }

        if (refreshToken == null || refreshToken.isBlank()) {
            throw new BadRequestException("Refresh token is required");
        }

        RefreshTokenRequestDto serviceRequest = new RefreshTokenRequestDto();
        serviceRequest.setRefreshToken(refreshToken);

        LoginResult result = authService.refresh(serviceRequest);

        ResponseCookie cookie = ResponseCookie.from("refreshToken", result.getRefreshToken())
                .httpOnly(true)
                .secure(true)
                .path("/api/v1/auth")
                .maxAge(jwtRefreshExpirationInMs / 1000)
                .sameSite("Strict")
                .build();

        TokenResponseDto responseBody = TokenResponseDto.builder()
                .accessToken(result.getAccessToken())
                .user(result.getUser())
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(responseBody);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@AuthenticationPrincipal UserPrincipal principal) {
        authService.logout(principal.getId());

        ResponseCookie cookie = ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .secure(true)
                .path("/api/v1/auth")
                .maxAge(0)
                .sameSite("Strict")
                .build();

        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .build();
    }
}
