package com.cdw.elearning.exception;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum ErrorCode {

    // Common errors (1000-1999)
    UNCATEGORIZED_EXCEPTION(1000, "Uncategorized error"),
    INVALID_KEY(1001, "Invalid key"),
    USER_EXISTED(1002, "User already existed"),
    USER_NOT_EXISTED(1003, "User not existed"),
    EMAIL_EXISTED(1004, "Email already existed"),
    INVALID_PASSWORD(1005, "Invalid password"),
    UNAUTHENTICATED(1006, "Unauthenticated"),
    UNAUTHORIZED(1007, "Unauthorized"),

    // Role errors (2000-2999)
    ROLE_NOT_FOUND(2000, "Role not found"),
    ROLE_ALREADY_ASSIGNED(2001, "Role already assigned to user"),
    ROLE_ASSIGNMENT_FAILED(2002, "Failed to assign role to user"),

    // Validation errors (3000-3999)
    INVALID_PARAM(3000, "Invalid parameter"),
    MISSING_REQUIRED_FIELD(3001, "Missing required field"),

    // Database errors (4000-4999)
    DATABASE_ERROR(4000, "Database error"),
    ENTITY_NOT_FOUND(4001, "Entity not found"),

    // Authentication errors (5000-5999)
    TOKEN_EXPIRED(5000, "Token expired"),
    TOKEN_INVALID(5001, "Invalid token"),
    TOKEN_MISSING(5002, "Token missing");

    private final int code;
    private final String message;
}