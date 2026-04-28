package com.cdw.elearning.mapper;

import com.cdw.elearning.dto.request.UserCreateRequest;
import com.cdw.elearning.dto.request.UserUpdateRequest;
import com.cdw.elearning.dto.response.UserResponse;
import com.cdw.elearning.entity.User;
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

    default Set<String> mapRolesToStrings(Set<com.cdw.elearning.entity.Role> roles) {
        if (roles == null) {
            return null;
        }
        return roles.stream()
                .map(com.cdw.elearning.entity.Role::getName)
                .collect(Collectors.toSet());
    }
}