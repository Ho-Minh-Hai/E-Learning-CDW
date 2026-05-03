package com.elearning.platform.service;

import com.elearning.platform.dto.ProfileDTO;
import com.elearning.platform.entity.Profile;
import com.elearning.platform.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final ProfileRepository profileRepository;

    private String determineRoleFromEmail(String email) {
        if (email != null && email.toLowerCase().endsWith("@st.hcmuaf.edu.vn")) {
            return "teacher";
        }
        return "user";
    }

    @Transactional
    public Profile syncProfile(ProfileDTO profileDto) {
        String role = determineRoleFromEmail(profileDto.getEmail());

        return profileRepository.findById(profileDto.getId())
                .map(existing -> {
                    // Update existing profile
                    if (profileDto.getFullName() != null) existing.setFullName(profileDto.getFullName());
                    if (profileDto.getAvatarUrl() != null) existing.setAvatarUrl(profileDto.getAvatarUrl());
                    // Only update role if it was 'user' (don't downgrade admins/teachers manually set)
                    if (!"admin".equals(existing.getRole())) existing.setRole(role);
                    return profileRepository.save(existing);
                })
                .orElseGet(() -> {
                    // Create new profile
                    Profile newProfile = Profile.builder()
                            .id(profileDto.getId())
                            .fullName(profileDto.getFullName())
                            .avatarUrl(profileDto.getAvatarUrl())
                            .role(role)
                            .build();
                    return profileRepository.save(newProfile);
                });
    }

    public Profile getProfile(UUID id) {
        return profileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Profile not found"));
    }

    public List<Profile> searchProfiles(String query) {
        return profileRepository.findByFullNameContainingIgnoreCase(query);
    }
}
