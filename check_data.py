from supabase import create_client

def check():
    url = "https://kazegadihoouaccxaqkj.supabase.co"
    key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImthemVnYWRpaG9vdWFjY3hhcWtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczMjAyNzgsImV4cCI6MjA5Mjg5NjI3OH0.2R9RQ7gt41U9H3IlrYV_fFflW4N51sQtqEcQ6bDwioU"
    supabase = create_client(url, key)
    
    subs = supabase.table('subjects').select('id, name').execute()
    print(f"Subjects: {len(subs.data)}")
    for s in subs.data:
        print(f" - {s['name']} ({s['id']})")
        
    docs = supabase.table('documents').select('id').execute()
    print(f"Documents: {len(docs.data)}")

if __name__ == "__main__":
    check()
