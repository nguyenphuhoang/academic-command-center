import os
from supabase import create_client, Client
from dotenv import load_dotenv

# Try to load .env file
if os.path.exists(".env"):
    load_dotenv(dotenv_path=".env")
elif os.path.exists("../.env"):
    load_dotenv(dotenv_path="../.env")

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL") or os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY") or os.getenv("SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Error: Supabase credentials not found.")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def inspect_table(table_name):
    print(f"\n--- Table: {table_name} ---")
    try:
        # Get one row to see columns
        res = supabase.table(table_name).select("*").limit(1).execute()
        if res.data:
            print("Columns found:", list(res.data[0].keys()))
        else:
            print("Table empty, cannot detect columns via select *.")
    except Exception as e:
        print(f"Error inspecting {table_name}: {e}")

tables = ["students", "classes", "subjects", "class_students", "attendance_sessions", "attendance_records", "tasks", "documents"]
for t in tables:
    inspect_table(t)
