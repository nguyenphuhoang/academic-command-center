# Quy tắc Phát triển và Quản lý Dự án (AI Development Rules)

Để đảm bảo tính ổn định của hệ thống và tránh các lỗi "mất dấu" trong tương lai, AI (Antigravity) cam kết tuân thủ các quy tắc sau đây trong suốt quá trình làm việc với dự án Academic Command Center.

## 1. Quản lý Cơ sở Dữ liệu (Database Management)
- **Migration-First**: Mọi thay đổi về cấu trúc bảng (thêm cột, tạo bảng mới) đều phải được ghi lại vào file `.sql` trong thư mục `supabase/migrations/`. 
- **Kiểm tra trước khi sửa**: Trước khi thực hiện bất kỳ lệnh nạp dữ liệu (sync) nào, AI phải kiểm tra xem các bảng liên quan có tồn tại trong database hay không bằng các script test.
- **Robustness**: Luôn sử dụng khối lệnh `try-except` khi thao tác với Database để tránh làm sập toàn bộ quy trình nếu có lỗi nhỏ xảy ra.

## 2. Quản lý Mã nguồn (Source Control)
- **Atomic Commits**: Mỗi khi hoàn thành một sửa đổi logic hoặc tính năng nhỏ, AI phải thực hiện `git commit` ngay lập tức với thông điệp rõ ràng.
- **Push & Deploy**: Khi người dùng yêu cầu "đẩy lên Vercel", AI phải đảm bảo mã nguồn đã được kiểm tra tại local và commit đầy đủ trước khi `push`.
- **Dọn dẹp**: Xóa bỏ các file rác, file log hoặc script test tạm thời sau khi sử dụng để giữ thư mục dự án sạch sẽ.

## 3. Duy trì Bối cảnh (Context Maintenance)
- **Project Status**: Luôn cập nhật tệp `project_status.md` sau mỗi phiên làm việc để làm "nguồn sự thật" (Source of Truth) cho các phiên làm việc sau.
- **Walkthrough**: Tạo hoặc cập nhật `walkthrough.md` để giải thích rõ ràng những gì đã thay đổi cho người dùng (đặc biệt là người dùng không chuyên về lập trình).

## 4. An toàn dữ liệu (Data Safety)
- **Backups**: Thường xuyên nhắc nhở người dùng về việc sao lưu dữ liệu quan trọng hoặc cấu hình môi trường (.env).
- **No placeholders**: Không sử dụng dữ liệu giả (placeholders) trong mã nguồn production.

## 5. Giao tiếp (Communication)
- **Giải thích đơn giản**: Tránh sử dụng quá nhiều thuật ngữ kỹ thuật phức tạp. Giải thích vấn đề và giải pháp theo cách mà một người không biết lập trình có thể hiểu được.

---
*Bản quy tắc này được tạo ra vào ngày 29/04/2026 và sẽ được AI tuân thủ nghiêm ngặt.*
