"""
Seed script for Hospital Wise Module - Populates hospitals, departments, doctors, availability,
diagnostic tests, diagnostic packages, package_tests, reviews, and gallery images.
"""
from supabase import create_client, Client
from dotenv import load_dotenv
import os
from pathlib import Path
import json
import uuid
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

supabase_url = os.environ.get('SUPABASE_URL') or os.environ.get('REACT_APP_SUPABASE_URL', 'https://rdhoikphrxgyoyqdqzat.supabase.co')
supabase_key = os.environ.get('SUPABASE_KEY') or os.environ.get('REACT_APP_SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkaG9pa3BocnhneW95cWRxemF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0MjExODksImV4cCI6MjA4OTk5NzE4OX0.VaKH0kUoQqg81Tpr_Zxpnaifi8zJndCpaVawRxQMBHU')

try:
    supabase_client: Client = create_client(supabase_url, supabase_key)
except Exception as e:
    print(f"Error connecting to Supabase: {e}")
    supabase_client = None

# Pre-defined deterministic UUIDs for relational integrity
HOSPITAL_IDS = {
    "main": "11111111-1111-4111-a111-111111111111",
    "eastside": "22222222-2222-4222-a222-222222222222",
    "metro": "33333333-3333-4333-a333-333333333333",
    "northland": "44444444-4444-4444-a444-444444444444"
}

SEED_DATA = {
    "hospitals": [
        {
            "id": HOSPITAL_IDS["main"],
            "hospital_name": "Clinical Serenity Main Campus",
            "hospital_code": "CS-MAIN-001",
            "logo_url": "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=200&h=200&auto=format&fit=crop",
            "banner_url": "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=1200&h=400&auto=format&fit=crop",
            "description": "State-of-the-art super-specialty tertiary care hospital with 500+ beds, level 1 trauma center, and advanced robotic surgery suite.",
            "address": "123 Clinical Ave, Medical District",
            "city": "Citywest",
            "state": "California",
            "pincode": "50210",
            "phone": "+1 (800) 555-0199",
            "email": "main.campus@clinicalserenity.com",
            "website": "https://clinicalserenity.com",
            "latitude": 37.7749,
            "longitude": -122.4194,
            "rating": 4.9,
            "total_reviews": 128,
            "opening_time": "00:00:00",
            "closing_time": "23:59:59",
            "is_open": True,
            "status": "active"
        },
        {
            "id": HOSPITAL_IDS["eastside"],
            "hospital_name": "Serenity Eastside Specialty Center",
            "hospital_code": "CS-EAST-002",
            "logo_url": "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?q=80&w=200&h=200&auto=format&fit=crop",
            "banner_url": "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?q=80&w=1200&h=400&auto=format&fit=crop",
            "description": "Specialized cardiac, orthopedic, and wellness institute featuring luxury patient suites and comprehensive diagnostic labs.",
            "address": "456 Health Boulevard, Eastside Plaza",
            "city": "Eastside",
            "state": "California",
            "pincode": "50215",
            "phone": "+1 (800) 555-0244",
            "email": "eastside@clinicalserenity.com",
            "website": "https://eastside.clinicalserenity.com",
            "latitude": 37.7833,
            "longitude": -122.4167,
            "rating": 4.8,
            "total_reviews": 94,
            "opening_time": "00:00:00",
            "closing_time": "23:59:59",
            "is_open": True,
            "status": "active"
        },
        {
            "id": HOSPITAL_IDS["metro"],
            "hospital_name": "Serenity Metro Heart & Trauma Institute",
            "hospital_code": "CS-METRO-003",
            "logo_url": "https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=200&h=200&auto=format&fit=crop",
            "banner_url": "https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=1200&h=400&auto=format&fit=crop",
            "description": "Dedicated emergency trauma center, catheterization lab, stroke unit, and intensive cardiac care unit operating 24/7.",
            "address": "789 Metro Expressway, Central Hub",
            "city": "Metro City",
            "state": "California",
            "pincode": "50220",
            "phone": "+1 (800) 555-0377",
            "email": "metro@clinicalserenity.com",
            "website": "https://metro.clinicalserenity.com",
            "latitude": 37.7690,
            "longitude": -122.4480,
            "rating": 4.7,
            "total_reviews": 81,
            "opening_time": "00:00:00",
            "closing_time": "23:59:59",
            "is_open": True,
            "status": "active"
        },
        {
            "id": HOSPITAL_IDS["northland"],
            "hospital_name": "Serenity Care General Hospital",
            "hospital_code": "CS-NORTH-004",
            "logo_url": "https://images.unsplash.com/photo-1538108149393-fbbd81895907?q=80&w=200&h=200&auto=format&fit=crop",
            "banner_url": "https://images.unsplash.com/photo-1538108149393-fbbd81895907?q=80&w=1200&h=400&auto=format&fit=crop",
            "description": "Community-focused multispecialty hospital providing maternity, outpatient consultations, preventive health checks, and pediatric care.",
            "address": "321 Northland Drive, Suburban Wing",
            "city": "Northland",
            "state": "California",
            "pincode": "50230",
            "phone": "+1 (800) 555-0488",
            "email": "northland@clinicalserenity.com",
            "website": "https://northland.clinicalserenity.com",
            "latitude": 37.7910,
            "longitude": -122.4050,
            "rating": 4.6,
            "total_reviews": 65,
            "opening_time": "07:00:00",
            "closing_time": "21:00:00",
            "is_open": True,
            "status": "active"
        }
    ],
    "departments": [
        {"id": "dept-101", "hospital_id": HOSPITAL_IDS["main"], "department_name": "Cardiology", "description": "Comprehensive cardiac diagnostics, interventional cardiology, and heart failure management.", "status": "active"},
        {"id": "dept-102", "hospital_id": HOSPITAL_IDS["main"], "department_name": "Neurology", "description": "Advanced neuro-diagnostics, stroke intervention, and brain surgery.", "status": "active"},
        {"id": "dept-103", "hospital_id": HOSPITAL_IDS["main"], "department_name": "Orthopedics", "description": "Joint replacement, spine surgery, and sports medicine clinic.", "status": "active"},
        {"id": "dept-104", "hospital_id": HOSPITAL_IDS["main"], "department_name": "Pediatrics", "description": "Pediatric sub-specialties, NICU, and adolescent care.", "status": "active"},
        {"id": "dept-105", "hospital_id": HOSPITAL_IDS["main"], "department_name": "General Medicine", "description": "Preventive health, chronic disease care, and diagnostic medicine.", "status": "active"},
        {"id": "dept-201", "hospital_id": HOSPITAL_IDS["eastside"], "department_name": "Cardiology", "description": "Non-invasive cardiology and preventive cardiac screening.", "status": "active"},
        {"id": "dept-202", "hospital_id": HOSPITAL_IDS["eastside"], "department_name": "Gynecology & Obstetrics", "description": "Maternity care, birthing suites, and gynecological oncology.", "status": "active"},
        {"id": "dept-203", "hospital_id": HOSPITAL_IDS["eastside"], "department_name": "Oncology", "description": "Chemotherapy, radiation therapy, and surgical oncology.", "status": "active"},
        {"id": "dept-301", "hospital_id": HOSPITAL_IDS["metro"], "department_name": "Emergency & Trauma", "description": "24/7 emergency resuscitation, trauma surgery, and critical care.", "status": "active"},
        {"id": "dept-302", "hospital_id": HOSPITAL_IDS["metro"], "department_name": "Radiology & Imaging", "description": "3T MRI, 128-slice CT scan, Digital X-ray, and 4D Ultrasound.", "status": "active"}
    ],
    "doctors": [
        {
            "id": "doc-101",
            "hospital_id": HOSPITAL_IDS["main"],
            "department_id": "dept-101",
            "doctor_name": "Dr. Sarah Jenkins",
            "qualification": "MD, FACC - Senior Cardiologist",
            "specialization": "Cardiology",
            "experience": 15,
            "languages": ["English", "Spanish"],
            "consultation_fee": 150.0,
            "profile_image": "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=400&h=400&auto=format&fit=crop",
            "about": "Dr. Sarah Jenkins is a renowned interventional cardiologist with over 15 years of clinical experience in managing coronary artery disease and heart rhythm disorders.",
            "status": "active"
        },
        {
            "id": "doc-102",
            "hospital_id": HOSPITAL_IDS["main"],
            "department_id": "dept-102",
            "doctor_name": "Dr. Michael Chen",
            "qualification": "MD, DM - Chief Neurologist",
            "specialization": "Neurology",
            "experience": 18,
            "languages": ["English", "Mandarin"],
            "consultation_fee": 180.0,
            "profile_image": "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=400&h=400&auto=format&fit=crop",
            "about": "Dr. Michael Chen specializes in movement disorders, epilepsy treatment, and acute neuro-vascular interventions.",
            "status": "active"
        },
        {
            "id": "doc-103",
            "hospital_id": HOSPITAL_IDS["eastside"],
            "department_id": "dept-201",
            "doctor_name": "Dr. Priya Patel",
            "qualification": "MD, DNB - Consultant Pediatrician",
            "specialization": "Pediatrics",
            "experience": 10,
            "languages": ["English", "Hindi"],
            "consultation_fee": 120.0,
            "profile_image": "https://images.unsplash.com/photo-1594824813566-78a050f14652?q=80&w=400&h=400&auto=format&fit=crop",
            "about": "Dr. Priya Patel is passionate about child nutrition, neonatal care, and preventive pediatric health.",
            "status": "active"
        },
        {
            "id": "doc-104",
            "hospital_id": HOSPITAL_IDS["metro"],
            "department_id": "dept-301",
            "doctor_name": "Dr. Robert Taylor",
            "qualification": "MS, MCh - Orthopedic & Trauma Surgeon",
            "specialization": "Orthopedics",
            "experience": 14,
            "languages": ["English"],
            "consultation_fee": 160.0,
            "profile_image": "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=400&h=400&auto=format&fit=crop",
            "about": "Dr. Robert Taylor has extensive expertise in complex trauma management, knee replacements, and arthroscopic procedures.",
            "status": "active"
        }
    ],
    "doctor_availability": [
        {"id": "avail-1", "doctor_id": "doc-101", "day_of_week": "Monday", "start_time": "09:00:00", "end_time": "13:00:00", "max_patients": 20, "status": "active"},
        {"id": "avail-2", "doctor_id": "doc-101", "day_of_week": "Wednesday", "start_time": "14:00:00", "end_time": "18:00:00", "max_patients": 20, "status": "active"},
        {"id": "avail-3", "doctor_id": "doc-102", "day_of_week": "Tuesday", "start_time": "10:00:00", "end_time": "14:00:00", "max_patients": 15, "status": "active"},
        {"id": "avail-4", "doctor_id": "doc-103", "day_of_week": "Thursday", "start_time": "09:30:00", "end_time": "15:30:00", "max_patients": 25, "status": "active"},
        {"id": "avail-5", "doctor_id": "doc-104", "day_of_week": "Friday", "start_time": "08:00:00", "end_time": "12:00:00", "max_patients": 18, "status": "active"}
    ],
    "diagnostic_tests": [
        {
            "id": "test-101",
            "hospital_id": HOSPITAL_IDS["main"],
            "test_name": "Complete Blood Count (CBC) with ESR",
            "category": "Hematology",
            "description": "Measures red blood cells, white blood cells, hemoglobin, platelets, and erythrocyte sedimentation rate.",
            "original_price": 45.0,
            "discount_price": 30.0,
            "report_time": "12 Hours",
            "fasting_required": False,
            "home_collection": True,
            "preparation": "No special preparation required.",
            "status": "active"
        },
        {
            "id": "test-102",
            "hospital_id": HOSPITAL_IDS["main"],
            "test_name": "Advanced Lipid Profile",
            "category": "Biochemistry",
            "description": "Comprehensive cholesterol check including HDL, LDL, VLDL, Triglycerides, and ApoB markers.",
            "original_price": 80.0,
            "discount_price": 55.0,
            "report_time": "24 Hours",
            "fasting_required": True,
            "home_collection": True,
            "preparation": "10-12 hours overnight fasting mandatory.",
            "status": "active"
        },
        {
            "id": "test-103",
            "hospital_id": HOSPITAL_IDS["main"],
            "test_name": "HbA1c & Fasting Blood Sugar",
            "category": "Diabetology",
            "description": "Evaluates average 3-month blood glucose levels and current fasting sugar level.",
            "original_price": 50.0,
            "discount_price": 35.0,
            "report_time": "12 Hours",
            "fasting_required": True,
            "home_collection": True,
            "preparation": "Minimum 8 hours fasting before sample collection.",
            "status": "active"
        },
        {
            "id": "test-201",
            "hospital_id": HOSPITAL_IDS["eastside"],
            "test_name": "Thyroid Profile Total (T3, T4, TSH)",
            "category": "Endocrinology",
            "description": "Assesses thyroid hormone function and screens for hypothyroidism or hyperthyroidism.",
            "original_price": 65.0,
            "discount_price": 45.0,
            "report_time": "24 Hours",
            "fasting_required": False,
            "home_collection": True,
            "preparation": "Early morning sample recommended.",
            "status": "active"
        },
        {
            "id": "test-301",
            "hospital_id": HOSPITAL_IDS["metro"],
            "test_name": "3T MRI Brain Contrast Screening",
            "category": "Radiology",
            "description": "High-definition structural brain imaging for stroke, tumors, aneurysms, and chronic headaches.",
            "original_price": 350.0,
            "discount_price": 280.0,
            "report_time": "24 Hours",
            "fasting_required": False,
            "home_collection": False,
            "preparation": "Remove all metallic ornaments before entering MRI room.",
            "status": "active"
        }
    ],
    "diagnostic_packages": [
        {
            "id": "pkg-101",
            "hospital_id": HOSPITAL_IDS["main"],
            "package_name": "Executive Whole Body Health Checkup",
            "description": "65+ parameters including CBC, Lipid Profile, Liver & Kidney Function, HbA1c, Thyroid, Vitamin D3 & B12, and ECG.",
            "package_image": "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=600&h=400&auto=format&fit=crop",
            "original_price": 299.0,
            "discount_price": 149.0,
            "report_time": "24-36 Hours",
            "home_collection": True,
            "status": "active"
        },
        {
            "id": "pkg-102",
            "hospital_id": HOSPITAL_IDS["main"],
            "package_name": "Comprehensive Cardiac Wellness Package",
            "description": "Includes Lipid Profile, Troponin I, Hs-CRP, HbA1c, 2D Echo screening, and Treadmill Test (TMT).",
            "package_image": "https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?q=80&w=600&h=400&auto=format&fit=crop",
            "original_price": 399.0,
            "discount_price": 229.0,
            "report_time": "24 Hours",
            "home_collection": True,
            "status": "active"
        },
        {
            "id": "pkg-201",
            "hospital_id": HOSPITAL_IDS["eastside"],
            "package_name": "Women's Wellness & Hormonal Profile",
            "description": "Tailored for women's health: Thyroid, Mammography, Pap Smear, Bone Density, Vitamin D3, Iron & Ferritin.",
            "package_image": "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?q=80&w=600&h=400&auto=format&fit=crop",
            "original_price": 320.0,
            "discount_price": 179.0,
            "report_time": "48 Hours",
            "home_collection": True,
            "status": "active"
        }
    ],
    "package_tests": [
        {"id": "pkgtest-1", "package_id": "pkg-101", "test_id": "test-101"},
        {"id": "pkgtest-2", "package_id": "pkg-101", "test_id": "test-102"},
        {"id": "pkgtest-3", "package_id": "pkg-101", "test_id": "test-103"},
        {"id": "pkgtest-4", "package_id": "pkg-102", "test_id": "test-102"},
        {"id": "pkgtest-5", "package_id": "pkg-201", "test_id": "test-201"}
    ],
    "hospital_reviews": [
        {
            "id": "rev-101",
            "hospital_id": HOSPITAL_IDS["main"],
            "user_id": "00000000-0000-0000-0000-000000000001",
            "rating": 5.0,
            "review": "Exceptional care at Clinical Serenity Main Campus. The doctors, nurses, and trauma team responded immediately and provided world-class treatment during emergency care.",
            "created_at": "2026-07-20T10:30:00Z"
        },
        {
            "id": "rev-102",
            "hospital_id": HOSPITAL_IDS["main"],
            "user_id": None,
            "rating": 4.8,
            "review": "Clean facilities, efficient diagnostic laboratory, and smooth appointment booking. High-tech equipment everywhere.",
            "created_at": "2026-07-25T14:15:00Z"
        },
        {
            "id": "rev-201",
            "hospital_id": HOSPITAL_IDS["eastside"],
            "user_id": None,
            "rating": 5.0,
            "review": "Serenity Eastside Specialty Center has top-notch doctors and courteous nursing staff. Highly recommended!",
            "created_at": "2026-07-28T09:00:00Z"
        }
    ],
    "hospital_images": [
        {"id": "img-101", "hospital_id": HOSPITAL_IDS["main"], "image_url": "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=800&h=600&auto=format&fit=crop", "image_type": "exterior", "display_order": 1},
        {"id": "img-102", "hospital_id": HOSPITAL_IDS["main"], "image_url": "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?q=80&w=800&h=600&auto=format&fit=crop", "image_type": "icu", "display_order": 2},
        {"id": "img-103", "hospital_id": HOSPITAL_IDS["main"], "image_url": "https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=800&h=600&auto=format&fit=crop", "image_type": "operating_room", "display_order": 3},
        {"id": "img-201", "hospital_id": HOSPITAL_IDS["eastside"], "image_url": "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?q=80&w=800&h=600&auto=format&fit=crop", "image_type": "exterior", "display_order": 1},
        {"id": "img-202", "hospital_id": HOSPITAL_IDS["eastside"], "image_url": "https://images.unsplash.com/photo-1538108149393-fbbd81895907?q=80&w=800&h=600&auto=format&fit=crop", "image_type": "lounge", "display_order": 2}
    ]
}


def seed_all():
    print("Beginning Hospital Wise Module Data Seeding...")
    if not supabase_client:
        print("Warning: Supabase client is not available. Skipping remote Supabase upsert.")
        return SEED_DATA

    for table_name, records in SEED_DATA.items():
        try:
            print(f"Upserting {len(records)} records into table '{table_name}'...")
            res = supabase_client.table(table_name).upsert(records).execute()
            print(f"✓ Table '{table_name}' seeded successfully.")
        except Exception as e:
            print(f"Note/Error seeding '{table_name}': {e}")

    print("Data seeding completed!")
    return SEED_DATA


if __name__ == "__main__":
    seed_all()
