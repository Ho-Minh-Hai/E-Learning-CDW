# QUY TẮC DỰ ÁN (PROJECT RULES & CONVENTIONS)
**Dự án:** Hệ thống Website Hỗ trợ Học tập Trực tuyến (Modular Monolith Architecture)

---

## 1. NGUYÊN TẮC KIẾN TRÚC (ARCHITECTURE RULES)

### RULE 1.1 - Modular Monolith Structure
Dự án được tổ chức theo mô hình **Modular Monolith** với 2 package chính:

```
com.cdw.elearning/
├── common/          # Infrastructure & Technical concerns
└── modules/         # Business domains & Use cases
```

**Quy tắc:**
- `common/` chứa các thành phần kỹ thuật dùng chung (config, security, exception, utils)
- `modules/` chứa các module nghiệp vụ độc lập (auth, user, role, course, ...)
- Mỗi module tự quản lý: controller, dto, entity, repository, service, mapper
- Common KHÔNG được phụ thuộc vào Modules
- Modules có thể phụ thuộc vào Common

### RULE 1.2 - Module Independence
Mỗi module phải độc lập và tự quản lý:

**Cấu trúc chuẩn:**
```
modules/{module-name}/
├── controller/          # REST API endpoints
├── dto/
│   ├── request/         # Request DTOs
│   └── response/        # Response DTOs
├── entity/              # JPA Entities
├── repository/          # Spring Data JPA
├── service/             # Business logic
│   ├── XxxService.java          # Interface
│   └── impl/
│       └── XxxServiceImpl.java  # Implementation
└── mapper/              # MapStruct mappers
```

**Quy tắc:**
- Module A KHÔNG được import Entity của Module B
- Module gọi Module khác phải qua Service Interface
- Mỗi module có database schema riêng (entities)

### RULE 1.3 - Service Abstraction (Tính trừu tượng)
Mọi nghiệp vụ tại tầng Service bắt buộc phải được định nghĩa qua **Interface**:

```java
// ✅ Đúng
modules/user/service/UserService.java           // Interface
modules/user/service/impl/UserServiceImpl.java  // Implementation

// ❌ Sai
modules/user/service/UserService.java           // Chỉ có class, không có interface
```

**Quy tắc:**
- Service Interface đặt trong `service/`
- Service Implementation đặt trong `service/impl/` với hậu tố `Impl`
- Implementation phải có annotation `@Service`

### RULE 1.4 - Dependency Inversion (Phụ thuộc ngược)
Các thành phần khác khi gọi Service phải gọi qua **Interface**, không gọi trực tiếp `Impl`:

```java
// ✅ Đúng - Inject qua Interface
@RestController
@RequiredArgsConstructor
public class UserController {
    private final UserService userService; // Interface
}

// ❌ Sai - Inject trực tiếp Implementation
@RestController
public class UserController {
    @Autowired
    private UserServiceImpl userService; // ❌ Không được
}
```

### RULE 1.5 - Cross-Module Communication
Khi Module A cần dữ liệu từ Module B:

```java
// ✅ Đúng - Gọi qua Service Interface
@Service
@RequiredArgsConstructor
public class CourseServiceImpl implements CourseService {
    private final UserService userService; // Interface từ user module
    
    public void assignTeacher(Long courseId, Long userId) {
        UserResponse user = userService.getUserById(userId);
        // ... business logic
    }
}

// ❌ Sai - Import Entity từ module khác
@Service
public class CourseServiceImpl implements CourseService {
    @Autowired
    private UserRepository userRepository; // ❌ Không được
    
    public void assignTeacher(Long courseId, Long userId) {
        User user = userRepository.findById(userId); // ❌ Không được
    }
}
```

### RULE 1.6 - Tích hợp Realtime
Sử dụng công nghệ realtime (Supabase Realtime) để hỗ trợ:
- Nhắn tin trao đổi trực tiếp giữa giảng viên - học viên
- Giải đáp thắc mắc tức thì
- Thông báo realtime

### RULE 1.7 - Quản lý Trạng thái & Deadline
Hệ thống phải có cơ chế tự động:
- Ghi nhận trạng thái nộp bài (đúng hạn/muộn)
- Gửi nhắc nhở deadline trong ngày cho học viên
- Cập nhật trạng thái bài tập tự động

### RULE 1.8 - Bảo toàn Dữ liệu Đánh giá
Mọi kết quả từ các cuộc thi trực tuyến và điểm số phải:
- Được lưu trữ chính xác và đầy đủ
- Có audit trail (lịch sử thay đổi)
- Phục vụ chức năng phân tích năng lực học viên

### RULE 1.9 - Strategy Pattern cho Đa hình
Nếu một nghiệp vụ có nhiều cách xử lý:

```java
// Sử dụng @Qualifier
@Service
@RequiredArgsConstructor
public class GradingService {
    @Qualifier("autoGrading")
    private final GradingStrategy autoGrading;
    
    @Qualifier("manualGrading")
    private final GradingStrategy manualGrading;
}

// Hoặc Strategy Pattern
public interface GradingStrategy {
    void grade(Submission submission);
}
```
---

## 2. TIÊU CHUẨN CODE BACKEND (JAVA SPRING BOOT)

### RULE 2.1 - Strict Layered Architecture (Phân tầng nghiêm ngặt)
Tuân thủ nghiêm ngặt kiến trúc phân tầng:

```
Controller → Service Interface → Service Impl → Repository → Database
     ↓            ↓                   ↓
  Request DTO  Response DTO        Entity
```

**Trách nhiệm từng tầng:**

**Controller (Presentation Layer):**
```java
@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService; // Inject Interface
    
    @PostMapping
    public ApiResponse<UserResponse> createUser(@RequestBody UserCreateRequest request) {
        // ✅ Chỉ nhận request, gọi service, trả response
        return ApiResponse.success(userService.createUser(request));
    }
    
    // ❌ KHÔNG được chứa business logic
    // ❌ KHÔNG được gọi Repository trực tiếp
    // ❌ KHÔNG được trả Entity
}
```

**Service (Business Logic Layer):**
```java
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    
    @Override
    @Transactional
    public UserResponse createUser(UserCreateRequest request) {
        // ✅ Chứa 100% business logic
        // ✅ Validation nghiệp vụ
        // ✅ Orchestrate operations
        // ✅ Transaction management
        
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AppException(ErrorCode.EMAIL_EXISTED);
        }
        
        User user = userMapper.toEntity(request);
        user = userRepository.save(user);
        
        return userMapper.toResponse(user);
    }
}
```

**Repository (Data Access Layer):**
```java
public interface UserRepository extends JpaRepository<User, Long> {
    // ✅ Chỉ thao tác database
    // ✅ Custom queries nếu cần
    boolean existsByEmail(String email);
    Optional<User> findByUsername(String username);
}
```

### RULE 2.2 - Never Leak Entities (Ẩn giấu Entity)
Tuyệt đối KHÔNG trả Entity ra ngoài API:

```java
// ✅ Đúng - Sử dụng DTO
@GetMapping("/{id}")
public ApiResponse<UserResponse> getUser(@PathVariable Long id) {
    UserResponse response = userService.getUserById(id);
    return ApiResponse.success(response);
}

// ❌ Sai - Trả Entity trực tiếp
@GetMapping("/{id}")
public User getUser(@PathVariable Long id) {
    return userRepository.findById(id).orElseThrow(); // ❌ Lộ Entity
}
```

**Quy tắc DTO:**
- Request DTO: Dữ liệu đầu vào từ client
- Response DTO: Dữ liệu trả về cho client
- Entity: Chỉ sử dụng trong Service và Repository
- Không bao giờ expose sensitive fields (password, tokens, ...)

### RULE 2.3 - MapStruct & Lombok (Tự động hóa)
Bắt buộc sử dụng MapStruct và Lombok:

**MapStruct Mapper:**
```java
@Mapper(componentModel = "spring")
public interface UserMapper {
    // Entity → Response DTO
    UserResponse toResponse(User user);
    
    // Request DTO → Entity
    User toEntity(UserCreateRequest request);
    
    // Update Entity from DTO
    @MappingTarget
    void updateEntity(UserUpdateRequest request, @MappingTarget User user);
}
```

**Lombok Annotations:**
```java
@Entity
@Table(name = "users")
@Getter @Setter              // Getters & Setters
@NoArgsConstructor           // Default constructor
@AllArgsConstructor          // All args constructor
@Builder                     // Builder pattern
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String username;
    private String email;
}

// Service với Lombok
@Service
@RequiredArgsConstructor     // Constructor injection
@Slf4j                       // Logger
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    
    public void someMethod() {
        log.info("Doing something...");
    }
}
```

### RULE 2.4 - Package Organization (Tổ chức package)
Đặt code đúng vị trí:

**Common Package (Infrastructure):**
```
common/
├── config/              # Spring configurations
├── security/            # JWT, Authentication, Authorization
├── exception/           # Global exception handling
├── dto/response/        # Shared response DTOs
└── util/                # Utility classes
```

**Module Package (Business):**
```
modules/{module}/
├── controller/          # REST endpoints
├── dto/
│   ├── request/         # Input DTOs
│   └── response/        # Output DTOs
├── entity/              # JPA entities
├── repository/          # Data access
├── service/             # Business logic (Interface)
│   └── impl/            # Business logic (Implementation)
└── mapper/              # MapStruct mappers
```

### RULE 2.5 - Naming Conventions (Quy tắc đặt tên)

**Package names:**
- Lowercase, singular: `user`, `role`, `course` (không phải `users`, `roles`)

**Class names:**
- PascalCase
- Entity: `User`, `Course`, `Assignment`
- DTO Request: `UserCreateRequest`, `CourseUpdateRequest`
- DTO Response: `UserResponse`, `CourseResponse`
- Service Interface: `UserService`, `CourseService`
- Service Impl: `UserServiceImpl`, `CourseServiceImpl`
- Controller: `UserController`, `CourseController`
- Repository: `UserRepository`, `CourseRepository`
- Mapper: `UserMapper`, `CourseMapper`

**Method names:**
- camelCase
- CRUD: `createUser`, `getUserById`, `updateUser`, `deleteUser`
- Query: `findByEmail`, `existsByUsername`, `countActiveUsers`
- Business: `enrollStudent`, `submitAssignment`, `gradeExam`

### RULE 2.6 - Transaction Management
Sử dụng `@Transactional` cho operations thay đổi dữ liệu:

```java
@Service
@RequiredArgsConstructor
public class CourseServiceImpl implements CourseService {
    
    @Transactional(readOnly = true)
    public CourseResponse getCourseById(Long id) {
        // Read-only transaction
    }
    
    @Transactional
    public CourseResponse createCourse(CourseCreateRequest request) {
        // Write transaction
    }
    
    @Transactional
    public void enrollStudent(Long courseId, Long studentId) {
        // Multiple operations in one transaction
        Course course = courseRepository.findById(courseId)...;
        User student = userRepository.findById(studentId)...;
        
        Enrollment enrollment = new Enrollment(course, student);
        enrollmentRepository.save(enrollment);
        
        // All or nothing
    }
}
```

### RULE 2.7 - Validation (Kiểm tra dữ liệu)
Sử dụng Bean Validation cho Request DTOs:

```java
@Getter @Setter
public class UserCreateRequest {
    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50)
    private String username;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;
    
    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;
}

// Controller
@PostMapping
public ApiResponse<UserResponse> createUser(
    @Valid @RequestBody UserCreateRequest request) { // @Valid trigger validation
    return ApiResponse.success(userService.createUser(request));
}
```

---

## 3. TIÊU CHUẨN FRONTEND (REACTJS & TAILWIND CSS)

* **RULE 3.1 - Component-Based:** Xây dựng giao diện dựa trên các component tái sử dụng để quản lý bài giảng, danh sách lớp học và khu vực thi trực tuyến[cite: 5, 8, 16].
* **RULE 3.2 - Responsive Design:** Sử dụng **Tailwind CSS** để đảm bảo giao diện hiển thị tốt trên mọi thiết bị, giúp người học theo dõi nội dung mọi lúc mọi nơi[cite: 6, 16].
* **RULE 3.3 - Trải nghiệm Realtime:** Tích hợp listener để cập nhật thông báo nhắc nhở và tin nhắn mới mà không cần tải lại trang[cite: 9, 10].

---

## 4. XỬ LÝ LỖI & BẢO MẬT (EXCEPTION & SECURITY)

### RULE 4.1 - Global Exception Handling (Xử lý lỗi tập trung)
Sử dụng `@RestControllerAdvice` để xử lý tất cả exceptions:

**ErrorCode Enum:**
```java
@Getter
@AllArgsConstructor
public enum ErrorCode {
    // User errors (1xxx)
    USER_NOT_FOUND(1001, "User not found"),
    EMAIL_EXISTED(1002, "Email already exists"),
    USERNAME_EXISTED(1003, "Username already exists"),
    
    // Authentication errors (2xxx)
    INVALID_CREDENTIALS(2001, "Invalid username or password"),
    TOKEN_EXPIRED(2002, "Token has expired"),
    UNAUTHORIZED(2003, "Unauthorized access"),
    
    // Course errors (3xxx)
    COURSE_NOT_FOUND(3001, "Course not found"),
    ALREADY_ENROLLED(3002, "Already enrolled in this course"),
    
    // Validation errors (9xxx)
    INVALID_INPUT(9001, "Invalid input data"),
    INTERNAL_ERROR(9999, "Internal server error");
    
    private final int code;
    private final String message;
}
```

**AppException:**
```java
@Getter
public class AppException extends RuntimeException {
    private final ErrorCode errorCode;
    
    public AppException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
    }
}
```

**GlobalExceptionHandler:**
```java
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {
    
    @ExceptionHandler(AppException.class)
    public ResponseEntity<ApiResponse<Void>> handleAppException(AppException ex) {
        ErrorCode errorCode = ex.getErrorCode();
        log.error("AppException: {}", errorCode.getMessage());
        
        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(ApiResponse.error(errorCode.getCode(), errorCode.getMessage()));
    }
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidationException(
        MethodArgumentNotValidException ex) {
        
        String message = ex.getBindingResult().getFieldErrors().stream()
            .map(FieldError::getDefaultMessage)
            .collect(Collectors.joining(", "));
            
        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(ApiResponse.error(9001, message));
    }
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGenericException(Exception ex) {
        log.error("Unexpected error", ex);
        return ResponseEntity
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(ApiResponse.error(9999, "Internal server error"));
    }
}
```

**Sử dụng trong Service:**
```java
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        
        return userMapper.toResponse(user);
    }
    
    public UserResponse createUser(UserCreateRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AppException(ErrorCode.EMAIL_EXISTED);
        }
        
        // ... create user
    }
}
```

### RULE 4.2 - Role-Based Access Control (RBAC)
Phân quyền dựa trên vai trò:

**Vai trò hệ thống:**
- `ADMIN` - Quản trị viên
  - Quản lý người dùng (CRUD)
  - Khóa/mở tài khoản
  - Xem thống kê toàn hệ thống
  - Quản lý vai trò và phân quyền

- `TEACHER` - Giảng viên
  - Khởi tạo và quản lý khóa học
  - Đăng bài giảng và tài liệu
  - Thiết lập bài tập và deadline
  - Chấm điểm và đánh giá học viên
  - Tương tác với học viên

- `STUDENT` - Học viên
  - Đăng ký và tham gia khóa học
  - Xem bài giảng và tài liệu
  - Nộp bài tập trực tuyến
  - Tham gia thi trực tuyến
  - Xem điểm và nhận xét

**Entity:**
```java
@Entity
@Table(name = "roles")
@Getter @Setter
public class Role {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Enumerated(EnumType.STRING)
    private RoleName name; // ADMIN, TEACHER, STUDENT
    
    private String description;
}

public enum RoleName {
    ADMIN, TEACHER, STUDENT
}
```

**Sử dụng @PreAuthorize:**
```java
@RestController
@RequestMapping("/api/v1/users")
public class UserController {
    
    // Chỉ ADMIN mới được truy cập
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<UserResponse>> getAllUsers() {
        return ApiResponse.success(userService.getAllUsers());
    }
    
    // ADMIN hoặc chính user đó
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @userSecurity.isOwner(#id)")
    public ApiResponse<UserResponse> getUser(@PathVariable Long id) {
        return ApiResponse.success(userService.getUserById(id));
    }
    
    // TEACHER và ADMIN
    @PostMapping("/courses")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ApiResponse<CourseResponse> createCourse(@RequestBody CourseCreateRequest request) {
        return ApiResponse.success(courseService.createCourse(request));
    }
}
```

**Custom Security Expression:**
```java
@Component("userSecurity")
public class UserSecurityExpression {
    
    public boolean isOwner(Long userId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        CustomUserDetails userDetails = (CustomUserDetails) auth.getPrincipal();
        return userDetails.getId().equals(userId);
    }
}
```

### RULE 4.3 - JWT Authentication (Xác thực JWT)
Sử dụng JWT cho authentication:

**JwtTokenProvider:**
```java
@Component
@Slf4j
public class JwtTokenProvider {
    @Value("${jwt.secret}")
    private String jwtSecret;
    
    @Value("${jwt.expiration}")
    private long jwtExpiration;
    
    public String generateToken(UserDetails userDetails) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpiration);
        
        return Jwts.builder()
            .setSubject(userDetails.getUsername())
            .setIssuedAt(now)
            .setExpiration(expiryDate)
            .signWith(SignatureAlgorithm.HS512, jwtSecret)
            .compact();
    }
    
    public String getUsernameFromToken(String token) {
        return Jwts.parser()
            .setSigningKey(jwtSecret)
            .parseClaimsJws(token)
            .getBody()
            .getSubject();
    }
    
    public boolean validateToken(String token) {
        try {
            Jwts.parser().setSigningKey(jwtSecret).parseClaimsJws(token);
            return true;
        } catch (Exception ex) {
            log.error("Invalid JWT token", ex);
            return false;
        }
    }
}
```

**JwtAuthenticationFilter:**
```java
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtTokenProvider tokenProvider;
    private final UserDetailsService userDetailsService;
    
    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        try {
            String jwt = getJwtFromRequest(request);
            
            if (jwt != null && tokenProvider.validateToken(jwt)) {
                String username = tokenProvider.getUsernameFromToken(jwt);
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                
                UsernamePasswordAuthenticationToken authentication = 
                    new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());
                        
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (Exception ex) {
            log.error("Could not set user authentication", ex);
        }
        
        filterChain.doFilter(request, response);
    }
    
    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
```

### RULE 4.4 - Security Configuration
Cấu hình Spring Security:

```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/v1/auth/**").permitAll()
                .requestMatchers("/api/v1/public/**").permitAll()
                .anyRequest().authenticated()
            )
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .addFilterBefore(jwtAuthenticationFilter, 
                UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
```

### RULE 4.5 - Password Security
Bảo mật mật khẩu:

```java
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final PasswordEncoder passwordEncoder;
    
    public UserResponse createUser(UserCreateRequest request) {
        User user = userMapper.toEntity(request);
        
        // ✅ Mã hóa password trước khi lưu
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        
        user = userRepository.save(user);
        return userMapper.toResponse(user);
    }
}

// ❌ KHÔNG BAO GIỜ lưu plain text password
// ❌ KHÔNG BAO GIỜ trả password trong Response DTO
@Getter @Setter
public class UserResponse {
    private Long id;
    private String username;
    private String email;
    // ❌ KHÔNG có field password
}
```

---

## 5. QUY TẮC API (RESTFUL CONVENTIONS)

### RULE 5.1 - RESTful Endpoint Naming
Đặt tên endpoint theo chuẩn RESTful:

**Quy tắc chung:**
- Sử dụng danh từ số nhiều: `/users`, `/courses`, `/assignments`
- Sử dụng HTTP methods đúng nghĩa
- Sử dụng path parameters cho resource ID
- Sử dụng query parameters cho filtering, sorting, pagination

**CRUD Operations:**
```
GET    /api/v1/users              # Lấy danh sách users
GET    /api/v1/users/{id}         # Lấy user theo ID
POST   /api/v1/users              # Tạo user mới
PUT    /api/v1/users/{id}         # Cập nhật toàn bộ user
PATCH  /api/v1/users/{id}         # Cập nhật một phần user
DELETE /api/v1/users/{id}         # Xóa user
```

**Nested Resources:**
```
GET    /api/v1/courses/{courseId}/lessons           # Lấy lessons của course
POST   /api/v1/courses/{courseId}/lessons           # Tạo lesson cho course
GET    /api/v1/courses/{courseId}/students          # Lấy students của course
POST   /api/v1/courses/{courseId}/enrollments       # Enroll student vào course
```

**Actions (Non-CRUD):**
```
POST   /api/v1/users/{id}/activate                  # Kích hoạt user
POST   /api/v1/users/{id}/deactivate                # Vô hiệu hóa user
POST   /api/v1/assignments/{id}/submit              # Nộp bài tập
POST   /api/v1/exams/{id}/start                     # Bắt đầu thi
POST   /api/v1/exams/{id}/finish                    # Kết thúc thi
```

**Filtering & Pagination:**
```
GET    /api/v1/users?role=STUDENT&status=ACTIVE     # Filter
GET    /api/v1/courses?page=0&size=20&sort=name,asc # Pagination
GET    /api/v1/assignments?deadline=2026-05-01      # Filter by date
```

### RULE 5.2 - HTTP Status Codes
Sử dụng đúng HTTP status codes:

```java
@RestController
@RequestMapping("/api/v1/users")
public class UserController {
    
    // 200 OK - Success
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> getUser(@PathVariable Long id) {
        return ResponseEntity.ok(
            ApiResponse.success(userService.getUserById(id))
        );
    }
    
    // 201 Created - Resource created
    @PostMapping
    public ResponseEntity<ApiResponse<UserResponse>> createUser(
        @RequestBody UserCreateRequest request) {
        UserResponse response = userService.createUser(request);
        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(ApiResponse.success(response));
    }
    
    // 204 No Content - Success but no data to return
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
    
    // 400 Bad Request - Validation error (handled by GlobalExceptionHandler)
    // 401 Unauthorized - Not authenticated
    // 403 Forbidden - Not authorized
    // 404 Not Found - Resource not found (handled by GlobalExceptionHandler)
    // 500 Internal Server Error - Server error
}
```

### RULE 5.3 - API Response Format
Chuẩn hóa format response:

**ApiResponse Wrapper:**
```java
@Getter @Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ApiResponse<T> {
    private int code;
    private String message;
    private T data;
    private LocalDateTime timestamp;
    
    public static <T> ApiResponse<T> success(T data) {
        return ApiResponse.<T>builder()
            .code(200)
            .message("Success")
            .data(data)
            .timestamp(LocalDateTime.now())
            .build();
    }
    
    public static <T> ApiResponse<T> error(int code, String message) {
        return ApiResponse.<T>builder()
            .code(code)
            .message(message)
            .data(null)
            .timestamp(LocalDateTime.now())
            .build();
    }
}
```

**Success Response:**
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com"
  },
  "timestamp": "2026-04-28T23:45:00"
}
```

**Error Response:**
```json
{
  "code": 1001,
  "message": "User not found",
  "data": null,
  "timestamp": "2026-04-28T23:45:00"
}
```

**List Response with Pagination:**
```java
@Getter @Setter
public class PageResponse<T> {
    private List<T> content;
    private int pageNumber;
    private int pageSize;
    private long totalElements;
    private int totalPages;
    private boolean last;
}

// Controller
@GetMapping
public ApiResponse<PageResponse<UserResponse>> getUsers(
    @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "20") int size) {
    
    PageResponse<UserResponse> response = userService.getUsers(page, size);
    return ApiResponse.success(response);
}
```

### RULE 5.4 - API Versioning
Sử dụng versioning trong URL:

```java
// Version 1
@RestController
@RequestMapping("/api/v1/users")
public class UserController {
    // ...
}

// Version 2 (khi có breaking changes)
@RestController
@RequestMapping("/api/v2/users")
public class UserControllerV2 {
    // ...
}
```

### RULE 5.5 - API Documentation
Sử dụng Swagger/OpenAPI cho documentation:

```java
@RestController
@RequestMapping("/api/v1/users")
@Tag(name = "User Management", description = "APIs for managing users")
public class UserController {
    
    @Operation(summary = "Get user by ID", description = "Returns a single user")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Success"),
        @ApiResponse(responseCode = "404", description = "User not found")
    })
    @GetMapping("/{id}")
    public ApiResponse<UserResponse> getUser(
        @Parameter(description = "User ID") @PathVariable Long id) {
        return ApiResponse.success(userService.getUserById(id));
    }
}
```

### RULE 5.6 - Admin Statistics Endpoints
Cung cấp endpoints thống kê cho Admin:

```java
@RestController
@RequestMapping("/api/v1/admin/statistics")
@PreAuthorize("hasRole('ADMIN')")
public class StatisticsController {
    
    @GetMapping("/overview")
    public ApiResponse<SystemOverview> getSystemOverview() {
        // Tổng số users, courses, active students, etc.
    }
    
    @GetMapping("/users")
    public ApiResponse<UserStatistics> getUserStatistics(
        @RequestParam(required = false) LocalDate startDate,
        @RequestParam(required = false) LocalDate endDate) {
        // Thống kê users theo thời gian
    }
    
    @GetMapping("/courses")
    public ApiResponse<CourseStatistics> getCourseStatistics() {
        // Thống kê courses: enrollment rate, completion rate
    }
    
    @GetMapping("/activities")
    public ApiResponse<ActivityLog> getActivityLogs(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "50") int size) {
        // Logs hoạt động của toàn hệ thống
    }
}
```

---

## 6. QUY TẮC DATABASE (DATABASE RULES)

### RULE 6.1 - Entity Design
Thiết kế Entity chuẩn JPA:

```java
@Entity
@Table(name = "users", indexes = {
    @Index(name = "idx_username", columnList = "username"),
    @Index(name = "idx_email", columnList = "email")
})
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User extends BaseEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true, length = 50)
    private String username;
    
    @Column(nullable = false, unique = true, length = 100)
    private String email;
    
    @Column(nullable = false)
    private String password;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserStatus status; // ACTIVE, INACTIVE, BANNED
    
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "user_roles",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private Set<Role> roles = new HashSet<>();
}
```

**BaseEntity (Audit fields):**
```java
@MappedSuperclass
@Getter @Setter
@EntityListeners(AuditingEntityListener.class)
public abstract class BaseEntity {
    
    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime updatedAt;
    
    @CreatedBy
    @Column(updatable = false)
    private String createdBy;
    
    @LastModifiedBy
    private String lastModifiedBy;
}
```

### RULE 6.2 - Naming Conventions
Quy tắc đặt tên database:

- **Table names:** lowercase, snake_case, plural
  - `users`, `courses`, `course_enrollments`
  
- **Column names:** lowercase, snake_case
  - `user_id`, `created_at`, `is_active`
  
- **Foreign keys:** `{referenced_table}_id`
  - `user_id`, `course_id`, `teacher_id`
  
- **Junction tables:** `{table1}_{table2}`
  - `user_roles`, `course_students`
  
- **Indexes:** `idx_{column_name}`
  - `idx_username`, `idx_email`

### RULE 6.3 - Relationships
Định nghĩa relationships đúng cách:

```java
// One-to-Many
@Entity
public class Course {
    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Lesson> lessons = new ArrayList<>();
}

@Entity
public class Lesson {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;
}

// Many-to-Many
@Entity
public class Student {
    @ManyToMany
    @JoinTable(
        name = "course_enrollments",
        joinColumns = @JoinColumn(name = "student_id"),
        inverseJoinColumns = @JoinColumn(name = "course_id")
    )
    private Set<Course> courses = new HashSet<>();
}
```

### RULE 6.4 - Query Optimization
Tối ưu hóa queries:

```java
public interface UserRepository extends JpaRepository<User, Long> {
    
    // ✅ Sử dụng @Query cho complex queries
    @Query("SELECT u FROM User u JOIN FETCH u.roles WHERE u.username = :username")
    Optional<User> findByUsernameWithRoles(@Param("username") String username);
    
    // ✅ Projection cho performance
    @Query("SELECT new com.cdw.elearning.modules.user.dto.response.UserSummary(" +
           "u.id, u.username, u.email) FROM User u")
    List<UserSummary> findAllSummaries();
    
    // ✅ Pagination
    Page<User> findByStatus(UserStatus status, Pageable pageable);
    
    // ✅ Native query khi cần
    @Query(value = "SELECT * FROM users WHERE created_at > :date", nativeQuery = true)
    List<User> findRecentUsers(@Param("date") LocalDateTime date);
}
```

---

## 7. QUY TẮC TESTING (TESTING RULES)

### RULE 7.1 - Test Structure
Tổ chức tests theo module:

```
src/test/java/com/cdw/elearning/
├── common/
│   └── security/
│       └── JwtTokenProviderTest.java
└── modules/
    ├── user/
    │   ├── service/
    │   │   └── UserServiceImplTest.java
    │   └── controller/
    │       └── UserControllerTest.java
    └── auth/
        └── service/
            └── AuthServiceImplTest.java
```

### RULE 7.2 - Unit Tests
Viết unit tests cho Service layer:

```java
@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {
    
    @Mock
    private UserRepository userRepository;
    
    @Mock
    private UserMapper userMapper;
    
    @InjectMocks
    private UserServiceImpl userService;
    
    @Test
    void createUser_Success() {
        // Given
        UserCreateRequest request = new UserCreateRequest();
        request.setUsername("john");
        request.setEmail("john@example.com");
        
        User user = new User();
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(userMapper.toEntity(any())).thenReturn(user);
        when(userRepository.save(any())).thenReturn(user);
        
        // When
        UserResponse response = userService.createUser(request);
        
        // Then
        assertNotNull(response);
        verify(userRepository).save(any(User.class));
    }
    
    @Test
    void createUser_EmailExisted_ThrowsException() {
        // Given
        UserCreateRequest request = new UserCreateRequest();
        request.setEmail("existing@example.com");
        
        when(userRepository.existsByEmail(anyString())).thenReturn(true);
        
        // When & Then
        assertThrows(AppException.class, () -> userService.createUser(request));
    }
}
```

### RULE 7.3 - Integration Tests
Viết integration tests cho Controllers:

```java
@SpringBootTest
@AutoConfigureMockMvc
class UserControllerIntegrationTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    @Test
    @WithMockUser(roles = "ADMIN")
    void createUser_Success() throws Exception {
        UserCreateRequest request = new UserCreateRequest();
        request.setUsername("john");
        request.setEmail("john@example.com");
        request.setPassword("password123");
        
        mockMvc.perform(post("/api/v1/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data.username").value("john"));
    }
}
```

---

## 8. TÓM TẮT (SUMMARY)

### Checklist cho Developer

Khi thêm feature mới, đảm bảo:

- [ ] Code đặt đúng module và package
- [ ] Service có Interface và Implementation
- [ ] Controller inject Service qua Interface
- [ ] Không trả Entity ra ngoài API
- [ ] Sử dụng DTO cho request/response
- [ ] Sử dụng MapStruct cho mapping
- [ ] Sử dụng Lombok để giảm boilerplate
- [ ] Exception handling qua AppException và ErrorCode
- [ ] Validation cho Request DTOs
- [ ] Transaction management cho write operations
- [ ] RESTful endpoint naming
- [ ] Đúng HTTP status codes
- [ ] API documentation (Swagger)
- [ ] Unit tests cho Service
- [ ] Integration tests cho Controller
- [ ] Database indexes cho performance
- [ ] Security annotations (@PreAuthorize)

### Tài liệu tham khảo

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Kiến trúc tổng quan
- [MODULE_STRUCTURE.md](./MODULE_STRUCTURE.md) - Cấu trúc module chi tiết
- [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) - Hướng dẫn migration
- [DATABASE.md](./DATABASE.md) - Database schema

---

**Cập nhật:** 28/04/2026 - Phiên bản Modular Monolith