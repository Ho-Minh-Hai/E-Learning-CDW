package com.example.demo.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    private UUID id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(name = "full_name")
    private String fullName;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Column(nullable = false)
    private String role; // 0 (Student), 1 (Teacher), 2 (Admin)

    @Column(name = "school")
    private String school;

    @Column(name = "last_sign_in_at")
    private OffsetDateTime lastSignInAt;

    @Column(name = "created_at", insertable = true, updatable = false, nullable = true)
    private OffsetDateTime createdAt;
}
