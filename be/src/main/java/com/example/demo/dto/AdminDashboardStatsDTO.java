package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AdminDashboardStatsDTO {
    private long totalUsers;
    private long totalClasses;
    private long totalPosts;
    private long totalComments;
}
