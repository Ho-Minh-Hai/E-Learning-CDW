package com.cdw.elearning.mapper;

import com.cdw.elearning.dto.response.RoleResponse;
import com.cdw.elearning.entity.Role;
import org.mapstruct.Mapper;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(
    componentModel = "spring",
    nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface RoleMapper {

    RoleResponse toResponse(Role role);
}