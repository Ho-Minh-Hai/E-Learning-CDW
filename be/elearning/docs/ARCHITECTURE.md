# KIẾN TRÚC DỰ ÁN (PROJECT ARCHITECTURE)
**Dự án:** Hệ thống Website Hỗ trợ Học tập Trực tuyến (E-Learning)

---

## 1. TỔNG QUAN KIẾN TRÚC (OVERVIEW)
Hệ thống được phát triển theo mô hình **Modular Monolith** để đảm bảo tính nhất quán của dữ liệu và đơn giản hóa quá trình triển khai, đồng thời dễ dàng mở rộng và bảo trì.

### Cấu trúc tổng quan:
```
elearning/
└── src/main/java/com/cdw/elearning/
    ├── common/          # Tiện ích dùng chung (config, security, exception)
    └── modules/         # Module nghiệp vụ (auth, user, role, course, ...)
```

**Lợi ích:**
- Tách biệt rõ ràng giữa infrastructure (common) và business logic (modules)
- Mỗi module tự quản lý entity, service, repository riêng
- Dễ dàng thêm module mới mà không ảnh hưởng code cũ
- Chuẩn bị sẵn sàng cho việc tách thành microservices nếu cần

Chi tiết cấu trúc xem tại: [MODULE_STRUCTURE.md](./MODULE_STRUCTURE.md)

## 2. CÔNG NGHỆ CỐT LÕI (TECH STACK)
* **Backend:** Spring Boot (Java)[cite: 15].
* **Frontend:** ReactJS, Tailwind CSS v4[cite: 16].
* **Database & Realtime:** Supabase (PostgreSQL) và Supabase Realtime[cite: 17].
* **Công cụ hỗ trợ:** Lombok, MapStruct.

---

## 3. CƠ CẤU PHÂN TẦNG (LAYERING STRATEGY)
Dự án tuân thủ nghiêm ngặt mô hình **Strict Layered Architecture** để tách biệt trách nhiệm giữa các thành phần:

### 3.1. Presentation Layer (Controllers)
* Tiếp nhận yêu cầu HTTP từ phía client.
* Chỉ sử dụng `RequestDTO` làm đầu vào và trả về `ResponseDTO`.
* Không chứa bất kỳ logic nghiệp vụ nào.

### 3.2. Business Logic Layer (Services)
* Là "trái tim" của hệ thống, xử lý mọi quy trình nghiệp vụ như:
    * [cite_start]Quản lý khóa học, bài giảng và bài tập.
    * [cite_start]Kiểm tra deadline và trạng thái nộp bài (đúng hạn/muộn).
    * [cite_start]Phân tích điểm số và đánh giá năng lực học viên.

### 3.3. Persistence Layer (Repositories)
* Tương tác trực tiếp với cơ sở dữ liệu Supabase thông qua Spring Data JPA hoặc Supabase Client.
* Đảm bảo tính toàn vẹn của dữ liệu và quản lý các truy vấn.

---

## 4. LUỒNG DỮ LIỆU & GIAO TIẾP (DATA FLOW & COMMUNICATION)
1. **API RESTful:** Mọi tương tác giữa Frontend và Backend đều thông qua chuẩn RESTful API với các danh từ số nhiều.
2. **Realtime Communication:** Tích hợp **Supabase Realtime** để xử lý tin nhắn trực tiếp giữa giảng viên - học viên và gửi thông báo nhắc hẹn tức thì.
3. **Data Mapping:** Sử dụng **MapStruct** để tự động ánh xạ dữ liệu giữa Entity (Database) và DTO (API) nhằm tránh lộ thông tin nhạy cảm.

---

## 5. BẢO MẬT & PHÂN QUYỀN (SECURITY & AUTHORIZATION)
* **Xác thực (Authentication):** Sử dụng cơ chế Token-based (JWT) để xác thực người dùng.
* **Ủy quyền (Authorization):** Phân quyền dựa trên vai trò (RBAC) sử dụng `@PreAuthorize`:
    * **Admin:** Quản trị toàn hệ thống và người dùng[cite: 11].
    * **Giảng viên:** Quản lý nội dung học thuật và lớp học[cite: 5, 11].
    * **Học viên:** Tham gia học, làm bài và tương tác[cite: 6, 11].

---

## 6. QUY TẮC TRIỂN KHAI (DEPLOYMENT)
* **Containerization:** Toàn bộ ứng dụng được đóng gói qua `Dockerfile` để đảm bảo môi trường chạy đồng nhất.
* **Configuration:** Các biến môi trường và thông tin nhạy cảm được quản lý tập trung, không hard-code vào mã nguồn.