# Hướng dẫn Sử dụng Academic Command Center 🎓

Chào mừng Giảng viên đến với hệ thống quản lý công việc học thuật của riêng mình! Dưới đây là các hướng dẫn cơ bản để bạn vận hành hệ thống một cách hiệu quả nhất.

## 1. Khởi động ứng dụng
Mỗi khi bạn bật máy tính, hãy thực hiện các bước sau để khởi động hệ thống:

### Bước 1: Khởi động Backend (Máy chủ dữ liệu)
1. Mở terminal và di chuyển vào thư mục dự án.
2. Chạy lệnh:
   ```bash
   cd backend
   python main.py
   ```
3. Giữ terminal này mở để máy chủ luôn hoạt động.

### Bước 2: Khởi động Frontend (Giao diện người dùng)
1. Mở một terminal mới (hoặc tab mới).
2. Di chuyển vào thư mục dự án và chạy lệnh:
   ```bash
   cd frontend
   npm run dev
   ```
3. Sau khi chạy xong, hãy truy cập vào địa chỉ: [http://localhost:3000](http://localhost:3000) trên trình duyệt.

---

## 2. Quản lý Môn học (Subjects)
Để hệ thống hoạt động tốt nhất, bạn nên tạo Môn học trước khi tạo Công việc.

1. Truy cập mục **"Môn Học (Subjects)"** trên thanh menu bên trái.
2. Nhấn nút **"+ Thêm môn học"**.
3. Nhập đầy đủ: Tên môn, Mã môn (VD: COMP101) và Học kỳ.
4. Nhấn **Lưu**. Môn học sẽ xuất hiện ngay lập tức trong danh sách.

---

## 3. Quản lý Công việc (Tasks)
Sau khi đã có môn học, bạn có thể tạo các đầu việc liên quan.

1. Truy cập mục **"Công việc (Tasks)"**.
2. Nhấn nút **"+ Thêm công việc"**.
3. **Quan trọng:** Tại ô "Môn học", hãy chọn môn học mà công việc này thuộc về từ danh sách sổ xuống.
4. Chọn Hạn chót (Deadline) và Trạng thái ban đầu.
5. Nhấn **Lưu**.

**Mẹo nhỏ:** Bạn có thể nhấn trực tiếp vào ô vuông bên trái mỗi công việc để đánh dấu "Hoàn thành" nhanh chóng!

---

## 4. Lưu trữ Tài liệu (Archive)
Bạn có thể tải lên các file PDF, Word hoặc hình ảnh để lưu giữ theo từng môn học.

1. Truy cập mục **"Lưu Trữ (Archive)"**.
2. Nhấn **"Tải lên tài liệu"**.
3. Chọn file từ máy tính, đặt tên gợi nhớ và **chọn Môn học** tương ứng.
4. Hệ thống sẽ tự động phân loại file bằng các biểu tượng màu sắc khác nhau.

---

## 5. Các tính năng thông minh khác
- **Tìm kiếm:** Sử dụng thanh tìm kiếm ở đầu mỗi trang để lọc nhanh dữ liệu.
- **Bộ lọc Trạng thái:** Ở trang Công việc, bạn có thể lọc để chỉ xem những việc "Chưa bắt đầu" hoặc "Đang thực hiện".
- **Dashboard:** Quay lại trang chủ bất cứ lúc nào bằng cách click vào Logo **"Command Center"** ở góc trên bên trái.

Chúc bạn có một học kỳ làm việc hiệu quả và thảnh thơi! 🚀
