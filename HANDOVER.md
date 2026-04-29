# HANDOVER - ACADEMIC COMMAND CENTER
**Ngày cập nhật:** 29/04/2026

## 1. BỐI CẢNH DỰ ÁN
Dự án là hệ thống quản lý học thuật cho Giảng viên.
- **Frontend**: Next.js (Vercel) - [https://academic-command-center.vercel.app](https://academic-command-center.vercel.app)
- **Backend**: FastAPI (Render) - [https://academic-command-center.onrender.com](https://academic-command-center.onrender.com)
- **Database**: Supabase.

## 2. TRẠNG THÁI HIỆN TẠI (ĐÃ XỬ LÝ)
- **Đồng bộ Excel (Martial Law Sync)**: Đã xử lý logic cực kỳ chặt chẽ, sử dụng `upsert` nguyên tử dựa trên các UNIQUE CONSTRAINT (`ma_lop` cho classes và `class_id, mssv` cho class_students). Đây là cấu trúc "bất khả xâm phạm" để tránh lỗi 42P10 và trùng lặp dữ liệu.
- **Điểm danh**: Đã sửa lỗi logic tính toán sinh viên vắng mặt sử dụng bảng `class_students`. Hoạt động Real-time qua Supabase.
- **API Connectivity**: Đã fix lỗi kết nối từ Vercel tới Render bằng cách hardcode fallback URL trong frontend.
- **Database Structure**: Đã có file migration tại `supabase/migrations/001_initial_schema.sql`.

## 3. CÁC QUY TẮC BẮT BUỘC CHO AI MỚI (MANDATORY)
*Đọc kỹ tệp `development_rules.md` và `.cursorrules` trước khi làm.*
- **Không được hỏi lại ngữ cảnh**: Mọi thông tin nằm trong `project_status.md` và `HANDOVER.md`.
- **Database Safety**: Không sửa bảng trực tiếp nếu không cập nhật file migration.
- **Vietnamese Language**: Luôn giao tiếp bằng tiếng Việt đơn giản cho người không chuyên.
- **Production URL**: Luôn ưu tiên dùng Render URL làm fallback cho API trong frontend.

## 4. VIỆC CẦN LÀM TIẾP THEO (NEXT STEPS)
- Kiểm tra tính năng "Lưu trữ tài liệu" (Archive) sau khi nạp môn học thành công.
- Theo dõi xem có lỗi phát sinh khi sinh viên điểm danh thực tế không.
- Hỗ trợ giảng viên tạo thêm các Task cho từng môn học.

---
**GỬI AI MỚI:** Hãy bắt đầu bằng việc đọc `project_status.md` và xác nhận bạn đã hiểu toàn bộ kiến trúc dự án. ĐỪNG hỏi lại những gì đã có trong tài liệu.
