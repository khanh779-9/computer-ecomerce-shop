package com.techzone.computer.modules.user.service;

import com.techzone.computer.common.security.TokenService;
import com.techzone.computer.modules.user.dto.AuthRequest;
import com.techzone.computer.modules.user.dto.AuthResponse;
import com.techzone.computer.modules.user.dto.EmployeeRequest;
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

import java.util.List;
import java.util.NoSuchElementException;

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
            if ("LOCKED".equalsIgnoreCase(user.getStatus())) {
                throw new IllegalStateException("Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên.");
            }
            if (user.getPasswordHash() == null || !passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {
                throw new IllegalArgumentException("Email hoặc mật khẩu không chính xác");
            }
            user.setLastLoginAt(java.time.Instant.now());
            user = userRepository.save(user);
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
                .status(u.getStatus() != null ? u.getStatus() : "ACTIVE")
                .lastLoginAt(u.getLastLoginAt())
                .createdAt(u.getCreatedAt())
                .build();
    }

    // =============== EMPLOYEE MANAGEMENT (INTERNAL) ===============

    @Override
    @Transactional(readOnly = true)
    public List<UserDto> listEmployees() {
        return userRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toDto)
                .toList();
    }

    @Override
    @Transactional
    public UserDto createEmployee(EmployeeRequest req) {
        String email = req.email().trim().toLowerCase();
        if (userRepository.existsByEmail(email) || customerRepository.existsByEmail(email)) {
            throw new IllegalStateException("Email đã được sử dụng trong hệ thống");
        }
        if (req.password() == null || req.password().length() < 6) {
            throw new IllegalArgumentException("Mật khẩu phải có tối thiểu 6 ký tự");
        }

        User user = User.builder()
                .email(email)
                .passwordHash(passwordEncoder.encode(req.password()))
                .fullName(req.fullName().trim())
                .phone(req.phone())
                .role(req.role() != null && !req.role().isBlank() ? req.role().trim().toUpperCase() : "STAFF")
                .status("ACTIVE")
                .build();
        return toDto(userRepository.save(user));
    }

    @Override
    @Transactional
    public UserDto updateEmployee(Long id, EmployeeRequest req) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy nhân viên ID: " + id));

        String email = req.email().trim().toLowerCase();
        if (!user.getEmail().equalsIgnoreCase(email)
                && (userRepository.existsByEmail(email) || customerRepository.existsByEmail(email))) {
            throw new IllegalStateException("Email đã được sử dụng trong hệ thống");
        }
        user.setEmail(email);
        user.setFullName(req.fullName().trim());
        user.setPhone(req.phone());
        if (req.role() != null && !req.role().isBlank()) {
            user.setRole(req.role().trim().toUpperCase());
        }
        if (req.password() != null && !req.password().isBlank()) {
            if (req.password().length() < 6) {
                throw new IllegalArgumentException("Mật khẩu phải có tối thiểu 6 ký tự");
            }
            user.setPasswordHash(passwordEncoder.encode(req.password()));
        }
        return toDto(userRepository.save(user));
    }

    @Override
    @Transactional
    public UserDto setEmployeeStatus(Long id, String status) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy nhân viên ID: " + id));

        String normalized = status == null ? "" : status.trim().toUpperCase();
        if (!"ACTIVE".equals(normalized) && !"LOCKED".equals(normalized)) {
            throw new IllegalArgumentException("Trạng thái không hợp lệ (cho phép: ACTIVE, LOCKED)");
        }
        user.setStatus(normalized);
        return toDto(userRepository.save(user));
    }

    @Override
    @Transactional
    public void deleteEmployee(Long id) {
        if (!userRepository.existsById(id)) {
            throw new NoSuchElementException("Không tìm thấy nhân viên ID: " + id);
        }
        userRepository.deleteById(id);
    }
}
