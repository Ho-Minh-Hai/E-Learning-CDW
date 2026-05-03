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

    @Transactional
    public Profile syncProfile(ProfileDTO profileDto) {
        return profileRepository.findById(profileDto.getId())
                .orElseGet(() -> {
                    Profile newProfile = Profile.builder()
                            .id(profileDto.getId())
                            .fullName(profileDto.getFullName())
                            .avatarUrl(profileDto.getAvatarUrl())
                            .role(profileDto.getRole() != null ? profileDto.getRole() : "user")
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
