package com.example.demo.service;

import com.example.demo.model.UserStreak;
import com.example.demo.model.User;
import com.example.demo.repository.UserStreakRepository;
import com.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserStreakService {

    private final UserStreakRepository userStreakRepository;
    private final UserRepository userRepository;

    public UserStreak updateStreak(UUID userId) {
        // Kiểm tra User có tồn tại không
        if (!userRepository.existsById(userId)) {
            throw new RuntimeException("User không tồn tại với ID: " + userId);
        }

        Optional<UserStreak> streakOpt = userStreakRepository.findById(userId);
        LocalDate today = LocalDate.now();

        if (streakOpt.isPresent()) {
            UserStreak userStreak = streakOpt.get();
            LocalDate lastActive = userStreak.getLastActiveDate();

            if (lastActive != null && lastActive.equals(today)) {
                // Already updated today
                return userStreak;
            }

            if (lastActive != null && lastActive.equals(today.minusDays(1))) {
                // Active yesterday, increment streak
                if (userStreak.getStreak() > 0) {
                    userStreak.setStreak(userStreak.getStreak() + 1);
                } else {
                    userStreak.setStreak(1);
                }
            } else {
                // Streak broken or no prior activity
                userStreak.setStreak(1);
            }
            
            userStreak.setLastActiveDate(today);
            return userStreakRepository.save(userStreak);
        } else {
            // New user streak
            UserStreak newStreak = UserStreak.builder()
                    .userId(userId)
                    .streak(1)
                    .lastActiveDate(today)
                    .build();
            return userStreakRepository.save(newStreak);
        }
    }

    public UserStreak getStreak(UUID userId) {
        // Kiểm tra User có tồn tại không
        if (!userRepository.existsById(userId)) {
            throw new RuntimeException("User không tồn tại với ID: " + userId);
        }

        return userStreakRepository.findById(userId).orElseGet(() -> {
             UserStreak newStreak = UserStreak.builder().userId(userId).streak(0).lastActiveDate(null).build();
             return userStreakRepository.save(newStreak);
        });
    }
}
