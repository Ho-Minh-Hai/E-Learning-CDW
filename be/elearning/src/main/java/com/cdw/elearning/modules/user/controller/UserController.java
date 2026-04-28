package com.cdw.elearning.controller;

import com.cdw.elearning.dto.request.RoleAssignRequest;
import com.cdw.elearning.dto.request.UserCreateRequest;
import com.cdw.elearning.dto.request.UserUpdateRequest;
import com.cdw.elearning.dto.response.ApiResponse;
import com.cdw.elearning.dto.response.UserResponse;
import com.cdw.elearning.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<UserResponse> createUser(@Valid @RequestBody UserCreateRequest request) {
        UserResponse userResponse = userService.createUser(request);
        return ApiResponse.success("User created successfully", userResponse);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or #id == authentication.principal.id")
    public ApiResponse<UserResponse> getUserById(@PathVariable Long id) {
        UserResponse userResponse = userService.getUserById(id);
        return ApiResponse.success(userResponse);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<UserResponse>> getAllUsers() {
        List<UserResponse> users = userService.getAllUsers();
        return ApiResponse.success(users);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or #id == authentication.principal.id")
    public ApiResponse<UserResponse> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UserUpdateRequest request) {
        UserResponse userResponse = userService.updateUser(id, request);
        return ApiResponse.success("User updated successfully", userResponse);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
    }

    @PostMapping("/{id}/roles")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> assignRoles(@PathVariable Long id, @Valid @RequestBody RoleAssignRequest request) {
        request.setUserId(id);
        userService.assignRoles(request);
        return ApiResponse.success("Roles assigned successfully", null);
    }

    @DeleteMapping("/{id}/roles")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> removeRoles(
            @PathVariable Long id,
            @RequestBody List<Long> roleIds) {
        userService.removeRoles(id, roleIds);
        return ApiResponse.success("Roles removed successfully", null);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> toggleUserStatus(@PathVariable Long id) {
        userService.toggleUserStatus(id);
        return ApiResponse.success("User status toggled successfully", null);
    }
}