package com.techzone.computer.modules.user.service;

import com.techzone.computer.modules.user.dto.AuthRequest;
import com.techzone.computer.modules.user.dto.AuthResponse;
import com.techzone.computer.modules.user.dto.RegisterRequest;
import com.techzone.computer.modules.user.dto.UserDto;

public interface UserService {
    AuthResponse login(AuthRequest req);
    AuthResponse register(RegisterRequest req);
    UserDto getProfile(Long userId);
    UserDto getProfileByEmail(String email);
    UserDto addRewardPoints(Long userId, int points);
}
