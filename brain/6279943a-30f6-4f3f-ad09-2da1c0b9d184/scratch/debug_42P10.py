import os
from supabase import create_client, Client
from dotenv import load_dotenv

# Load env
if os.path.exists(".env"):
    load_dotenv(dotenv_path=".env")
elif os.path.exists("../.env"):
    load_dotenv(dotenv_path="../.env")

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL") or os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY") or os.getenv("SUPABASE_ANON_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def test_upsert(table, data, conflict):
    print(f"\n--- Testing {table} with conflict {conflict} ---")
    try:
        res = supabase.table(table).upsert(data, on_conflict=conflict).execute()
        print(f"SUCCESS: {table}")
    except Exception as e:
        print(f"FAILED: {table} - {e}")

# Test Subjects
test_upsert("subjects", {"name": "Test Subject 123", "code": "TEST", "semester": "225"}, "name")

# Test Classes
test_upsert("classes", {"ma_lop": "TEST_CLASS_123", "ten_mon": "Test", "semester": "225"}, "ma_lop")

# Test Students
test_upsert("students", {"mssv": "99999999", "name": "Test Student"}, "mssv")

# Test Class Students
test_upsert("class_students", {"class_id": "00000000-0000-0000-0000-000000000000", "mssv": "99999999"}, "class_id,mssv")
