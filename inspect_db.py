from supabase import create_client

def create_bucket():
    url = "https://kazegadihoouaccxaqkj.supabase.co"
    key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImthemVnYWRpaG9vdWFjY3hhcWtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczMjAyNzgsImV4cCI6MjA5Mjg5NjI3OH0.2R9RQ7gt41U9H3IlrYV_fFflW4N51sQtqEcQ6bDwioU"
    
    supabase = create_client(url, key)
    
    print("--- ATTEMPTING TO CREATE BUCKET: documents ---")
    try:
        res = supabase.storage.create_bucket('documents', options={'public': True})
        print(f"SUCCESS: Created bucket 'documents'")
    except Exception as e:
        print(f"FAILED TO CREATE: {str(e)}")
        print("Maybe it already exists but list_buckets() failed, or no permissions.")

if __name__ == "__main__":
    create_bucket()
