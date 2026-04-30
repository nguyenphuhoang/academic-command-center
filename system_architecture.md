# HỒ SƠ KỸ THUẬT HỆ THỐNG (SYSTEM ARCHITECTURE)
*Ngày cập nhật: 30/04/2026*

Tài liệu này lưu trữ toàn bộ cấu trúc hệ thống để đảm bảo tính nhất quán trong quá trình phát triển và bảo trì.

---

## 1. STORAGE (Supabase Storage)
- **Bucket chính**: `academic-docs`
- **Chế độ**: `Public`
- **Cấu trúc thư mục**: `{subject_id}/{filename}`

---

## 2. DATABASE SCHEMA (Supabase DB)

### Bảng: `subjects` (Môn học/Học phần)
- `id` (UUID, Primary Key)
- `name` (text) - Tên môn học (Ví dụ: Nền Móng)
- `code` (text) - Mã học phần (Ví dụ: 215NGM03)
- `semester` (text)

### Bảng: `classes` (Lớp học)
- `id` (UUID, Primary Key)
- `ma_lop` (text) - Mã lớp (Ví dụ: 215NGM0301)
- `subject_id` (UUID, Foreign Key -> subjects.id)
- `ten_mon` (text)

### Bảng: `documents` (Tài liệu lưu trữ)
- `id` (UUID, Primary Key)
- `subject_id` (UUID, Foreign Key)
- `name` (text) - Tên file
- `file_url` (text) - Link công khai
- `file_path` (text) - Đường dẫn trong Storage
- `file_type` (text)

### Bảng: `attendance_sessions` (Phiên điểm danh)
- `id` (UUID, Primary Key)
- `class_id` (UUID, Foreign Key)
- `created_at` (timestamp)
- *Lưu ý: Đã gỡ bỏ các cột GPS (teacher_lat/lng) để đảm bảo ổn định.*

### Bảng: `attendance_records` (Dữ liệu điểm danh)
- `id` (UUID, Primary Key)
- `session_id` (UUID)
- `mssv` (text)
- `distance` (float) - Mặc định 0 (GPS off)

---

## 3. CÁC LOGIC QUAN TRỌNG

### 1. Dọn dẹp sinh viên (Safe Cleanup)
- Chỉ xóa sinh viên khi: `(Không thuộc lớp nào) AND (Không có lịch sử điểm danh)`.
- Chạy tự động sau mỗi lần Sync (Excel/JSON).

### 2. Chuẩn hóa Học phần (Subject Normalization)
- Một **Học phần** (Subject) có thể chứa nhiều **Lớp học** (Classes).
- Tài liệu được lưu theo `subject_id` để dùng chung cho tất cả các lớp thuộc học phần đó.

---
**GHI CHÚ**: Tuyệt đối không tự ý thay đổi tên bảng/cột mà không cập nhật tài liệu này.
