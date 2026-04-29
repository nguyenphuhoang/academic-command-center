import os
from fastapi import FastAPI, HTTPException, File, UploadFile, Form
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from dotenv import load_dotenv
from pydantic import BaseModel
from typing import List, Optional
import math
# import pandas as pd (Removed for lightness)
from datetime import datetime
import io

# Try to load .env file (for local development)
if os.path.exists("../.env"):
    load_dotenv(dotenv_path="../.env")
else:
    # Render/Production will have env vars set directly
    load_dotenv()

app = FastAPI(title="Academic Command Center API")

# Setup CORS to allow Next.js frontend to talk to FastAPI
# For production, we allow all origins or specify the Vercel URL
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Supabase client
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL") or os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY") or os.getenv("SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    pass

supabase: Client | None = None
if SUPABASE_URL and SUPABASE_KEY:
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
else:
    pass

@app.get("/api/health")
def health_check():
    status = "healthy"
    supabase_status = "connected" if supabase else "disconnected"
    return {"status": status, "supabase": supabase_status, "message": "API backend is running!"}

@app.get("/api/test-supabase")
def test_supabase():
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase is not initialized.")
    return {"status": "success", "message": "Supabase client is successfully configured."}

class SubjectCreate(BaseModel):
    name: str
    code: str
    semester: str

class TaskCreate(BaseModel):
    title: str
    deadline: str
    status: str
    subject_id: str

class SessionCreate(BaseModel):
    class_id: str
    lat: float
    lng: float

class AttendanceSubmit(BaseModel):
    session_id: str
    mssv: str
    lat: float
    lng: float
    device_id: str

def calculate_distance(lat1, lon1, lat2, lon2):
    # Earth radius in meters
    R = 6371000
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    
    a = math.sin(dphi / 2)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

@app.get("/api/classes")
def get_classes():
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase is not initialized.")
    try:
        response = supabase.table("classes").select("*").execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/subjects")
def get_subjects():
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase is not initialized.")
    try:
        response = supabase.table("subjects").select("*").execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/subjects")
def create_subject(subject: SubjectCreate):
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase is not initialized.")
    try:
        data, count = supabase.table("subjects").insert({
            "name": subject.name,
            "code": subject.code,
            "semester": subject.semester
        }).execute()
        return data[1][0] if len(data) > 1 and len(data[1]) > 0 else data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/tasks")
def get_tasks():
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase is not initialized.")
    try:
        # Join with subjects to get the subject name
        response = supabase.table("tasks").select("*, subjects(name)").execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/tasks")
def create_task(task: TaskCreate):
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase is not initialized.")
    try:
        data, count = supabase.table("tasks").insert({
            "title": task.title,
            "deadline": task.deadline,
            "status": task.status,
            "subject_id": task.subject_id
        }).execute()
        return data[1][0] if len(data) > 1 and len(data[1]) > 0 else data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.patch("/api/tasks/{task_id}")
def update_task_status(task_id: str, status: str):
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase is not initialized.")
    try:
        data, count = supabase.table("tasks").update({"status": status}).eq("id", task_id).execute()
        return data[1][0] if len(data) > 1 and len(data[1]) > 0 else data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/documents")
def get_documents():
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase is not initialized.")
    try:
        # Fetch documents joined with subject name
        response = supabase.table("documents").select("*, subjects(name)").execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/documents/upload")
async def upload_document(
    file: UploadFile = File(...),
    name: str = Form(...),
    subject_id: str = Form(...)
):
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase is not initialized.")
    
    try:
        # 1. Read file content
        file_content = await file.read()
        file_ext = os.path.splitext(file.filename)[1]
        file_path = f"{subject_id}/{os.urandom(8).hex()}_{file.filename}"
        
        # 2. Upload to Supabase Storage
        # Note: Bucket must be created manually or we handle it if possible.
        # supabase.storage.create_bucket('academic-docs') might fail if no permissions.
        storage_response = supabase.storage.from_("academic-docs").upload(
            path=file_path,
            file=file_content,
            file_options={"content-type": file.content_type}
        )
        
        # 3. Get Public URL
        public_url = supabase.storage.from_("academic-docs").get_public_url(file_path)
        
        # 4. Save metadata to database
        doc_data = {
            "name": name,
            "file_url": public_url,
            "file_path": file_path,
            "subject_id": subject_id,
            "file_type": file.content_type or file_ext
        }
        
        db_response = supabase.table("documents").insert(doc_data).execute()
        return db_response.data[0] if db_response.data else doc_data
        
    except Exception as e:
        
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/dashboard/summary")
def get_dashboard_summary():
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase is not initialized.")
    try:
        # 1. Get counts
        subjects_res = supabase.table("subjects").select("id", count="exact").execute()
        tasks_res = supabase.table("tasks").select("id", count="exact").neq("status", "Hoàn thành").execute()
        docs_res = supabase.table("documents").select("id", count="exact").execute()
        
        # 2. Get recent tasks (Top 5)
        recent_tasks = supabase.table("tasks").select("*, subjects(name)").neq("status", "Hoàn thành").order("deadline").limit(5).execute()
        
        return {
            "stats": {
                "subjects": subjects_res.count if subjects_res.count is not None else 0,
                "tasks_pending": tasks_res.count if tasks_res.count is not None else 0,
                "documents": docs_res.count if docs_res.count is not None else 0
            },
            "recent_tasks": recent_tasks.data or []
        }
    except Exception as e:
        
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/attendance/session")
def create_attendance_session(session: SessionCreate):
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase is not initialized.")
    try:
        target_class_id = session.class_id
        
        # Nếu class_id gửi lên không phải UUID (mà là mã lớp như 225NMG03)
        # thì ta đi tìm ID thực sự của nó trong bảng classes
        if len(str(target_class_id)) < 20: # Heuristic check for non-UUID
            class_res = supabase.table("classes").select("id").eq("ma_lop", str(target_class_id).strip()).execute()
            if class_res.data:
                target_class_id = class_res.data[0]["id"]
            else:
                # Nếu chưa có lớp này trong bảng classes, tạo mới luôn
                new_class = supabase.table("classes").insert({
                    "ma_lop": str(target_class_id).strip(),
                    "ten_mon": f"Lớp {target_class_id}"
                }).execute()
                if new_class.data:
                    target_class_id = new_class.data[0]["id"]

        response = supabase.table("attendance_sessions").insert({
            "class_id": target_class_id,
            "teacher_lat": session.lat,
            "teacher_lng": session.lng,
            "status": "active"
        }).execute()
        return response.data[0] if response.data else {"status": "error"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/attendance/submit")
def submit_attendance(submission: AttendanceSubmit):
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase is not initialized.")
    try:
        # 1. Get session info to get teacher's location
        session_res = supabase.table("attendance_sessions").select("*").eq("id", submission.session_id).single().execute()
        if not session_res.data:
            raise HTTPException(status_code=404, detail="Buổi điểm danh không tồn tại.")
        
        session = session_res.data
        if session["status"] != "active":
            raise HTTPException(status_code=400, detail="Buổi điểm danh này đã kết thúc.")

        # --- Kiểm tra Chống gian lận (Device Locking) ---
        student_res = supabase.table("students").select("*").eq("mssv", submission.mssv).execute()
        if not student_res.data:
            raise HTTPException(status_code=404, detail="Không tìm thấy thông tin sinh viên.")
        student = student_res.data[0]

        current_device_id = student.get("current_device_id")
        
        if not current_device_id:
            # Bước B: Lần đầu tiên điểm danh, cập nhật device_id
            supabase.table("students").update({"current_device_id": submission.device_id}).eq("mssv", submission.mssv).execute()
        else:
            # Bước C: So sánh device_id
            if current_device_id != submission.device_id:
                raise HTTPException(status_code=400, detail="Thiết bị này không khớp với thiết bị bạn đã đăng ký. Vui lòng liên hệ giảng viên để reset.")

        # Bước D: Kiểm tra 1 máy không được điểm danh cho nhiều người trong cùng session
        attended_res = supabase.table("attendance_records").select("mssv").eq("session_id", submission.session_id).execute()
        attended_mssvs = [r["mssv"] for r in attended_res.data if r["mssv"] != submission.mssv]
        
        if attended_mssvs:
            duplicate_device_res = supabase.table("students").select("mssv").eq("current_device_id", submission.device_id).in_("mssv", attended_mssvs).execute()
            if duplicate_device_res.data:
                raise HTTPException(status_code=400, detail="Thiết bị này đã được sử dụng để điểm danh cho một sinh viên khác trong buổi học này.")
        # -----------------------------------------------

        # 2. Calculate distance
        dist = calculate_distance(
            session["teacher_lat"], session["teacher_lng"],
            submission.lat, submission.lng
        )

        # 3. Check distance (<= 100m)
        if dist > 100:
            raise HTTPException(status_code=400, detail=f"Bạn đang ở quá xa vị trí điểm danh ({dist:.1f}m).")

        # 4. Save record
        record_res = supabase.table("attendance_records").insert({
            "session_id": submission.session_id,
            "mssv": submission.mssv,
            "student_lat": submission.lat,
            "student_lng": submission.lng,
            "distance": dist
            # "device_id": submission.device_id  # Tạm ẩn vì CSDL chưa có cột này
        }).execute()
        
        return {
            "status": "success",
            "message": "Điểm danh thành công!",
            "distance": dist,
            "data": record_res.data[0] if record_res.data else None
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.patch("/api/attendance/session/{session_id}")
def update_attendance_session_status(session_id: str, status: str):
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase is not initialized.")
    try:
        res = supabase.table("attendance_sessions").update({"status": status}).eq("id", session_id).execute()
        return res.data[0] if res.data else {"status": "error"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

import openpyxl
import openpyxl.styles

@app.post("/api/admin/sync-students")
async def sync_students_from_excel(file: UploadFile = File(...)):
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase is not initialized.")
    
    try:
        # Read file content into memory buffer
        contents = await file.read()
        buffer = io.BytesIO(contents)

        # Load workbook using openpyxl (much lighter than pandas)
        wb = openpyxl.load_workbook(buffer, data_only=True)
        sheet = wb.active

        # --- DYNAMIC SEARCH LOGIC ---
        class_code = None
        start_row = 7 # Default fallback
        
        # 1. Scan for Class Code and Table Header
        for r in range(1, 15): # Scan first 15 rows
            for c in range(1, 10): # Scan first 10 columns
                val = str(sheet.cell(row=r, column=c).value or "").strip()
                
                # Search for Class Code (Look for pattern like 225NMG...)
                if not class_code and len(val) >= 7 and any(char.isdigit() for char in val):
                    # Simple heuristic: if it looks like a class code and is in a likely spot
                    if r < 5: class_code = val
                
                # Search for Table Header to find where data starts
                if "Mã SV" in val or "MSSV" in val:
                    start_row = r + 1
                    break

        if not class_code:
            class_code = sheet.cell(row=1, column=5).value or "UNKNOWN"

        # 2. Read Student Data
        students_data = []
        for row in range(start_row, sheet.max_row + 1):
            mssv = sheet.cell(row=row, column=2).value
            if not mssv: 
                if row > start_row + 10: break
                continue
            
            first_name = sheet.cell(row=row, column=3).value or ""
            last_name = sheet.cell(row=row, column=4).value or ""
            name = f"{str(first_name).strip()} {str(last_name).strip()}".strip()
            
            # Read REAL Email from Column F (Column 6)
            email = sheet.cell(row=row, column=6).value
            if not email:
                # Fallback if email is missing in some rows
                email = f"{str(mssv).strip()}@student.edu.vn"
            
            students_data.append({
                "mssv": str(mssv).strip(),
                "name": name,
                "email": str(email).strip(),
                "class_code": str(class_code).strip()
            })

        if not students_data:
            raise HTTPException(status_code=400, detail=f"Không tìm thấy dữ liệu sinh viên hợp lệ (Bắt đầu quét từ dòng {start_row}).")

        # Upsert into students table
        res = supabase.table("students").upsert(students_data, on_conflict="mssv").execute()
        
        return {"status": "success", "count": len(students_data), "class_code": str(class_code).strip()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi xử lý file Excel: {str(e)}")

@app.post("/api/attendance/session/{session_id}/finalize")
async def finalize_attendance(session_id: str):
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase is not initialized.")
    
    try:
        # 1. Mark session as inactive
        session_res = supabase.table("attendance_sessions").update({"status": "inactive"}).eq("id", session_id).execute()
        if not session_res.data:
            raise HTTPException(status_code=404, detail="Không tìm thấy phiên điểm danh.")
        
        session_info = session_res.data[0]
        class_id = session_info["class_id"]
        
        # Get class info
        class_res = supabase.table("classes").select("*").eq("id", class_id).single().execute()
        class_name = class_res.data["ten_mon"] if class_res.data else "Lớp học"

        # 2. Get all students for this class_code
        class_code = str(class_res.data["ma_lop"]).strip()
        all_students_res = supabase.table("students").select("*").ilike("class_code", class_code).execute()
        all_students = all_students_res.data or []

        # 3. Get all present students for this session
        present_res = supabase.table("attendance_records").select("mssv").eq("session_id", session_id).execute()
        present_mssvs = {r["mssv"] for r in present_res.data}

        # 4. Find absent students
        absent_students = [s for s in all_students if s["mssv"] not in present_mssvs]

        return {
            "status": "success",
            "present_count": len(present_mssvs),
            "absent_count": len(absent_students)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.patch("/api/students/{mssv}/reset-device")
def reset_student_device(mssv: str):
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase is not initialized.")
    try:
        res = supabase.table("students").update({"current_device_id": None}).eq("mssv", mssv).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Không tìm thấy sinh viên.")
        return {"status": "success", "message": "Đã reset thiết bị thành công"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/attendance/sessions/{session_id}/status")
def get_session_status(session_id: str):
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase is not initialized.")
    try:
        # Get session info to get class_id
        session_res = supabase.table("attendance_sessions").select("class_id").eq("id", session_id).single().execute()
        if not session_res.data:
            raise HTTPException(status_code=404, detail="Không tìm thấy phiên điểm danh")
            
        class_id = session_res.data["class_id"]
        
        # Get class_code
        class_res = supabase.table("classes").select("ma_lop").eq("id", class_id).single().execute()
        if not class_res.data:
            raise HTTPException(status_code=404, detail="Không tìm thấy lớp học")
            
        class_code = str(class_res.data["ma_lop"]).strip()
        print(f"DEBUG: Fetching students for class_code: '{class_code}'") # Log để kiểm tra
        
        # Get all students for this class_code - Use ilike for case-insensitive
        students_res = supabase.table("students").select("*").ilike("class_code", class_code).execute()
        all_students = students_res.data or []
        
        # Get present students for this session
        records_res = supabase.table("attendance_records").select("mssv, distance, created_at").eq("session_id", session_id).execute()
        present_records = records_res.data or []
        
        # Map present mssvs
        present_map = {r["mssv"]: r for r in present_records}
        
        present_students = []
        absent_students = []
        
        for student in all_students:
            if student["mssv"] in present_map:
                record = present_map[student["mssv"]]
                student_info = {
                    **student, 
                    "status": "present", 
                    "distance": record["distance"], 
                    "timestamp": record["created_at"]
                }
                present_students.append(student_info)
            else:
                student_info = {
                    **student, 
                    "status": "absent"
                }
                absent_students.append(student_info)
                
        return {
            "present": present_students,
            "absent": absent_students
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/attendance/sessions/{session_id}/export-absentees")
def export_absentees(session_id: str):
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase is not initialized.")
    try:
        # 1. Get session info to get class_id
        session_res = supabase.table("attendance_sessions").select("class_id").eq("id", session_id).single().execute()
        if not session_res.data:
            raise HTTPException(status_code=404, detail="Không tìm thấy phiên điểm danh")
            
        class_id = session_res.data["class_id"]
        
        # 2. Get class info
        class_res = supabase.table("classes").select("ma_lop", "ten_mon").eq("id", class_id).single().execute()
        if not class_res.data:
            raise HTTPException(status_code=404, detail="Không tìm thấy lớp học")
            
        class_code = str(class_res.data["ma_lop"]).strip()
        class_name = class_res.data["ten_mon"]
        
        # 3. Get all students for this class_code
        students_res = supabase.table("students").select("*").ilike("class_code", class_code).execute()
        all_students = students_res.data or []
        
        # 4. Get present students for this session
        records_res = supabase.table("attendance_records").select("mssv").eq("session_id", session_id).execute()
        present_mssvs = {r["mssv"] for r in (records_res.data or [])}
        
        # 5. Filter absent students
        absent_students = [s for s in all_students if s["mssv"] not in present_mssvs]
        
        # 6. Create Excel using openpyxl
        output = io.BytesIO()
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "DanhSachVang"
        
        now_str = datetime.now().strftime("%d/%m/%Y %H:%M")

        if not absent_students:
            ws.append(["Thông báo"])
            ws.append([f"Buổi điểm danh ngày {now_str}: Lớp đi đủ 100%"])
        else:
            # Add Headers
            headers_list = ["STT", "MSSV", "Họ Tên", "Mã Lớp HP", "Trạng Thái", "Thời Gian"]
            ws.append(headers_list)
            
            # Add Data
            for i, student in enumerate(absent_students, 1):
                ws.append([
                    i,
                    student.get("mssv", ""),
                    student.get("name", ""),
                    class_code, # Đây là mã lớp học phần (ví dụ 225NMG03)
                    "Vắng",
                    now_str # Thời gian điểm danh
                ])
        
        # Format headers
        for cell in ws[1]:
            cell.font = openpyxl.styles.Font(bold=True)

        wb.save(output)
        output.seek(0)
        
        # 8. Setup Response
        today_str = datetime.now().strftime("%d-%m-%Y")
        filename = f"Vang_mat_{class_code}_{today_str}.xlsx"
        
        headers = {
            'Content-Disposition': f'attachment; filename="{filename}"'
        }
        
        return StreamingResponse(
            output, 
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers=headers
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/admin/students")
def get_all_students():
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase is not initialized.")
    try:
        # Get all students ordered by class and name
        res = supabase.table("students").select("*").order("class_code").order("name").execute()
        return res.data or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
