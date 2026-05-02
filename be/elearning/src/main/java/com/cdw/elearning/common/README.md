# Common Package - Tiện ích dùng chung

Package này chứa các thành phần kỹ thuật và infrastructure được sử dụng xuyên suốt toàn bộ ứng dụng.

## Cấu trúc

### 📁 config/
Chứa các class cấu hình Spring Boot:
- `SecurityConfig.java` - Cấu hình Spring Security, CORS, JWT filter

**Quy tắc:**
- Tất cả `@Configuration` class đặt ở đây
- Không chứa business logic

### 🔐 security/
Chứa các thành phần liên quan đến bảo mật:
- `JwtTokenProvider.java` - Tạo, parse và validate JWT token
- `JwtAuthenticationFilter.java` - Filter xác thực request bằng JWT
- `CustomUserDetails.java` - Implementation của UserDetails

**Quy tắc:**
- Các class này được sử dụng bởi SecurityConfig
- Không phụ thuộc vào bất kỳ module nghiệp vụ nào

### ⚠️ exception/
Xử lý lỗi tập trung cho toàn ứng dụng:
- `AppException.java` - Custom runtime exception
- `ErrorCode.java` - Enum định nghĩa các mã lỗi
- `GlobalExceptionHandler.java` - `@RestControllerAdvice` bắt và xử lý exception

**Quy tắc:**
- Mọi exception trong ứng dụng đều throw `AppException` với `ErrorCode`
- GlobalExceptionHandler trả về format chuẩn cho client

### 📦 dto/
DTO dùng chung cho toàn ứng dụng:
- `response/ApiResponse.java` - Wrapper chung cho mọi API response

**Quy tắc:**
- Chỉ chứa DTO được dùng bởi nhiều module
- DTO riêng của module đặt trong module đó

### 🛠️ util/
Các utility class, helper methods:
- String utils
- Date utils
- Validation utils
- etc.

**Quy tắc:**
- Chỉ chứa static methods
- Không có state, không inject dependencies
- Pure functions

## Nguyên tắc sử dụng

1. **Common không phụ thuộc vào Modules**
   - Common là foundation layer
   - Modules build trên Common
   - Common KHÔNG được import bất kỳ class nào từ modules

2. **Tái sử dụng cao**
   - Code trong Common phải generic và reusable
   - Tránh logic nghiệp vụ cụ thể

3. **Stable và ít thay đổi**
   - Common nên ổn định
   - Thay đổi Common ảnh hưởng toàn bộ ứng dụng

## Ví dụ sử dụng

### Exception Handling
```java
// Trong Service
if (user == null) {
    throw new AppException(ErrorCode.USER_NOT_FOUND);
}
```

### JWT Token
```java
// Trong AuthService
String token = jwtTokenProvider.generateToken(userDetails);
```

### API Response
```java
// Trong Controller
return ApiResponse.<UserResponse>builder()
    .code(200)
    .message("Success")
    .data(userResponse)
    .build();
```
