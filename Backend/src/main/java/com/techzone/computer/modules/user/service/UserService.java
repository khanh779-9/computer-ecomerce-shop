package com.techzone.computer.modules.user.service;

import com.techzone.computer.modules.user.dto.AuthRequest;
import com.techzone.computer.modules.user.dto.AuthResponse;
import com.techzone.computer.modules.user.dto.EmployeeRequest;
import com.techzone.computer.modules.user.dto.RegisterRequest;
import com.techzone.computer.modules.user.dto.UserDto;

import java.util.List;

public interface UserService {
    AuthResponse login(AuthRequest req);
    AuthResponse register(RegisterRequest req);
    UserDto getProfile(Long userId);
    UserDto getProfileByEmail(String email);
    UserDto addRewardPoints(Long userId, int points);

    List<UserDto> listEmployees();
    UserDto createEmployee(EmployeeRequest req);
    UserDto updateEmployee(Long id, EmployeeRequest req);
    UserDto setEmployeeStatus(Long id, String status);
    void deleteEmployee(Long id);
}
