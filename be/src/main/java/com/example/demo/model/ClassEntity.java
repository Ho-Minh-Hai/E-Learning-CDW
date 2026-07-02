package com.example.demo.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "classes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClassEntity {
    @Id
    @GeneratedValue(generator = "UUID")
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(nullable = false)
    @NotBlank(message = "name is required")
    @Size(max = 255, message = "name must be at most 255 characters")
    private String name;

    @Column(name = "teacher_id", nullable = false)
    @NotNull(message = "teacherId is required")
    private UUID teacherId;

    @Column(name = "join_code", unique = true, nullable = false, length = 20)
    @NotBlank(message = "joinCode is required")
    @Size(max = 20, message = "joinCode must be at most 20 characters")
    private String joinCode;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}
