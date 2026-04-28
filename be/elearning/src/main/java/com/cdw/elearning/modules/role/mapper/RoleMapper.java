package com.cdw.elearning.modules.role.mapper;

import com.cdw.elearning.modules.role.dto.response.RoleResponse;
import com.cdw.elearning.modules.role.entity.Role;
import org.mapstruct.Mapper;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(
    componentModel = "spring",
    nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface RoleMapper {

    RoleResponse toResponse(Role role);
}