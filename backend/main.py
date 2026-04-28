import os
from fastapi import FastAPI, HTTPException, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from dotenv import load_dotenv
from pydantic import BaseModel
from typing import List, Optional

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
    print("Warning: Supabase credentials not found. Check your environment variables.")

supabase: Client | None = None
if SUPABASE_URL and SUPABASE_KEY:
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
else:
    print("Warning: Supabase credentials not found. Check your .env file.")

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
        print(f"Upload error: {str(e)}")
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
        print(f"Dashboard error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
