package com.smartcrop.service;

import com.smartcrop.dto.AuthDtos.AuthResponse;
import com.smartcrop.dto.AuthDtos.LoginRequest;
import com.smartcrop.dto.AuthDtos.RegisterRequest;
import com.smartcrop.dto.AuthDtos.UserDto;
import com.smartcrop.exception.ApiExceptions;
import com.smartcrop.model.AppUser;
import com.smartcrop.model.Role;
import com.smartcrop.repository.UserRepository;
import com.smartcrop.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final JwtService jwt;

    @CacheEvict(value = "stats", allEntries = true)
    public AuthResponse register(RegisterRequest r) {
        String email = r.email().trim().toLowerCase();
        if (users.existsByEmail(email)) {
            throw new ApiExceptions.Conflict("An account with this email already exists");
        }
        AppUser u = new AppUser();
        u.setName(r.name().trim());
        u.setEmail(email);
        u.setPasswordHash(encoder.encode(r.password()));
        u.setRole(Role.FARMER);
        u.setState(r.state());
        u.setDistrict(r.district());
        u.setVillage(r.village());
        users.save(u);
        return new AuthResponse(jwt.generate(u), toDto(u));
    }

    public AuthResponse login(LoginRequest r) {
        AppUser u = users.findByEmail(r.email().trim().toLowerCase())
                .orElseThrow(() -> new ApiExceptions.Unauthorized("Invalid email or password"));
        if (!encoder.matches(r.password(), u.getPasswordHash())) {
            throw new ApiExceptions.Unauthorized("Invalid email or password");
        }
        return new AuthResponse(jwt.generate(u), toDto(u));
    }

    public UserDto me(Authentication auth) {
        return toDto(currentUser(auth));
    }

    public AppUser currentUser(Authentication auth) {
        return users.findByEmail(auth.getName())
                .orElseThrow(() -> new ApiExceptions.Unauthorized("Session is no longer valid"));
    }

    private UserDto toDto(AppUser u) {
        return new UserDto(u.getId(), u.getName(), u.getEmail(), u.getRole(),
                u.getState(), u.getDistrict(), u.getVillage());
    }
}
