package com.quochuystore.backend.security;

import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;

public class ReactivatingAuthenticationProvider extends DaoAuthenticationProvider {

    public ReactivatingAuthenticationProvider(CustomUserDetailsService userDetailsService, PasswordEncoder passwordEncoder) {
        super(userDetailsService);
        this.setPasswordEncoder(passwordEncoder);
    }

    @Override
    public Authentication authenticate(Authentication authentication) throws AuthenticationException {
        Authentication auth = super.authenticate(authentication);
        UserDetails principal = (UserDetails) auth.getPrincipal();
        if (!principal.isEnabled()) {
            throw new DisabledException("Account is inactive/soft-deleted");
        }
        return auth;
    }
}
