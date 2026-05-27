package com.quochuystore.backend.service.impl;

import com.quochuystore.backend.dto.auth.request.LoginRequestDto;
import com.quochuystore.backend.dto.auth.request.RefreshTokenRequestDto;
import com.quochuystore.backend.dto.auth.request.RegisterRequestDto;
import com.quochuystore.backend.dto.auth.response.TokenResponseDto;
import com.quochuystore.backend.dto.auth.response.UserResponseDto;
import com.quochuystore.backend.entity.RefreshToken;
import com.quochuystore.backend.entity.User;
import com.quochuystore.backend.entity.enums.UserRole;
import com.quochuystore.backend.exception.BadRequestException;
import com.quochuystore.backend.exception.UnauthorizedException;
import com.quochuystore.backend.repository.RefreshTokenRepository;
import com.quochuystore.backend.repository.UserRepository;
import com.quochuystore.backend.security.JwtTokenProvider;
import com.quochuystore.backend.security.UserPrincipal;
import com.quochuystore.backend.service.base.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    @Value("${app.security.pepper}")
    private String pepperSecret;

    @Value("${app.jwt.refresh-expiration-ms}")
    private long jwtRefreshExpirationInMs;

    @Override
    @Transactional
    public UserResponseDto register(RegisterRequestDto request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username is already taken");
        }

        String processedPassword = request.getPassword() + pepperSecret;
        String hashedPassword = passwordEncoder.encode(processedPassword);

        User user = User.builder()
                .username(request.getUsername())
                .password(hashedPassword)
                .displayName(request.getDisplayName())
                .phone(request.getPhone())
                .role(UserRole.USER)
                .isActive(true)
                .build();

        User savedUser = userRepository.save(user);

        return mapToUserResponseDto(savedUser);
    }

    @Override
    @Transactional
    public TokenResponseDto login(LoginRequestDto request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new BadCredentialsException("Invalid username or password"));

        if (!Boolean.TRUE.equals(user.getIsActive())) {
            throw new DisabledException("Account is disabled/inactive");
        }

        String processedPassword = request.getPassword() + pepperSecret;
        if (!passwordEncoder.matches(processedPassword, user.getPassword())) {
            throw new BadCredentialsException("Invalid username or password");
        }

        UserPrincipal principal = UserPrincipal.create(user);
        String accessToken = tokenProvider.generateAccessToken(principal);
        String refreshTokenString = tokenProvider.generateRefreshToken(principal);

        RefreshToken refreshToken = RefreshToken.builder()
                .token(refreshTokenString)
                .user(user)
                .isUsed(false)
                .expiryDate(OffsetDateTime.now().plusSeconds(jwtRefreshExpirationInMs / 1000))
                .build();

        refreshTokenRepository.save(refreshToken);

        return TokenResponseDto.builder()
                .accessToken(accessToken)
                .refreshToken(refreshTokenString)
                .user(mapToUserResponseDto(user))
                .build();
    }

    @Override
    @Transactional
    public TokenResponseDto refresh(RefreshTokenRequestDto request) {
        String tokenStr = request.getRefreshToken();

        if (!tokenProvider.validateToken(tokenStr)) {
            throw new UnauthorizedException("Invalid refresh token");
        }

        RefreshToken storedToken = refreshTokenRepository.findByToken(tokenStr)
                .orElseThrow(() -> new UnauthorizedException("Refresh token not found"));

        User user = storedToken.getUser();

        // Check if token has been replayed
        if (Boolean.TRUE.equals(storedToken.getIsUsed())) {
            log.warn("Breach detected! Refresh token replay attack on user: {}", user.getUsername());
            refreshTokenRepository.deleteByUser(user);
            throw new UnauthorizedException("Session compromised. All sessions revoked. Please log in again.");
        }

        if (storedToken.getExpiryDate().isBefore(OffsetDateTime.now())) {
            throw new UnauthorizedException("Refresh token expired");
        }

        if (!Boolean.TRUE.equals(user.getIsActive())) {
            throw new UnauthorizedException("User account is inactive");
        }

        // Rotate token
        storedToken.setIsUsed(true);
        refreshTokenRepository.save(storedToken);

        UserPrincipal principal = UserPrincipal.create(user);
        String newAccessToken = tokenProvider.generateAccessToken(principal);
        String newRefreshTokenStr = tokenProvider.generateRefreshToken(principal);

        RefreshToken newRefreshToken = RefreshToken.builder()
                .token(newRefreshTokenStr)
                .user(user)
                .isUsed(false)
                .expiryDate(OffsetDateTime.now().plusSeconds(jwtRefreshExpirationInMs / 1000))
                .build();

        refreshTokenRepository.save(newRefreshToken);

        return TokenResponseDto.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshTokenStr)
                .user(mapToUserResponseDto(user))
                .build();
    }

    private UserResponseDto mapToUserResponseDto(User user) {
        return UserResponseDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .displayName(user.getDisplayName())
                .phone(user.getPhone())
                .role(user.getRole())
                .isActive(user.getIsActive())
                .build();
    }
}
