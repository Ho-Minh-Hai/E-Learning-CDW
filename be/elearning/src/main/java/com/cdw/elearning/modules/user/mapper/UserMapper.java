package com.cdw.elearning.modules.user.mapper;

import com.cdw.elearning.modules.role.entity.Role;
import com.cdw.elearning.modules.user.dto.request.UserCreateRequest;
import com.cdw.elearning.modules.user.dto.request.UserUpdateRequest;
import com.cdw.elearning.modules.user.dto.response.UserResponse;
import com.cdw.elearning.modules.user.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.util.Set;
import java.util.stream.Collectors;

@Mapper(
    componentModel = "spring",
    nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface UserMapper {

    User toEntity(UserCreateRequest request);

    UserResponse toResponse(User user);

    void updateEntityFromRequest(UserUpdateRequest request, @MappingTarget User user);

    default Set<String> mapRolesToStrings(Set<Role> roles) {
        if (roles == null) {
            return null;
        }
        return roles.stream()
                .map(Role::getName)
                .collect(Collectors.toSet());
    }
}