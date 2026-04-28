package com.cdw.elearning.service;

import com.cdw.elearning.dto.response.RoleResponse;

import java.util.List;

public interface RoleService {

    RoleResponse createRole(String name, String description);

    RoleResponse getRoleById(Long roleId);

    RoleResponse getRoleByName(String name);

    List<RoleResponse> getAllRoles();

    void deleteRole(Long roleId);
}