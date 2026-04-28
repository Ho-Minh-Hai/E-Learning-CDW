package com.cdw.elearning.modules.user.service.impl;

import com.cdw.elearning.modules.role.dto.request.RoleAssignRequest;
import com.cdw.elearning.modules.user.dto.request.UserCreateRequest;
import com.cdw.elearning.modules.user.dto.request.UserUpdateRequest;
import com.cdw.elearning.modules.user.dto.response.UserResponse;
import com.cdw.elearning.modules.role.entity.Role;
import com.cdw.elearning.modules.user.entity.User;
import com.cdw.elearning.common.exception.AppException;
import com.cdw.elearning.common.exception.ErrorCode;
import com.cdw.elearning.modules.user.mapper.UserMapper;
import com.cdw.elearning.modules.role.repository.RoleRepository;
import com.cdw.elearning.modules.user.repository.UserRepository;
import com.cdw.elearning.modules.user.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public UserResponse createUser(UserCreateRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AppException(ErrorCode.EMAIL_EXISTED);
        }

        User user = userMapper.toEntity(request);
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        User savedUser = userRepository.save(user);
        log.info("Created user with email: {}", savedUser.getEmail());

        return userMapper.toResponse(savedUser);
    }

    @Override
    @Transactional
    public UserResponse updateUser(Long userId, UserUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new AppException(ErrorCode.EMAIL_EXISTED);
            }
        }

        userMapper.updateEntityFromRequest(request, user);
        User updatedUser = userRepository.save(user);
        log.info("Updated user with ID: {}", userId);

        return userMapper.toResponse(updatedUser);
    }

    @Override
    public UserResponse getUserById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        return userMapper.toResponse(user);
    }

    @Override
    public UserResponse getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        return userMapper.toResponse(user);
    }

    @Override
    public List<UserResponse> getAllUsers() {
        List<User> users = userRepository.findAllActiveUsers();
        return users.stream()
                .map(userMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        user.setIsDeleted(true);
        userRepository.save(user);
        log.info("Soft deleted user with ID: {}", userId);
    }

    @Override
    @Transactional
    public void assignRoles(RoleAssignRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        Set<Role> roles = roleRepository.findAllById(request.getRoleIds()).stream()
                .collect(java.util.stream.Collectors.toSet());

        if (roles.size() != request.getRoleIds().size()) {
            throw new AppException(ErrorCode.ROLE_NOT_FOUND);
        }

        user.setRoles(roles);
        userRepository.save(user);
        log.info("Assigned roles to user with ID: {}", request.getUserId());
    }

    @Override
    @Transactional
    public void removeRoles(Long userId, List<Long> roleIds) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        Set<Role> currentRoles = user.getRoles();
        currentRoles.removeIf(role -> roleIds.contains(role.getId()));

        userRepository.save(user);
        log.info("Removed roles from user with ID: {}", userId);
    }

    @Override
    @Transactional
    public void toggleUserStatus(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        user.setIsActive(!user.getIsActive());
        userRepository.save(user);
        log.info("Toggled status for user with ID: {}. New status: {}", userId, user.getIsActive());
    }
}