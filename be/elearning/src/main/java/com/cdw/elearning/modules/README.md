# Modules Package - Module nghiệp vụ

Package này chứa các module nghiệp vụ (business domain) của hệ thống E-Learning.

## Nguyên tắc Module

### 1. Mỗi module là một domain nghiệp vụ độc lập
- Module tự quản lý entity, repository, service, controller
- Giảm thiểu dependency giữa các module
- Dễ dàng tách thành microservice nếu cần

### 2. Cấu trúc chuẩn của một module

```
module-name/
├── controller/          # REST API endpoints
│   └── XxxController.java
├── dto/
│   ├── request/         # Request DTOs
│   │   ├── XxxCreateRequest.java
│   │   └── XxxUpdateRequest.java
│   └── response/        # Response DTOs
│       └── XxxResponse.java
├── entity/              # JPA Entities
│   └── Xxx.java
├── repository/          # Spring Data JPA
│   └── XxxRepository.java
├── service/             # Business logic
│   ├── XxxService.java          # Interface
│   └── impl/
│       └── XxxServiceImpl.java  # Implementation
└── mapper/              # MapStruct mappers
    └── XxxMapper.java
```

### 3. Quy tắc phân tầng (Layered Architecture)

```
Controller → Service Interface → Service Impl → Repository → Database
     ↓            ↓                   ↓
  Request DTO  Response DTO        Entity
```

**Luồng dữ liệu:**
1. Controller nhận Request DTO
2. Controller gọi Service qua Interface
3. Service xử lý business logic
4. Service gọi Repository để thao tác database
5. Mapper chuyển Entity → Response DTO
6. Controller trả về Response DTO

## Module hiện tại

### 🔐 auth/ - Module Xác thực
**Chức năng:**
- Đăng nhập (login)
- Đăng ký (register)
- Tạo và quản lý JWT token

**API Endpoints:**
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/register`

**Dependencies:**
- Sử dụng `common.security.JwtTokenProvider`
- Gọi `user.service.UserService` để lấy thông tin user

---

### 👤 user/ - Module Quản lý Người dùng
**Chức năng:**
- CRUD người dùng
- Quản lý thông tin cá nhân
- Cập nhật profile
- Quản lý trạng thái tài khoản

**API Endpoints:**
- `GET /api/v1/users` - Danh sách người dùng
- `GET /api/v1/users/{id}` - Chi tiết người dùng
- `POST /api/v1/users` - Tạo người dùng mới
- `PUT /api/v1/users/{id}` - Cập nhật người dùng
- `DELETE /api/v1/users/{id}` - Xóa người dùng

**Entity:**
- `User` - Thông tin người dùng (username, email, password, status)

---

### 🎭 role/ - Module Quản lý Vai trò
**Chức năng:**
- CRUD vai trò (Role)
- Gán vai trò cho người dùng
- Quản lý phân quyền RBAC

**API Endpoints:**
- `GET /api/v1/roles` - Danh sách vai trò
- `POST /api/v1/roles` - Tạo vai trò mới
- `POST /api/v1/roles/assign` - Gán vai trò cho user

**Entity:**
- `Role` - Vai trò (ADMIN, TEACHER, STUDENT)
- `UserRole` - Bảng trung gian Many-to-Many

**Vai trò hệ thống:**
- `ADMIN` - Quản trị viên (quản lý toàn hệ thống)
- `TEACHER` - Giảng viên (quản lý khóa học, bài giảng)
- `STUDENT` - Học viên (tham gia học, làm bài tập)

---

## Hướng dẫn thêm module mới

### Bước 1: Tạo cấu trúc thư mục
```bash
modules/
└── course/              # Tên module (số ít, lowercase)
    ├── controller/
    ├── dto/
    │   ├── request/
    │   └── response/
    ├── entity/
    ├── repository/
    ├── service/
    │   └── impl/
    └── mapper/
```

### Bước 2: Tạo Entity
```java
package com.cdw.elearning.modules.course.entity;

@Entity
@Table(name = "courses")
@Getter @Setter
public class Course {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String title;
    private String description;
    // ...
}
```

### Bước 3: Tạo Repository
```java
package com.cdw.elearning.modules.course.repository;

public interface CourseRepository extends JpaRepository<Course, Long> {
    // Custom queries
}
```

### Bước 4: Tạo Service Interface
```java
package com.cdw.elearning.modules.course.service;

public interface CourseService {
    CourseResponse createCourse(CourseCreateRequest request);
    CourseResponse getCourseById(Long id);
    // ...
}
```

### Bước 5: Tạo Service Implementation
```java
package com.cdw.elearning.modules.course.service.impl;

@Service
@RequiredArgsConstructor
public class CourseServiceImpl implements CourseService {
    private final CourseRepository courseRepository;
    private final CourseMapper courseMapper;
    
    @Override
    public CourseResponse createCourse(CourseCreateRequest request) {
        // Business logic
    }
}
```

### Bước 6: Tạo Controller
```java
package com.cdw.elearning.modules.course.controller;

@RestController
@RequestMapping("/api/v1/courses")
@RequiredArgsConstructor
public class CourseController {
    private final CourseService courseService; // Inject qua Interface
    
    @PostMapping
    public ApiResponse<CourseResponse> createCourse(@RequestBody CourseCreateRequest request) {
        return ApiResponse.success(courseService.createCourse(request));
    }
}
```

## Quy tắc quan trọng

### ✅ PHẢI LÀM

1. **Service luôn có Interface**
   ```java
   // ✅ Đúng
   private final UserService userService;
   
   // ❌ Sai
   private final UserServiceImpl userService;
   ```

2. **Không trả Entity ra ngoài**
   ```java
   // ✅ Đúng
   public UserResponse getUser(Long id) {
       User user = userRepository.findById(id);
       return userMapper.toResponse(user);
   }
   
   // ❌ Sai
   public User getUser(Long id) {
       return userRepository.findById(id);
   }
   ```

3. **Sử dụng MapStruct**
   ```java
   @Mapper(componentModel = "spring")
   public interface CourseMapper {
       CourseResponse toResponse(Course course);
       Course toEntity(CourseCreateRequest request);
   }
   ```

### ❌ KHÔNG ĐƯỢC LÀM

1. **Module A không import Entity của Module B**
   ```java
   // ❌ Sai - CourseService import User entity
   import com.cdw.elearning.modules.user.entity.User;
   
   // ✅ Đúng - Gọi qua Service Interface
   private final UserService userService;
   UserResponse user = userService.getUserById(userId);
   ```

2. **Controller không chứa business logic**
   ```java
   // ❌ Sai
   @PostMapping
   public ApiResponse<UserResponse> createUser(@RequestBody UserCreateRequest request) {
       if (userRepository.existsByEmail(request.getEmail())) {
           throw new AppException(ErrorCode.EMAIL_EXISTED);
       }
       // ... business logic
   }
   
   // ✅ Đúng
   @PostMapping
   public ApiResponse<UserResponse> createUser(@RequestBody UserCreateRequest request) {
       return ApiResponse.success(userService.createUser(request));
   }
   ```

3. **Không hard-code ErrorCode message**
   ```java
   // ❌ Sai
   throw new RuntimeException("User not found");
   
   // ✅ Đúng
   throw new AppException(ErrorCode.USER_NOT_FOUND);
   ```

## Module tương lai (Roadmap)

Các module sẽ được thêm vào:

- 📚 **course/** - Quản lý khóa học
- 📝 **lesson/** - Quản lý bài giảng
- ✍️ **assignment/** - Quản lý bài tập
- 📊 **submission/** - Quản lý nộp bài
- 🏆 **exam/** - Thi trực tuyến
- 💬 **chat/** - Nhắn tin realtime
- 🔔 **notification/** - Thông báo
- 📈 **analytics/** - Phân tích & thống kê

---

**Lưu ý:** Mỗi module mới phải tuân thủ cấu trúc và quy tắc đã định nghĩa ở trên.
