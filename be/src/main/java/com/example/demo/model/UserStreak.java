package com.example.demo.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "user_streaks")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserStreak {
    @Id
    @Column(name = "user_id")
    private UUID userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    @JsonIgnore
    private User user;

    @Column(name = "streak")
    private int streak;

    @Column(name = "last_active_date")
    private LocalDate lastActiveDate;
}
