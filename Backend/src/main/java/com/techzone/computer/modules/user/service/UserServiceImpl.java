package com.techzone.computer.modules.user.service;

import com.techzone.computer.modules.user.dto.AuthRequest;
import com.techzone.computer.modules.user.dto.AuthResponse;
import com.techzone.computer.modules.user.dto.RegisterRequest;
import com.techzone.computer.modules.user.dto.UserDto;
import com.techzone.computer.modules.user.entity.User;
import com.techzone.computer.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional(readOnly = true)
    public AuthResponse login(AuthRequest req) {
        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Email hoặc mật khẩu không chính xác"));

        if (user.getPasswordHash() != null && !passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {
            // Fallback for simple demo text password comparison
            if (!req.getPassword().equals(user.getPasswordHash())) {
                throw new IllegalArgumentException("Email hoặc mật khẩu không chính xác");
            }
        }

        String token = "tz_" + UUID.randomUUID().toString().replace("-", "");
        return AuthResponse.builder()
                .token(token)
                .user(toDto(user))
                .build();
    }

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new IllegalArgumentException("Email đã được đăng ký trong hệ thống");
        }

        User user = User.builder()
                .email(req.getEmail())
                .passwordHash(passwordEncoder.encode(req.getPassword()))
                .fullName(req.getFullName())
                .phone(req.getPhone())
                .membershipTier("Bạc")
                .points(100) // Welcome bonus points
                .role("CUSTOMER")
                .build();

        user = userRepository.save(user);
        String token = "tz_" + UUID.randomUUID().toString().replace("-", "");

        return AuthResponse.builder()
                .token(token)
                .user(toDto(user))
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public UserDto getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy thông tin tài khoản"));
        return toDto(user);
    }

    @Override
    @Transactional(readOnly = true)
    public UserDto getProfileByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy tài khoản với email: " + email));
        return toDto(user);
    }

    @Override
    @Transactional
    public UserDto addRewardPoints(Long userId, int points) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy tài khoản"));
        
        int newPoints = (user.getPoints() == null ? 0 : user.getPoints()) + points;
        user.setPoints(newPoints);

        // Update tier
        if (newPoints >= 2000) {
            user.setMembershipTier("Kim Cương");
        } else if (newPoints >= 500) {
            user.setMembershipTier("Vàng");
        } else {
            user.setMembershipTier("Bạc");
        }

        user = userRepository.save(user);
        return toDto(user);
    }

    private UserDto toDto(User u) {
        return UserDto.builder()
                .id(u.getId())
                .email(u.getEmail())
                .fullName(u.getFullName())
                .phone(u.getPhone())
                .membershipTier(u.getMembershipTier() != null ? u.getMembershipTier() : "Bạc")
                .points(u.getPoints() != null ? u.getPoints() : 0)
                .avatar(u.getAvatar())
                .role(u.getRole() != null ? u.getRole() : "CUSTOMER")
                .build();
    }
}
