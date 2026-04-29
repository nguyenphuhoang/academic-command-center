import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv("../.env")
url = os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL")
key = os.getenv("SUPABASE_ANON_KEY") or os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
supabase = create_client(url, key)

print("Checking data...")
try:
    sub_count = supabase.table("subjects").select("id", count="exact").execute().count
    print(f"Subjects count: {sub_count}")
    
    class_count = supabase.table("classes").select("id", count="exact").execute().count
    print(f"Classes count: {class_count}")
    
    student_count = supabase.table("students").select("mssv", count="exact").execute().count
    print(f"Students count: {student_count}")
except Exception as e:
    print(f"Error checking counts: {e}")
