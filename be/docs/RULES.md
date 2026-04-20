# QUY TẮC DỰ ÁN (PROJECT RULES & CONVENTIONS)
**Dự án:** Hệ thống Website Hỗ trợ Học tập Trực tuyến (Modern Monolith Architecture)

---

## 1. NGUYÊN TẮC KIẾN TRÚC (ARCHITECTURE RULES)

* [cite_start]**RULE 1.1 - Clean Monolith:** Dự án được phát triển theo mô hình Monolith để đảm bảo tính nhất quán[cite: 13]. [cite_start]Tuy nhiên, mã nguồn phải được tổ chức theo các package module rõ ràng (ví dụ: `course`, `user`, `interaction`) để dễ dàng bảo trì[cite: 13].
* [cite_start]**RULE 1.2 - Tích hợp Realtime:** Sử dụng công nghệ realtime để hỗ trợ nhắn tin trao đổi trực tiếp và giải đáp thắc mắc tức thì giữa người dùng[cite: 9, 17].
* [cite_start]**RULE 1.3 - Quản lý Trạng thái & Deadline:** Hệ thống phải có cơ chế tự động ghi nhận trạng thái nộp bài (đúng hạn/muộn) và gửi nhắc nhở deadline trong ngày cho học viên[cite: 7, 10].
* [cite_start]**RULE 1.4 - Bảo toàn Dữ liệu Đánh giá:** Mọi kết quả từ các cuộc thi trực tuyến và điểm số phải được lưu trữ chính xác để phục vụ chức năng phân tích năng lực học viên[cite: 8].

---

## 2. TIÊU CHUẨN CODE BACKEND (JAVA SPRING BOOT)

* **RULE 2.1 - Tuân thủ Phân tầng (Strict Layered Architecture):**
    * `Controller`: Chỉ nhận Request từ người học/giảng viên, gọi Service và trả về Response.
    * `Service`: Chứa 100% nghiệp vụ (quản lý lớp học, tính toán điểm số, kiểm soát tiến độ).
    * `Repository`: Thao tác trực tiếp với Database thông qua Spring Data JPA hoặc Supabase Client.
* **RULE 2.2 - Ẩn giấu Thực thể (Never leak Entities):**
    * Tuyệt đối **không** trả trực tiếp đối tượng Entity ra ngoài API.
    * Luôn sử dụng `RequestDTO` cho dữ liệu đầu vào và `ResponseDTO` cho dữ liệu đầu ra.
* **RULE 2.3 - Tự động hóa với MapStruct & Lombok:**
    * Bắt buộc dùng **MapStruct** để chuyển đổi giữa Entity và DTO.
    * Sử dụng **Lombok** (`@Getter`, `@Setter`, `@Builder`, `@Slf4j`) để giảm thiểu mã nguồn thừa.

---

## 3. TIÊU CHUẨN FRONTEND (REACTJS & TAILWIND CSS)

* [cite_start]**RULE 3.1 - Component-Based:** Xây dựng giao diện dựa trên các component tái sử dụng để quản lý bài giảng, danh sách lớp học và khu vực thi trực tuyến[cite: 5, 8, 16].
* [cite_start]**RULE 3.2 - Responsive Design:** Sử dụng **Tailwind CSS** để đảm bảo giao diện hiển thị tốt trên mọi thiết bị, giúp người học theo dõi nội dung mọi lúc mọi nơi[cite: 6, 16].
* [cite_start]**RULE 3.3 - Trải nghiệm Realtime:** Tích hợp listener để cập nhật thông báo nhắc nhở và tin nhắn mới mà không cần tải lại trang[cite: 9, 10].

---

## 4. XỬ LÝ LỖI & BẢO MẬT (EXCEPTION & SECURITY)

* **RULE 4.1 - Bắt lỗi tập trung (Global Exception Handler):** * Sử dụng `@RestControllerAdvice` để xử lý tất cả exception.
    * Chuẩn hóa thông báo lỗi theo mã lỗi (ErrorCode) thay vì trả về stack trace của hệ thống.
* **RULE 4.2 - Phân quyền theo vai trò (RBAC):**
    * [cite_start]`ADMIN`: Quản lý người dùng, khóa/mở tài khoản và xem thống kê toàn hệ thống[cite: 11].
    * [cite_start]`GIẢNG VIÊN`: Khởi tạo lớp học, đăng bài giảng, thiết lập bài tập và đánh giá[cite: 5, 7].
    * [cite_start]`HỌC VIÊN`: Tham gia lớp, nộp bài trực tuyến và tham gia cuộc thi[cite: 6, 8].
* **RULE 4.3 - Bảo mật API:** Mọi truy cập vào tài liệu và chức năng quản lý phải được xác thực và kiểm soát quyền hạn chặt chẽ.

---

## 5. QUY TẮC API (RESTFUL CONVENTIONS)

* **RULE 5.1 - Đặt tên Endpoint chuẩn:**
    * `GET /api/v1/courses` (Lấy danh sách khóa học).
    * `POST /api/v1/submissions` (Học viên nộp bài tập).
    * `PATCH /api/v1/users/{id}/status` (Admin cập nhật trạng thái tài khoản).
* [cite_start]**RULE 5.2 - Thống kê Hoạt động:** Cung cấp các endpoint cho phép Admin theo dõi số liệu chi tiết về hoạt động của toàn hệ thống[cite: 11].