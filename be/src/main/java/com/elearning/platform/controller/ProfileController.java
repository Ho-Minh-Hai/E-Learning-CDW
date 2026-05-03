package com.elearning.platform.controller;

import com.elearning.platform.dto.ProfileDTO;
import com.elearning.platform.entity.Profile;
import com.elearning.platform.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/profiles")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ProfileController {

    private final ProfileService profileService;

    @PostMapping("/sync")
    public ResponseEntity<Profile> syncProfile(@RequestBody ProfileDTO profileDto) {
        return ResponseEntity.ok(profileService.syncProfile(profileDto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Profile> getProfile(@PathVariable UUID id) {
        return ResponseEntity.ok(profileService.getProfile(id));
    }

    @GetMapping("/search")
    public ResponseEntity<List<Profile>> searchProfiles(@RequestParam String query) {
        return ResponseEntity.ok(profileService.searchProfiles(query));
    }
}
