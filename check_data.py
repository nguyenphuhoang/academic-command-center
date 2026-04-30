from supabase import create_client

def check_junction():
    url = "https://kazegadihoouaccxaqkj.supabase.co"
    key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImthemVnYWRpaG9vdWFjY3hhcWtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczMjAyNzgsImV4cCI6MjA5Mjg5NjI3OH0.2R9RQ7gt41U9H3IlrYV_fFflW4N51sQtqEcQ6bDwioU"
    supabase = create_client(url, key)
    
    print("--- Testing class_students join students ---")
    try:
        res = supabase.table("class_students").select("mssv, students(name)").limit(1).execute()
        print(f"Success! {res.data}")
    except Exception as e:
        print(f"FAILED junction join: {str(e)}")

if __name__ == "__main__":
    check_junction()
