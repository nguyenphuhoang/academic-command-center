from supabase import create_client

def inspect():
    url = "https://kazegadihoouaccxaqkj.supabase.co"
    key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImthemVnYWRpaG9vdWFjY3hhcWtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczMjAyNzgsImV4cCI6MjA5Mjg5NjI3OH0.2R9RQ7gt41U9H3IlrYV_fFflW4N51sQtqEcQ6bDwioU"
    
    supabase = create_client(url, key)
    
    print("--- BRUTE FORCE COLUMN DISCOVERY ---")
    # Thu lay id va class_id
    try:
        res = supabase.table('attendance_sessions').select('id,class_id').limit(1).execute()
        print("BASE COLUMNS: id, class_id EXIST")
    except Exception as e:
        print(f"BASE ERROR: {str(e)}")

if __name__ == "__main__":
    inspect()
