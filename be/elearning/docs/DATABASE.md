# THIẾT KẾ CƠ SỞ DỮ LIỆU (DATABASE DESIGN)
**Dự án:** Hệ thống Website Hỗ trợ Học tập Trực tuyến (E-Learning)

---

## 1. TỔNG QUAN (OVERVIEW)
Hệ thống sử dụng cơ sở dữ liệu quan hệ **PostgreSQL** (thông qua **Supabase**). Thiết kế tập trung vào việc quản lý thực thể học tập, theo dõi tiến độ và hỗ trợ các tính năng thời gian thực.

## 2. QUY TẮC THIẾT KẾ (DATABASE RULES)
* **Naming Convention:** Tên bảng và tên cột sử dụng `snake_case` (ví dụ: `user_id`, `created_at`).
* **Soft Delete:** Các bảng quan trọng như `courses`, `lessons` sử dụng cột `is_deleted` (boolean) để bảo toàn dữ liệu lịch sử.
* **Audit Columns:** Mọi bảng đều phải có `created_at` và `updated_at` để theo dõi thời gian.
* **Logical Constraints:** Không xóa cứng các bản ghi đã có dữ liệu phát sinh (ví dụ: không xóa khóa học nếu đã có học viên đăng ký).

---

## 3. DANH SÁCH CÁC BẢNG CHÍNH (KEY TABLES)

### 3.1. Quản lý Người dùng & Phân quyền
* **`users`**: Lưu trữ thông tin tài khoản (email, password, full_name, avatar).
* **`roles`**: Định nghĩa các vai trò: `ADMIN`, `TEACHER`, `STUDENT`.
* **`user_roles`**: Bảng trung gian để quản lý phân quyền (RBAC).

### 3.2. Quản lý Nội dung Học tập
* **`courses`**: Thông tin tổng quan về khóa học (tên, mô tả, giảng viên phụ trách).
* **`lessons`**: Chi tiết các bài giảng thuộc khóa học, bao gồm tài liệu và nội dung.
* **`assignments`**: Các bài tập được thiết lập kèm theo thời hạn nộp (`deadline`).

### 3.3. Theo dõi Tiến độ & Đánh giá
* **`enrollments`**: Quản lý việc học viên tham gia vào các lớp học/khóa học.
* **`submissions`**: Lưu trữ bài nộp của học viên, trạng thái nộp (đúng hạn/muộn) và điểm số[cite: 7].
* **`quizzes` & `quiz_results`**: Quản lý các cuộc thi trực tuyến và phân tích năng lực học viên.

### 3.4. Tương tác & Thông báo
* **`messages`**: Lưu trữ nội dung nhắn tin realtime giữa người dùng.
* **`notifications`**: Lưu trữ các thông báo nhắc nhở deadline và hoạt động hệ thống.

---

## 4. QUAN HỆ GIỮA CÁC THỰC THỂ (ERD HIGHLIGHTS)
* **One-to-Many:** Một Khóa học (`courses`) có nhiều Bài giảng (`lessons`) và Bài tập (`assignments`).
* **Many-to-Many:** Một Học viên có thể tham gia nhiều Khóa học và một Khóa học có nhiều Học viên (thông qua bảng `enrollments`).
* **Realtime Enable:** Các bảng `messages` và `notifications` được kích hoạt tính năng **Supabase Realtime** để đẩy dữ liệu tức thì lên phía Client[cite: 17].

---

## 5. TỐI ƯU HÓA & BẢO MẬT
* **Indexing:** Đánh index cho các cột thường xuyên tìm kiếm như `email`, `course_id`, và `deadline`.
* **Row Level Security (RLS):** Sử dụng tính năng RLS của Supabase để đảm bảo học viên chỉ xem được dữ liệu của chính mình và giảng viên chỉ quản lý được các lớp họ phụ trách[cite: 17].
* **Data Snapshotting:** Điểm số và thông tin bài tập tại thời điểm nộp bài được lưu cứng vào `submissions` để tránh thay đổi khi giảng viên cập nhật đề bài sau đó.