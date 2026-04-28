package com.cdw.elearning.modules.role.service.impl;

import com.cdw.elearning.modules.role.dto.response.RoleResponse;
import com.cdw.elearning.modules.role.entity.Role;
import com.cdw.elearning.common.exception.AppException;
import com.cdw.elearning.common.exception.ErrorCode;
import com.cdw.elearning.modules.role.mapper.RoleMapper;
import com.cdw.elearning.modules.role.repository.RoleRepository;
import com.cdw.elearning.modules.role.service.RoleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class RoleServiceImpl implements RoleService {

    private final RoleRepository roleRepository;
    private final RoleMapper roleMapper;

    @Override
    @Transactional
    public RoleResponse createRole(String name, String description) {
        if (roleRepository.existsByName(name)) {
            throw new AppException(ErrorCode.ROLE_ALREADY_ASSIGNED);
        }

        Role role = Role.builder()
                .name(name)
                .description(description)
                .build();

        Role savedRole = roleRepository.save(role);
        log.info("Created role with name: {}", name);

        return roleMapper.toResponse(savedRole);
    }

    @Override
    public RoleResponse getRoleById(Long roleId) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));

        return roleMapper.toResponse(role);
    }

    @Override
    public RoleResponse getRoleByName(String name) {
        Role role = roleRepository.findByName(name)
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));

        return roleMapper.toResponse(role);
    }

    @Override
    public List<RoleResponse> getAllRoles() {
        List<Role> roles = roleRepository.findAll();
        return roles.stream()
                .map(roleMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public void deleteRole(Long roleId) {
        if (!roleRepository.existsById(roleId)) {
            throw new AppException(ErrorCode.ROLE_NOT_FOUND);
        }

        roleRepository.deleteById(roleId);
        log.info("Deleted role with ID: {}", roleId);
    }
}