# KIẾN TRÚC DỰ ÁN (PROJECT ARCHITECTURE)
**Dự án:** Hệ thống Website Hỗ trợ Học tập Trực tuyến (E-Learning)

---

## 1. TỔNG QUAN KIẾN TRÚC (OVERVIEW)
[cite_start]Hệ thống được phát triển theo mô hình **Monolith (đơn khối)** để đảm bảo tính nhất quán của dữ liệu và đơn giản hóa quá trình triển khai[cite: 13]. Tuy nhiên, mã nguồn được tổ chức theo hướng **Modular Monolith** để sẵn sàng cho việc mở rộng trong tương lai.

## 2. CÔNG NGHỆ CỐT LÕI (TECH STACK)
* [cite_start]**Backend:** Spring Boot (Java)[cite: 15].
* [cite_start]**Frontend:** ReactJS, Tailwind CSS v4[cite: 16].
* [cite_start]**Database & Realtime:** Supabase (PostgreSQL) và Supabase Realtime[cite: 17].
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
    * [cite_start]Quản lý khóa học, bài giảng và bài tập[cite: 5].
    * [cite_start]Kiểm tra deadline và trạng thái nộp bài (đúng hạn/muộn)[cite: 7, 10].
    * [cite_start]Phân tích điểm số và đánh giá năng lực học viên[cite: 8].

### 3.3. Persistence Layer (Repositories)
* Tương tác trực tiếp với cơ sở dữ liệu Supabase thông qua Spring Data JPA hoặc Supabase Client.
* Đảm bảo tính toàn vẹn của dữ liệu và quản lý các truy vấn.

---

## 4. LUỒNG DỮ LIỆU & GIAO TIẾP (DATA FLOW & COMMUNICATION)
1. **API RESTful:** Mọi tương tác giữa Frontend và Backend đều thông qua chuẩn RESTful API với các danh từ số nhiều.
2. [cite_start]**Realtime Communication:** Tích hợp **Supabase Realtime** để xử lý tin nhắn trực tiếp giữa giảng viên - học viên và gửi thông báo nhắc hẹn tức thì[cite: 9, 10, 17].
3. **Data Mapping:** Sử dụng **MapStruct** để tự động ánh xạ dữ liệu giữa Entity (Database) và DTO (API) nhằm tránh lộ thông tin nhạy cảm.

---

## 5. BẢO MẬT & PHÂN QUYỀN (SECURITY & AUTHORIZATION)
* **Xác thực (Authentication):** Sử dụng cơ chế Token-based (JWT) để xác thực người dùng.
* **Ủy quyền (Authorization):** Phân quyền dựa trên vai trò (RBAC) sử dụng `@PreAuthorize`:
    * [cite_start]**Admin:** Quản trị toàn hệ thống và người dùng[cite: 11].
    * [cite_start]**Giảng viên:** Quản lý nội dung học thuật và lớp học[cite: 5, 11].
    * [cite_start]**Học viên:** Tham gia học, làm bài và tương tác[cite: 6, 11].

---

## 6. QUY TẮC TRIỂN KHAI (DEPLOYMENT)
* **Containerization:** Toàn bộ ứng dụng được đóng gói qua `Dockerfile` để đảm bảo môi trường chạy đồng nhất.
* **Configuration:** Các biến môi trường và thông tin nhạy cảm được quản lý tập trung, không hard-code vào mã nguồn.