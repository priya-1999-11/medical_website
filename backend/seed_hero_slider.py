"""
Seed script for Hero Slider Images Module
"""
from supabase import create_client, Client
from dotenv import load_dotenv
import os
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

supabase_url = os.environ.get('SUPABASE_URL') or os.environ.get('REACT_APP_SUPABASE_URL', 'https://rdhoikphrxgyoyqdqzat.supabase.co')
supabase_key = os.environ.get('SUPABASE_KEY') or os.environ.get('REACT_APP_SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkaG9pa3BocnhneW95cWRxemF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0MjExODksImV4cCI6MjA4OTk5NzE4OX0.VaKH0kUoQqg81Tpr_Zxpnaifi8zJndCpaVawRxQMBHU')

try:
    supabase_client: Client = create_client(supabase_url, supabase_key)
except Exception as e:
    print(f"Error connecting to Supabase: {e}")
    supabase_client = None

DEFAULT_SLIDER_IMAGES = [
    {
        "title": "Main Integrated Care Complex",
        "image_url": "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=1200&auto=format&fit=crop",
        "display_order": 1,
        "is_active": True
    },
    {
        "title": "Advanced Surgical & Trauma Center",
        "image_url": "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?q=80&w=1200&auto=format&fit=crop",
        "display_order": 2,
        "is_active": True
    },
    {
        "title": "Dedicated Family Health & Neonatal Care",
        "image_url": "https://images.unsplash.com/photo-1502740479091-635887520276?q=80&w=1200&auto=format&fit=crop",
        "display_order": 3,
        "is_active": True
    }
]

def seed_slider():
    print("Beginning Hero Slider Data Seeding...")
    if not supabase_client:
        print("Warning: Supabase client is not available.")
        return
    try:
        # Clear existing records to ensure new titles are applied
        print("Clearing existing slider images...")
        supabase_client.table('hero_slider_images').delete().neq('image_url', '').execute()
        
        print(f"Upserting {len(DEFAULT_SLIDER_IMAGES)} records into 'hero_slider_images'...")
        supabase_client.table('hero_slider_images').upsert(DEFAULT_SLIDER_IMAGES).execute()
        print("[OK] Hero slider images seeded successfully.")
    except Exception as e:
        print(f"Error seeding hero_slider_images: {e}")

if __name__ == "__main__":
    seed_slider()
