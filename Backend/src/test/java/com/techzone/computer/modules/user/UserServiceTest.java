package com.techzone.computer.modules.user;

import com.techzone.computer.common.security.TokenService;
import com.techzone.computer.modules.user.dto.AuthRequest;
import com.techzone.computer.modules.user.dto.RegisterRequest;
import com.techzone.computer.modules.user.entity.User;
import com.techzone.computer.modules.user.repository.UserRepository;
import com.techzone.computer.modules.user.service.UserServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {
    @Mock UserRepository userRepository;
    @Mock PasswordEncoder passwordEncoder;
    @Mock TokenService tokenService;

    @Test void registerAddsWelcomePointsAndIssuesToken() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("a@test.com"); request.setPassword("secret");
        request.setFullName("Test User"); request.setPhone("0900000000");
        when(userRepository.existsByEmail(request.getEmail())).thenReturn(false);
        when(passwordEncoder.encode("secret")).thenReturn("hashed");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> {
            User user = inv.getArgument(0); user.setId(1L); return user;
        });
        when(tokenService.issue(1L, "a@test.com", "CUSTOMER")).thenReturn("token");

        var result = new UserServiceImpl(userRepository, passwordEncoder, tokenService).register(request);

        assertEquals("token", result.getToken());
        assertEquals(100, result.getUser().getPoints());
        verify(passwordEncoder).encode("secret");
    }

    @Test void registerRejectsDuplicateEmail() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("a@test.com");
        when(userRepository.existsByEmail("a@test.com")).thenReturn(true);

        assertThrows(IllegalArgumentException.class,
                () -> new UserServiceImpl(userRepository, passwordEncoder, tokenService).register(request));
        verify(userRepository, never()).save(any());
    }

    @Test void loginRejectsWrongPassword() {
        User user = User.builder().id(1L).email("a@test.com").passwordHash("hash").build();
        AuthRequest request = new AuthRequest();
        request.setEmail("a@test.com"); request.setPassword("bad");
        when(userRepository.findByEmail("a@test.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("bad", "hash")).thenReturn(false);

        assertThrows(IllegalArgumentException.class,
                () -> new UserServiceImpl(userRepository, passwordEncoder, tokenService).login(request));
        verifyNoInteractions(tokenService);
    }

    @Test void rewardPointsUpdatesMembershipTier() {
        User user = User.builder().id(1L).email("a@test.com").points(490).membershipTier("Bạc").build();
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userRepository.save(user)).thenReturn(user);

        var result = new UserServiceImpl(userRepository, passwordEncoder, tokenService)
                .addRewardPoints(1L, 10);

        assertEquals(500, result.getPoints());
        assertEquals("Vàng", result.getMembershipTier());
    }
}
