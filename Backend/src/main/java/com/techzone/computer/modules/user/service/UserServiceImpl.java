package com.techzone.computer.modules.user.service;

import com.techzone.computer.common.security.TokenService;
import com.techzone.computer.modules.user.dto.AuthRequest;
import com.techzone.computer.modules.user.dto.AuthResponse;
import com.techzone.computer.modules.user.dto.RegisterRequest;
import com.techzone.computer.modules.user.dto.UserDto;
import com.techzone.computer.modules.user.entity.Customer;
import com.techzone.computer.modules.user.entity.User;
import com.techzone.computer.modules.user.repository.CustomerRepository;
import com.techzone.computer.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;
    private final TokenService tokenService;

    @Override
    @Transactional(readOnly = true)
    public AuthResponse login(AuthRequest req) {
        User user = userRepository.findByEmail(req.getEmail()).orElse(null);
        if (user != null) {
            if (user.getPasswordHash() == null || !passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {
                throw new IllegalArgumentException("Email hoặc mật khẩu không chính xác");
            }
            String token = tokenService.issue(user.getId(), user.getEmail(), resolveRole(user));
            return AuthResponse.builder()
                    .token(token)
                    .user(toDto(user))
                    .build();
        }

        Customer customer = customerRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Email hoặc mật khẩu không chính xác"));
        if (customer.getPasswordHash() == null || !passwordEncoder.matches(req.getPassword(), customer.getPasswordHash())) {
            throw new IllegalArgumentException("Email hoặc mật khẩu không chính xác");
        }

        String token = tokenService.issue(customer.getId(), customer.getEmail(), "CUSTOMER");
        return AuthResponse.builder()
                .token(token)
                .user(toDto(customer))
                .build();
    }

    private UserDto toDto(Customer customer) {
        return UserDto.builder()
                .id(customer.getId())
                .email(customer.getEmail())
                .fullName(customer.getFullName())
                .phone(customer.getPhone())
                .membershipTier(customer.getMembershipTier())
                .points(customer.getPoints())
                .avatar(customer.getAvatar())
                .role("CUSTOMER")
                .build();
    }

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail()) || customerRepository.existsByEmail(req.getEmail())) {
            throw new IllegalArgumentException("Email đã được đăng ký trong hệ thống");
        }

        Customer user = Customer.builder()
                .email(req.getEmail())
                .passwordHash(passwordEncoder.encode(req.getPassword()))
                .fullName(req.getFullName())
                .phone(req.getPhone())
                .membershipTier("Bạc")
                .points(100) // Welcome bonus points
                .build();

        user = customerRepository.save(user);
        String token = tokenService.issue(user.getId(), user.getEmail(), "CUSTOMER");

        return AuthResponse.builder()
                .token(token)
                .user(toDto(user))
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public UserDto getProfile(Long userId) {
        User internalUser = userRepository.findById(userId).orElse(null);
        if (internalUser != null) {
            return toDto(internalUser);
        }
        Customer customer = customerRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy thông tin tài khoản"));
        return toDto(customer);
    }

    @Override
    @Transactional(readOnly = true)
    public UserDto getProfileByEmail(String email) {
        User internalUser = userRepository.findByEmail(email).orElse(null);
        if (internalUser != null) {
            return toDto(internalUser);
        }
        Customer customer = customerRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy tài khoản với email: " + email));
        return toDto(customer);
    }

    @Override
    @Transactional
    public UserDto addRewardPoints(Long userId, int points) {
        Customer user = customerRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy khách hàng"));
        
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

        user = customerRepository.save(user);
        return toDto(user);
    }

    private String resolveRole(User user) {
        return user.getRole() != null ? user.getRole() : "CUSTOMER";
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
