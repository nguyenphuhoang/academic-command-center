import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv("../.env")
url = os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL")
key = os.getenv("SUPABASE_ANON_KEY") or os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
supabase = create_client(url, key)

print("Checking class_students counts...")
try:
    classes = supabase.table("classes").select("id", "ma_lop").execute().data
    for c in classes:
        count = supabase.table("class_students").select("id", count="exact").eq("class_id", c["id"]).execute().count
        print(f"Class {c['ma_lop']}: {count} students")
except Exception as e:
    print(f"Error: {e}")
