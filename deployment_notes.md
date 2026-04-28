# Hướng dẫn Triển khai (Deployment Guide) 🚀

Dự án đã được chuẩn bị sẵn sàng để triển khai lên môi trường Production (Render cho Backend và Vercel cho Frontend).

## 1. Triển khai Backend (Render.com)
1. Truy cập [Render.com](https://render.com) và tạo một **Web Service** mới.
2. Kết nối với repository GitHub của bạn.
3. Cấu hình các thông số:
   - **Environment**: `Python`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. **Environment Variables**: Thêm các biến sau vào phần Settings của Render:
   - `SUPABASE_URL`: (Lấy từ Supabase Dashboard)
   - `SUPABASE_ANON_KEY`: (Lấy từ Supabase Dashboard)

---

## 2. Triển khai Frontend (Vercel.com)
1. Truy cập [Vercel.com](https://vercel.com) và tạo một **Project** mới.
2. Kết nối với repository GitHub.
3. **Environment Variables**: Thêm biến sau vào cấu hình dự án:
   - `NEXT_PUBLIC_API_URL`: Nhập địa chỉ URL mà Render vừa cấp cho bạn (VD: `https://your-api.onrender.com`).
4. Nhấn **Deploy**.

---

## 3. Lưu ý Quan trọng về Bảo mật
- **KHÔNG BAO GIỜ** upload file `.env` hoặc `.env.local` lên GitHub. Tôi đã thêm chúng vào `.gitignore` để bảo vệ bạn.
- Khi triển khai, luôn sử dụng phần **Environment Variables** trên dashboard của Vercel/Render để nhập các khóa bí mật.

Chúc mừng bạn đã hoàn thành hệ thống "Academic Command Center"! Nếu cần hỗ trợ gì thêm, hãy cho tôi biết nhé.
