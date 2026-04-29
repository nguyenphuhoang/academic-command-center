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

def check_constraints():
    print("\n--- Checking Constraints for class_students ---")
    try:
        # We can try to run a raw SQL if the client supports it, 
        # but the supabase-py client doesn't expose it directly easily for DDL info.
        # Instead, we can try a manual insert that should conflict and see the error message.
        
        # Or we can try to fetch table info via RPC if available.
        # Most likely, we can just try an upsert with on_conflict and see if it fails with 42P10.
        
        dummy_data = {"class_id": "00000000-0000-0000-0000-000000000000", "mssv": "test"} # Likely fails FK
        res = supabase.table("class_students").upsert(dummy_data, on_conflict="class_id,mssv").execute()
        print("Upsert attempt result:", res)
    except Exception as e:
        print(f"Error during test upsert: {e}")

check_constraints()
