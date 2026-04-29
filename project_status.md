# Trạng thái Dự án: Academic Command Center

Bản tóm tắt này giúp AI nắm bắt nhanh bối cảnh dự án khi bắt đầu một phiên chat mới.

## 1. Thông tin chung
- **Công nghệ:** FastAPI (Backend), Next.js (Frontend), Supabase (Database).
- **Mục tiêu:** Hệ thống điểm danh thời gian thực, chống gian lận và quản lý lớp học.
- **Trạng thái:** Đã ổn định (Production Ready). Xem [HANDOVER.md](HANDOVER.md) khi chuyển sang phiên chat mới.

## 2. Các tính năng đã hoàn thiện
- [x] **Điểm danh Real-time:** Kiểm tra GPS (100m) và Device ID (Chống gian lận).
- [x] **Quản lý thiết bị:** Reset `current_device_id` cho sinh viên.
- [x] **Báo cáo:** Xuất danh sách sinh viên vắng mặt ra file Excel (.xlsx) dựa trên bảng liên kết `class_students`.
- [x] **Admin Sync**: Đã đạt trạng thái hoàn hảo (Production Grade). Sử dụng chiến lược "Thiết quân luật" (Martial Law Sync) với Atomic Batch Upsert và Unique Constraints trên Supabase. Đã xử lý triệt để lỗi race condition và trùng lặp dữ liệu.
- [x] **UI/UX**: Giao diện Dashboard giáo viên, trang điểm danh sinh viên, trang quản trị đồng bộ. Đã tối ưu hóa việc phá cache (cache-busting) để hiển thị dữ liệu mới nhất ngay lập tức.

## 3. Cấu hình Quan trọng
- **Backend URL:** `https://academic-command-center.onrender.com`
- **Biến môi trường:** 
  - Frontend: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_API_URL`.
  - Backend: `SUPABASE_URL`, `SUPABASE_ANON_KEY`.

## 4. Cấu trúc Thư mục
- `/backend`: Chứa `main.py` (API chính) và `requirements.txt`.
- `/frontend`: Chứa mã nguồn Next.js (App Router).
- `/danh-sach-sinh-vien`: Nơi lưu trữ các file Excel mẫu.

## 5. Lưu ý cho phiên chat sau
- Khi bắt đầu chat mới, hãy yêu cầu AI đọc `backend/main.py` để hiểu các logic API hiện tại.
- Kiểm tra file `walkthrough.md` để xem chi tiết các bước đã thực hiện gần nhất.
