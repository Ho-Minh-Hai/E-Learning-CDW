package com.example.demo.service;

import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public User processUserLogin(UUID id, String email, String fullName, String avatarUrl, java.time.OffsetDateTime lastSignInAt) {
        if (id == null) {
            throw new IllegalArgumentException("Thiếu ID người dùng từ Supabase.");
        }
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Thiếu email người dùng từ Supabase.");
        }

        String normalizedEmail = email.trim().toLowerCase();
        String resolvedFullName = resolveFullName(fullName, normalizedEmail);
        Optional<User> existingUser = userRepository.findById(id);

        if (existingUser.isPresent()) {
            User user = existingUser.get();
            user.setFullName(resolvedFullName);
            user.setEmail(normalizedEmail);
            user.setLastSignInAt(lastSignInAt);
            
            // Chỉ cập nhật avatar từ Google nếu trong DB hiện đang trống hoặc chưa có avatar
            if (user.getAvatarUrl() == null || user.getAvatarUrl().isEmpty()) {
                user.setAvatarUrl(avatarUrl);
            }
            
            return userRepository.save(user);
        }

        userRepository.findByEmail(normalizedEmail).ifPresent(user -> {
            throw new IllegalArgumentException("Email đã tồn tại trong hệ thống với ID khác. Hãy kiểm tra dữ liệu bảng users: " + normalizedEmail);
        });

        // đuôi email sau @ là st.hcmuaf.edu.vn thì role = "1", ngược lại role = "0"
        String role = "0";
        if (normalizedEmail.contains("@")) {
            String domain = normalizedEmail.substring(normalizedEmail.indexOf("@") + 1);
            if ("st.hcmuaf.edu.vn".equalsIgnoreCase(domain)) {
                role = "1";
            }
        }

        User newUser = User.builder()
                .id(id)
                .email(normalizedEmail)
                .fullName(resolvedFullName)
                .avatarUrl(avatarUrl)
                .lastSignInAt(lastSignInAt)
                .role(role)
                .build();

        return userRepository.save(newUser);
    }

    private String resolveFullName(String fullName, String email) {
        if (fullName != null && !fullName.isBlank()) {
            return fullName.trim();
        }
        int atIndex = email.indexOf("@");
        return atIndex > 0 ? email.substring(0, atIndex) : email;
    }
}
