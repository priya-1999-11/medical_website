from fastapi import FastAPI, APIRouter, HTTPException, Query, File, UploadFile, Form
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from supabase import create_client, Client
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, date, time
from twilio.rest import Client as TwilioClient
import traceback

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Create the main app without a prefix
app = FastAPI()

# Supabase connection
supabase_url = os.environ.get('SUPABASE_URL') or os.environ.get('REACT_APP_SUPABASE_URL', 'https://rdhoikphrxgyoyqdqzat.supabase.co')
supabase_key = os.environ.get('SUPABASE_KEY') or os.environ.get('REACT_APP_SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkaG9pa3BocnhneW95cWRxemF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0MjExODksImV4cCI6MjA4OTk5NzE4OX0.VaKH0kUoQqg81Tpr_Zxpnaifi8zJndCpaVawRxQMBHU')

try:
    supabase_client: Client = create_client(supabase_url, supabase_key)
except Exception as e:
    print(f"Warning: Could not initialize Supabase client: {e}")
    supabase_client = None

# Test connection on startup
@app.on_event("startup")
async def startup_db_client():
    try:
        if supabase_client:
            res = supabase_client.table("departments").select("id").limit(1).execute()
            print("Connected to Supabase database successfully.")
    except Exception as e:
        print(f"Warning: Could not query Supabase on startup: {e}")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Ensure uploads directory exists
UPLOAD_DIR = ROOT_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")


# ============= MODELS =============

class HospitalCreate(BaseModel):
    hospital_name: str
    hospital_code: str
    logo_url: Optional[str] = None
    banner_url: Optional[str] = None
    description: Optional[str] = None
    address: str
    city: str
    state: Optional[str] = None
    pincode: Optional[str] = None
    phone: str
    email: str
    website: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    opening_time: Optional[str] = "08:00:00"
    closing_time: Optional[str] = "20:00:00"
    is_open: bool = True
    status: str = "active"

class HospitalReviewCreate(BaseModel):
    user_id: Optional[str] = None
    user_name: Optional[str] = "Anonymous Patient"
    rating: float = Field(..., ge=1.0, le=5.0)
    review: str

# Insurance Models
class InsuranceClaimCreate(BaseModel):
    user_id: Optional[str] = "00000000-0000-0000-0000-000000000001"
    patient_name: Optional[str] = None
    hospital_id: str
    provider_id: str
    plan_id: Optional[str] = None
    claim_amount: float
    remarks: Optional[str] = None

class InsuranceProviderCreate(BaseModel):
    provider_name: str
    provider_logo: Optional[str] = None
    description: Optional[str] = None
    support_email: Optional[str] = None
    support_phone: Optional[str] = None
    website: Optional[str] = None
    status: str = "active"

class InsurancePlanCreate(BaseModel):
    provider_id: str
    plan_name: str
    plan_type: str
    coverage_amount: float
    description: Optional[str] = None
    eligibility: Optional[str] = None
    waiting_period: Optional[str] = None
    status: str = "active"

# Diagnostic Packages Models
class PackageBookingCreate(BaseModel):
    user_id: Optional[str] = "00000000-0000-0000-0000-000000000001"
    patient_name: Optional[str] = "Percy Boyina"
    hospital_id: str
    package_id: str
    appointment_date: str
    appointment_time: str
    amount: float

class DiagnosticCategoryCreate(BaseModel):
    category_name: str
    category_image: Optional[str] = None
    description: Optional[str] = None
    status: str = "active"

class DiagnosticPackageCreate(BaseModel):
    category_id: Optional[str] = None
    hospital_id: str
    package_name: str
    package_code: Optional[str] = None
    package_image: Optional[str] = None
    description: Optional[str] = None
    original_price: float
    discount_price: Optional[float] = None
    report_time: Optional[str] = "24 Hours"
    home_collection: bool = True
    recommended_for: Optional[str] = None
    status: str = "active"

# Import Seed Data for fallback database store
try:
    from seed_hospitals import SEED_DATA as HOSPITAL_SEED_DATA
except Exception:
    HOSPITAL_SEED_DATA = {"hospitals": [], "departments": [], "doctors": [], "doctor_availability": [], "diagnostic_tests": [], "diagnostic_packages": [], "package_tests": [], "hospital_reviews": [], "hospital_images": []}

try:
    from seed_insurance import SEED_INSURANCE_DATA, SEED_FAQS
except Exception:
    SEED_INSURANCE_DATA = {"insurance_providers": [], "insurance_plans": [], "hospital_insurance": [], "insurance_claims": [], "insurance_documents": []}
    SEED_FAQS = []

try:
    from seed_diagnostic_packages import SEED_DIAGNOSTIC_DATA
except Exception:
    SEED_DIAGNOSTIC_DATA = {"diagnostic_categories": [], "laboratory_tests": [], "diagnostic_packages": [], "package_tests": [], "sample_collection_slots": [], "package_bookings": []}

# In-Memory DB Store initialized with seed data
LOCAL_DB = {
    "hospitals": list(HOSPITAL_SEED_DATA.get("hospitals", [])),
    "hospital_departments": list(HOSPITAL_SEED_DATA.get("departments", [])),
    "doctors": list(HOSPITAL_SEED_DATA.get("doctors", [])),
    "doctor_availability": list(HOSPITAL_SEED_DATA.get("doctor_availability", [])),
    "diagnostic_tests": list(HOSPITAL_SEED_DATA.get("diagnostic_tests", [])),
    "diagnostic_packages": list(HOSPITAL_SEED_DATA.get("diagnostic_packages", [])) + list(SEED_DIAGNOSTIC_DATA.get("diagnostic_packages", [])),
    "package_tests": list(HOSPITAL_SEED_DATA.get("package_tests", [])) + list(SEED_DIAGNOSTIC_DATA.get("package_tests", [])),
    "hospital_reviews": list(HOSPITAL_SEED_DATA.get("hospital_reviews", [])),
    "hospital_images": list(HOSPITAL_SEED_DATA.get("hospital_images", [])),
    "insurance_providers": list(SEED_INSURANCE_DATA.get("insurance_providers", [])),
    "insurance_plans": list(SEED_INSURANCE_DATA.get("insurance_plans", [])),
    "hospital_insurance": list(SEED_INSURANCE_DATA.get("hospital_insurance", [])),
    "insurance_claims": list(SEED_INSURANCE_DATA.get("insurance_claims", [])),
    "insurance_documents": list(SEED_INSURANCE_DATA.get("insurance_documents", [])),
    "insurance_faqs": list(SEED_FAQS),
    "diagnostic_categories": list(SEED_DIAGNOSTIC_DATA.get("diagnostic_categories", [])),
    "laboratory_tests": list(SEED_DIAGNOSTIC_DATA.get("laboratory_tests", [])),
    "sample_collection_slots": list(SEED_DIAGNOSTIC_DATA.get("sample_collection_slots", [])),
    "package_bookings": list(SEED_DIAGNOSTIC_DATA.get("package_bookings", []))
}

class Department(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    icon: str  # Material icon name

class DepartmentCreate(BaseModel):
    name: str
    description: str
    icon: str


class TimeSlot(BaseModel):
    time: str  # e.g., "09:00 AM"
    available: bool


class Doctor(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    title: str  # e.g., "MD, FACC - Senior Cardiologist"
    specialty: str
    department: str
    experience_years: int
    languages: List[str]
    schedule: str  # e.g., "Mon - Fri: 09:00 - 14:00"
    schedule_details: dict  # e.g., {"days": ["Mon", "Tue", "Wed"], "start": "09:00", "end": "14:00"}
    rating: float
    review_count: int
    available_today: bool
    photo_url: str
    display_sections: List[str] = []
    about: Optional[str] = None

class DoctorCreate(BaseModel):
    name: str
    title: str
    specialty: str
    department: str
    experience_years: int
    languages: List[str]
    schedule: str
    schedule_details: dict
    rating: float
    review_count: int
    available_today: bool
    photo_url: str
    display_sections: List[str] = []
    about: Optional[str] = None


class PatientDetails(BaseModel):
    full_name: str
    age: int
    gender: str
    phone: str
    whatsapp_notification: bool
    sms_notification: bool
    symptoms: str


class Appointment(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    doctor_id: str
    doctor_name: str
    department: str
    appointment_date: str  # e.g., "2024-10-24"
    appointment_time: str  # e.g., "09:30 AM"
    patient: PatientDetails
    consultation_fee: float
    status: str = "confirmed"  # confirmed, cancelled, completed
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AppointmentCreate(BaseModel):
    doctor_id: str
    appointment_date: str
    appointment_time: str
    patient: PatientDetails

class NotificationRequest(BaseModel):
    phone: str
    doctor_name: str
    date: str
    time: str
    send_sms: bool = True
    send_whatsapp: bool = True


# ============= ROUTES =============

@app.get("/")
async def main_root():
    return {
        "message": "Clinical Serenity API is running!",
        "status": "online",
        "endpoints": {
            "api": "/api",
            "departments": "/api/departments",
            "doctors": "/api/doctors",
            "hospitals": "/api/hospitals",
            "docs": "/docs"
        }
    }

@api_router.get("/")
async def root():
    return {"message": "Clinical Serenity API"}

# ============= HOSPITAL WISE ROUTES =============

@api_router.get("/hospitals/filters/options")
async def get_hospital_filter_options():
    """Get available filter options (cities, departments, rating options)"""
    cities = sorted(list({h["city"] for h in LOCAL_DB["hospitals"] if h.get("city")}))
    departments = sorted(list({d["department_name"] for d in LOCAL_DB["hospital_departments"] if d.get("department_name")}))
    return {
        "cities": cities,
        "departments": departments,
        "ratings": [4.5, 4.0, 3.5, 3.0]
    }

@api_router.get("/hospitals")
async def get_hospitals(
    search: Optional[str] = None,
    city: Optional[str] = None,
    department: Optional[str] = None,
    min_rating: Optional[float] = None,
    is_open: Optional[bool] = None,
    status: Optional[str] = "active"
):
    """Get hospitals list with optional filters"""
    # Try fetching from Supabase table first
    hospitals = []
    if supabase_client:
        try:
            query = supabase_client.table("hospitals").select("*")
            if status:
                query = query.eq("status", status)
            if city and city != "All Cities":
                query = query.eq("city", city)
            if is_open is not None:
                query = query.eq("is_open", is_open)
            if min_rating:
                query = query.gte("rating", min_rating)
            res = query.execute()
            if res.data:
                hospitals = res.data
        except Exception as e:
            logger.info(f"Supabase hospitals query fallback to LOCAL_DB: {e}")

    if not hospitals:
        hospitals = [h for h in LOCAL_DB["hospitals"] if h.get("status", "active") == status]
        if city and city != "All Cities":
            hospitals = [h for h in hospitals if h.get("city", "").lower() == city.lower()]
        if is_open is not None:
            hospitals = [h for h in hospitals if h.get("is_open") == is_open]
        if min_rating:
            hospitals = [h for h in hospitals if float(h.get("rating", 0)) >= min_rating]

    # Department filter check
    if department and department != "All Departments":
        matching_hosp_ids = {
            d["hospital_id"] for d in LOCAL_DB["hospital_departments"]
            if department.lower() in d.get("department_name", "").lower()
        }
        hospitals = [h for h in hospitals if h["id"] in matching_hosp_ids]

    # Search query check
    if search:
        s_lower = search.lower()
        hospitals = [
            h for h in hospitals
            if s_lower in h.get("hospital_name", "").lower()
            or s_lower in h.get("city", "").lower()
            or s_lower in h.get("address", "").lower()
            or s_lower in h.get("description", "").lower()
        ]

    return hospitals

@api_router.get("/hospitals/{hospital_id}")
async def get_hospital_details(hospital_id: str):
    """Get complete hospital detail including departments, doctors, tests, packages, reviews, images"""
    hospital = None
    if supabase_client:
        try:
            res = supabase_client.table("hospitals").select("*").eq("id", hospital_id).execute()
            if res.data:
                hospital = res.data[0]
        except Exception:
            pass

    if not hospital:
        matched = [h for h in LOCAL_DB["hospitals"] if h["id"] == hospital_id]
        if not matched:
            raise HTTPException(status_code=404, detail="Hospital not found")
        hospital = matched[0]

    # Related items
    departments = [d for d in LOCAL_DB["hospital_departments"] if d.get("hospital_id") == hospital_id]
    doctors = [doc for doc in LOCAL_DB["doctors"] if doc.get("hospital_id") == hospital_id]
    for doc in doctors:
        doc["availability"] = [a for a in LOCAL_DB["doctor_availability"] if a.get("doctor_id") == doc["id"]]
    
    diagnostic_tests = [t for t in LOCAL_DB["diagnostic_tests"] if t.get("hospital_id") == hospital_id]
    diagnostic_packages = [p for p in LOCAL_DB["diagnostic_packages"] if p.get("hospital_id") == hospital_id]
    for pkg in diagnostic_packages:
        p_test_ids = {pt["test_id"] for pt in LOCAL_DB["package_tests"] if pt.get("package_id") == pkg["id"]}
        pkg["included_tests"] = [t for t in diagnostic_tests if t["id"] in p_test_ids]

    reviews = [r for r in LOCAL_DB["hospital_reviews"] if r.get("hospital_id") == hospital_id]
    images = [img for img in LOCAL_DB["hospital_images"] if img.get("hospital_id") == hospital_id]

    return {
        **hospital,
        "departments": departments,
        "doctors": doctors,
        "diagnostic_tests": diagnostic_tests,
        "diagnostic_packages": diagnostic_packages,
        "reviews": reviews,
        "images": images
    }

@api_router.post("/hospitals/{hospital_id}/reviews")
async def add_hospital_review(hospital_id: str, review_data: HospitalReviewCreate):
    """Add a review to a hospital and recalculate total review score"""
    new_review = {
        "id": f"rev-{uuid.uuid4()}",
        "hospital_id": hospital_id,
        "user_id": review_data.user_id,
        "user_name": review_data.user_name,
        "rating": review_data.rating,
        "review": review_data.review,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    LOCAL_DB["hospital_reviews"].append(new_review)

    # Recalculate rating
    h_reviews = [r for r in LOCAL_DB["hospital_reviews"] if r.get("hospital_id") == hospital_id]
    avg_rating = round(sum(r["rating"] for r in h_reviews) / len(h_reviews), 1) if h_reviews else 5.0

    for h in LOCAL_DB["hospitals"]:
        if h["id"] == hospital_id:
            h["rating"] = avg_rating
            h["total_reviews"] = len(h_reviews)
            break

    if supabase_client:
        try:
            supabase_client.table("hospital_reviews").insert(new_review).execute()
            supabase_client.table("hospitals").update({"rating": avg_rating, "total_reviews": len(h_reviews)}).eq("id", hospital_id).execute()
        except Exception:
            pass

    return {"message": "Review submitted successfully", "review": new_review, "new_rating": avg_rating}

# Admin CRUD operations for Hospitals
@api_router.post("/hospitals")
async def create_hospital(data: HospitalCreate):
    """Create a new hospital (Admin)"""
    new_hosp = {
        "id": str(uuid.uuid4()),
        **data.model_dump(),
        "rating": 5.0,
        "total_reviews": 0,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    LOCAL_DB["hospitals"].append(new_hosp)
    if supabase_client:
        try:
            supabase_client.table("hospitals").insert(new_hosp).execute()
        except Exception:
            pass
    return new_hosp

@api_router.put("/hospitals/{hospital_id}")
async def update_hospital(hospital_id: str, data: HospitalCreate):
    """Update existing hospital (Admin)"""
    for i, h in enumerate(LOCAL_DB["hospitals"]):
        if h["id"] == hospital_id:
            updated = {**h, **data.model_dump(), "updated_at": datetime.now(timezone.utc).isoformat()}
            LOCAL_DB["hospitals"][i] = updated
            if supabase_client:
                try:
                    supabase_client.table("hospitals").update(data.model_dump()).eq("id", hospital_id).execute()
                except Exception:
                    pass
            return updated
    raise HTTPException(status_code=404, detail="Hospital not found")

@api_router.delete("/hospitals/{hospital_id}")
async def delete_hospital(hospital_id: str):
    """Delete hospital (Admin)"""
    LOCAL_DB["hospitals"] = [h for h in LOCAL_DB["hospitals"] if h["id"] != hospital_id]
    if supabase_client:
        try:
            supabase_client.table("hospitals").delete().eq("id", hospital_id).execute()
        except Exception:
            pass
    return {"message": "Hospital deleted successfully"}

# ============= INSURANCE MODULE ROUTES =============

@api_router.get("/insurance/providers")
async def get_insurance_providers(
    search: Optional[str] = None,
    status: Optional[str] = "active"
):
    """List all insurance providers with search filter"""
    providers = []
    if supabase_client:
        try:
            query = supabase_client.table("insurance_providers").select("*")
            if status:
                query = query.eq("status", status)
            res = query.execute()
            if res.data:
                providers = res.data
        except Exception:
            pass

    if not providers:
        providers = [p for p in LOCAL_DB["insurance_providers"] if p.get("status", "active") == status]

    if search:
        s = search.lower()
        providers = [
            p for p in providers
            if s in p.get("provider_name", "").lower()
            or s in p.get("description", "").lower()
        ]

    return providers

@api_router.get("/insurance/plans")
async def get_insurance_plans(
    provider_id: Optional[str] = None,
    plan_type: Optional[str] = None,
    min_coverage: Optional[float] = None
):
    """Get insurance plans with optional provider, plan type, or coverage filter"""
    plans = []
    if supabase_client:
        try:
            query = supabase_client.table("insurance_plans").select("*").eq("status", "active")
            if provider_id:
                query = query.eq("provider_id", provider_id)
            if plan_type and plan_type != "All Types":
                query = query.eq("plan_type", plan_type)
            if min_coverage:
                query = query.gte("coverage_amount", min_coverage)
            res = query.execute()
            if res.data:
                plans = res.data
        except Exception:
            pass

    if not plans:
        plans = [p for p in LOCAL_DB["insurance_plans"] if p.get("status", "active") == "active"]
        if provider_id:
            plans = [p for p in plans if p.get("provider_id") == provider_id]
        if plan_type and plan_type != "All Types":
            plans = [p for p in plans if p.get("plan_type", "").lower() == plan_type.lower()]
        if min_coverage:
            plans = [p for p in plans if float(p.get("coverage_amount", 0)) >= min_coverage]

    # Attach provider info
    provider_map = {p["id"]: p for p in LOCAL_DB["insurance_providers"]}
    for p in plans:
        p["provider"] = provider_map.get(p.get("provider_id"))

    return plans

@api_router.get("/insurance/cashless-hospitals")
async def get_cashless_hospitals(
    provider_id: Optional[str] = None,
    hospital_id: Optional[str] = None
):
    """Get hospitals offering cashless treatment for insurance providers"""
    mappings = LOCAL_DB["hospital_insurance"]
    if provider_id:
        mappings = [m for m in mappings if m.get("provider_id") == provider_id]
    if hospital_id:
        mappings = [m for m in mappings if m.get("hospital_id") == hospital_id]

    hosp_map = {h["id"]: h for h in LOCAL_DB["hospitals"]}
    prov_map = {p["id"]: p for p in LOCAL_DB["insurance_providers"]}

    results = []
    for m in mappings:
        h = hosp_map.get(m.get("hospital_id"))
        p = prov_map.get(m.get("provider_id"))
        if h and p:
            results.append({
                **m,
                "hospital": h,
                "provider": p
            })
    return results

@api_router.post("/insurance/claims")
async def create_insurance_claim(claim_data: InsuranceClaimCreate):
    """Submit a new insurance claim with auto-generated claim number"""
    import random
    claim_num = f"CLM-2026-{random.randint(1000, 9999)}"
    
    new_claim = {
        "id": f"claim-{uuid.uuid4()}",
        "user_id": claim_data.user_id,
        "patient_name": claim_data.patient_name or "Percy Boyina",
        "hospital_id": claim_data.hospital_id,
        "provider_id": claim_data.provider_id,
        "plan_id": claim_data.plan_id,
        "claim_number": claim_num,
        "claim_amount": claim_data.claim_amount,
        "approved_amount": 0.0,
        "claim_status": "submitted",
        "remarks": claim_data.remarks or "Claim submitted successfully. Under initial verification.",
        "submitted_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    LOCAL_DB["insurance_claims"].append(new_claim)

    if supabase_client:
        try:
            supabase_client.table("insurance_claims").insert(new_claim).execute()
        except Exception:
            pass

    return new_claim

@api_router.get("/insurance/claims/user/{user_id}")
async def get_user_claims(user_id: str):
    """Get all claims submitted by a patient/user"""
    claims = [c for c in LOCAL_DB["insurance_claims"] if c.get("user_id") == user_id]
    hosp_map = {h["id"]: h for h in LOCAL_DB["hospitals"]}
    prov_map = {p["id"]: p for p in LOCAL_DB["insurance_providers"]}
    plan_map = {pl["id"]: pl for pl in LOCAL_DB["insurance_plans"]}

    for c in claims:
        c["hospital"] = hosp_map.get(c.get("hospital_id"))
        c["provider"] = prov_map.get(c.get("provider_id"))
        c["plan"] = plan_map.get(c.get("plan_id"))
        c["documents"] = [d for d in LOCAL_DB["insurance_documents"] if d.get("claim_id") == c["id"]]

    return claims

@api_router.get("/insurance/claims/{identifier}")
async def get_claim_status(identifier: str):
    """Track claim status by claim_number or claim_id"""
    matched = [
        c for c in LOCAL_DB["insurance_claims"]
        if c.get("claim_number", "").lower() == identifier.lower() or c.get("id") == identifier
    ]
    if not matched:
        raise HTTPException(status_code=404, detail="Claim not found. Please check your Claim Number.")

    c = matched[0]
    hosp_map = {h["id"]: h for h in LOCAL_DB["hospitals"]}
    prov_map = {p["id"]: p for p in LOCAL_DB["insurance_providers"]}
    plan_map = {pl["id"]: pl for pl in LOCAL_DB["insurance_plans"]}

    c["hospital"] = hosp_map.get(c.get("hospital_id"))
    c["provider"] = prov_map.get(c.get("provider_id"))
    c["plan"] = plan_map.get(c.get("plan_id"))
    c["documents"] = [d for d in LOCAL_DB["insurance_documents"] if d.get("claim_id") == c["id"]]

    # Timeline stage builder
    status_order = ["submitted", "under_review", "approved", "paid"]
    current_status = c.get("claim_status", "submitted").lower()
    
    current_index = status_order.index(current_status) if current_status in status_order else 0
    timeline = [
        {"stage": "Submitted", "completed": current_index >= 0, "date": c.get("submitted_at")},
        {"stage": "Under Review", "completed": current_index >= 1, "date": c.get("updated_at") if current_index >= 1 else None},
        {"stage": "Approved", "completed": current_index >= 2, "date": c.get("updated_at") if current_index >= 2 else None},
        {"stage": "Payment Disbursed", "completed": current_index >= 3, "date": c.get("updated_at") if current_index >= 3 else None}
    ]

    return {
        **c,
        "timeline": timeline
    }

@api_router.post("/insurance/claims/{claim_id}/documents")
async def upload_claim_document(
    claim_id: str,
    document_name: str = Form(...),
    document_type: str = Form(...),
    file: Optional[UploadFile] = File(None),
    document_url: Optional[str] = Form(None)
):
    """Upload or attach a document to an insurance claim"""
    final_url = document_url
    if file:
        file_ext = file.filename.split('.')[-1]
        file_name = f"claim-{claim_id}-{uuid.uuid4()}.{file_ext}"
        file_path = UPLOAD_DIR / file_name
        with open(file_path, "wb") as f:
            f.write(await file.read())
        final_url = f"/uploads/{file_name}"

    if not final_url:
        final_url = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"

    new_doc = {
        "id": f"doc-{uuid.uuid4()}",
        "claim_id": claim_id,
        "document_name": document_name,
        "document_type": document_type,
        "document_url": final_url,
        "uploaded_at": datetime.now(timezone.utc).isoformat()
    }
    LOCAL_DB["insurance_documents"].append(new_doc)

    if supabase_client:
        try:
            supabase_client.table("insurance_documents").insert(new_doc).execute()
        except Exception:
            pass

    return new_doc

@api_router.get("/insurance/faqs")
async def get_insurance_faqs():
    """Get list of FAQs for insurance claims and cashless treatment"""
    return LOCAL_DB.get("insurance_faqs", [])

# ============= DIAGNOSTIC PACKAGES MODULE ROUTES =============

@api_router.get("/diagnostic/categories")
async def get_diagnostic_categories(status: Optional[str] = "active"):
    """Get all diagnostic categories (Full Body, Cardiac, Diabetes, Women's, Senior, etc.)"""
    categories = []
    if supabase_client:
        try:
            res = supabase_client.table("diagnostic_categories").select("*").eq("status", status).execute()
            if res.data:
                categories = res.data
        except Exception:
            pass

    if not categories:
        categories = [c for c in LOCAL_DB["diagnostic_categories"] if c.get("status", "active") == status]

    return categories

@api_router.get("/diagnostic/packages")
async def get_diagnostic_packages(
    search: Optional[str] = None,
    category_id: Optional[str] = None,
    hospital_id: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    status: Optional[str] = "active"
):
    """Get diagnostic health checkup packages with optional filters"""
    packages = []
    if supabase_client:
        try:
            query = supabase_client.table("diagnostic_packages").select("*").eq("status", status)
            if category_id and category_id != "All":
                query = query.eq("category_id", category_id)
            if hospital_id and hospital_id != "All":
                query = query.eq("hospital_id", hospital_id)
            res = query.execute()
            if res.data:
                packages = res.data
        except Exception:
            pass

    if not packages:
        packages = [p for p in LOCAL_DB["diagnostic_packages"] if p.get("status", "active") == status]
        if category_id and category_id != "All":
            packages = [p for p in packages if p.get("category_id") == category_id]
        if hospital_id and hospital_id != "All":
            packages = [p for p in packages if p.get("hospital_id") == hospital_id]
        if min_price:
            packages = [p for p in packages if float(p.get("discount_price") or p.get("original_price", 0)) >= min_price]
        if max_price:
            packages = [p for p in packages if float(p.get("discount_price") or p.get("original_price", 0)) <= max_price]

    if search:
        s = search.lower()
        packages = [
            p for p in packages
            if s in p.get("package_name", "").lower()
            or s in p.get("description", "").lower()
            or s in p.get("recommended_for", "").lower()
        ]

    # Attach category & hospital info, and included tests count
    cat_map = {c["id"]: c for c in LOCAL_DB["diagnostic_categories"]}
    hosp_map = {h["id"]: h for h in LOCAL_DB["hospitals"]}
    test_map = {t["id"]: t for t in LOCAL_DB["diagnostic_tests"] + LOCAL_DB["laboratory_tests"]}

    for p in packages:
        p["category"] = cat_map.get(p.get("category_id"))
        p["hospital"] = hosp_map.get(p.get("hospital_id"))
        p_test_ids = {pt["test_id"] for pt in LOCAL_DB["package_tests"] if pt.get("package_id") == p["id"]}
        p["included_tests"] = [test_map[tid] for tid in p_test_ids if tid in test_map]

    return packages

@api_router.get("/diagnostic/packages/{package_id}")
async def get_diagnostic_package_details(package_id: str):
    """Get single diagnostic package details with included laboratory tests and collection slots"""
    matched = [p for p in LOCAL_DB["diagnostic_packages"] if p["id"] == package_id]
    if not matched:
        raise HTTPException(status_code=404, detail="Diagnostic package not found")

    pkg = dict(matched[0])
    cat_map = {c["id"]: c for c in LOCAL_DB["diagnostic_categories"]}
    hosp_map = {h["id"]: h for h in LOCAL_DB["hospitals"]}
    test_map = {t["id"]: t for t in LOCAL_DB["diagnostic_tests"] + LOCAL_DB["laboratory_tests"]}

    pkg["category"] = cat_map.get(pkg.get("category_id"))
    pkg["hospital"] = hosp_map.get(pkg.get("hospital_id"))

    p_test_ids = {pt["test_id"] for pt in LOCAL_DB["package_tests"] if pt.get("package_id") == package_id}
    pkg["included_tests"] = [test_map[tid] for tid in p_test_ids if tid in test_map]

    slots = [s for s in LOCAL_DB["sample_collection_slots"] if s.get("hospital_id") == pkg.get("hospital_id")]
    pkg["collection_slots"] = slots

    return pkg

@api_router.get("/diagnostic/slots")
async def get_sample_collection_slots(
    hospital_id: Optional[str] = None,
    date: Optional[str] = None
):
    """Get available home sample collection slots for a hospital campus"""
    slots = LOCAL_DB["sample_collection_slots"]
    if hospital_id:
        slots = [s for s in slots if s.get("hospital_id") == hospital_id]
    if date:
        slots = [s for s in slots if s.get("slot_date") == date]
    return slots

@api_router.post("/diagnostic/bookings")
async def create_package_booking(booking_data: PackageBookingCreate):
    """Create a new diagnostic package booking with auto-generated reference code"""
    import random
    ref_code = f"PKG-2026-{random.randint(1000, 9999)}"

    new_booking = {
        "id": f"book-{uuid.uuid4()}",
        "user_id": booking_data.user_id,
        "patient_name": booking_data.patient_name,
        "hospital_id": booking_data.hospital_id,
        "package_id": booking_data.package_id,
        "booking_reference": ref_code,
        "appointment_date": booking_data.appointment_date,
        "appointment_time": booking_data.appointment_time,
        "booking_status": "confirmed",
        "payment_status": "paid",
        "amount": booking_data.amount,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    LOCAL_DB["package_bookings"].append(new_booking)

    if supabase_client:
        try:
            supabase_client.table("package_bookings").insert(new_booking).execute()
        except Exception:
            pass

    return new_booking

@api_router.get("/diagnostic/bookings/user/{user_id}")
async def get_user_package_bookings(user_id: str):
    """Get diagnostic package booking history for a user"""
    bookings = [b for b in LOCAL_DB["package_bookings"] if b.get("user_id") == user_id]
    pkg_map = {p["id"]: p for p in LOCAL_DB["diagnostic_packages"]}
    hosp_map = {h["id"]: h for h in LOCAL_DB["hospitals"]}

    for b in bookings:
        b["package"] = pkg_map.get(b.get("package_id"))
        b["hospital"] = hosp_map.get(b.get("hospital_id"))

    return bookings

@api_router.get("/diagnostic/bookings/{identifier}")
async def get_package_booking_status(identifier: str):
    """Track booking status by booking_reference or booking ID"""
    matched = [
        b for b in LOCAL_DB["package_bookings"]
        if b.get("booking_reference", "").lower() == identifier.lower() or b.get("id") == identifier
    ]
    if not matched:
        raise HTTPException(status_code=404, detail="Booking not found. Please check your Reference Code.")

    b = matched[0]
    pkg_map = {p["id"]: p for p in LOCAL_DB["diagnostic_packages"]}
    hosp_map = {h["id"]: h for h in LOCAL_DB["hospitals"]}

    b["package"] = pkg_map.get(b.get("package_id"))
    b["hospital"] = hosp_map.get(b.get("hospital_id"))

    # Booking status timeline
    timeline = [
        {"stage": "Confirmed", "completed": True, "date": b.get("created_at")},
        {"stage": "Sample Collection Assigned", "completed": True, "date": b.get("appointment_date")},
        {"stage": "Lab Processing", "completed": b.get("booking_status") in ["processing", "completed"], "date": None},
        {"stage": "Report Generated", "completed": b.get("booking_status") == "completed", "date": None}
    ]

    return {
        **b,
        "timeline": timeline
    }





# Department Routes
@api_router.get("/departments", response_model=List[Department])
async def get_departments():
    """Get all medical departments"""
    if not supabase_client:
        return []
    try:
        res = supabase_client.table("departments").select("*").execute()
        return res.data or []
    except Exception as e:
        logger.error(f"Error fetching departments from Supabase: {e}")
        return []


# Doctor Routes
@api_router.get("/doctors", response_model=List[Doctor])
async def get_doctors(
    department: Optional[str] = Query(None, description="Filter by department"),
    available_today: Optional[bool] = Query(None, description="Filter by availability today"),
    search: Optional[str] = Query(None, description="Search by name or specialty")
):
    """Get all doctors with optional filters"""
    if not supabase_client:
        return []
        
    try:
        query = supabase_client.table("doctors").select("*")
        
        if department and department != "All Departments":
            query = query.eq("department", department)
        
        if available_today is not None:
            query = query.eq("available_today", available_today)
        
        res = query.execute()
        doctors = res.data or []

        if search:
            search_lower = search.lower()
            doctors = [
                d for d in doctors
                if search_lower in d.get("name", "").lower()
                or search_lower in d.get("specialty", "").lower()
                or search_lower in d.get("title", "").lower()
            ]

        return doctors
    except Exception as e:
        logger.error(f"Error fetching doctors from Supabase: {e}")
        return []


@api_router.get("/doctors/{doctor_id}", response_model=Doctor)
async def get_doctor(doctor_id: str):
    """Get single doctor by ID"""
    if not supabase_client:
        raise HTTPException(status_code=500, detail="Database client not initialized")
    try:
        res = supabase_client.table("doctors").select("*").eq("id", doctor_id).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Doctor not found")
        return res.data[0]
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching doctor {doctor_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.get("/doctors/{doctor_id}/available-slots")
async def get_available_slots(doctor_id: str, date: str = Query(..., description="Date in YYYY-MM-DD format")):
    """Get available time slots for a doctor on a specific date"""
    morning_slots = ["09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM"]
    afternoon_slots = ["02:00 PM", "02:45 PM", "03:30 PM", "04:00 PM", "04:30 PM", "05:30 PM"]
    
    if not supabase_client:
        return {
            "morning": [{"time": slot, "available": True} for slot in morning_slots],
            "afternoon": [{"time": slot, "available": True} for slot in afternoon_slots]
        }
    try:
        res_doc = supabase_client.table("doctors").select("*").eq("id", doctor_id).execute()
        if not res_doc.data:
            raise HTTPException(status_code=404, detail="Doctor not found")
        
        # Check existing appointments for this doctor on this date
        res_apts = supabase_client.table("appointments").select("*").eq("doctor_id", doctor_id).eq("appointment_date", date).execute()
        existing_appointments = res_apts.data or []
        
        booked_times = {apt.get("appointment_time") for apt in existing_appointments}
        
        return {
            "morning": [{"time": slot, "available": slot not in booked_times} for slot in morning_slots],
            "afternoon": [{"time": slot, "available": slot not in booked_times} for slot in afternoon_slots]
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching slots for doctor {doctor_id}: {e}")
        return {
            "morning": [{"time": slot, "available": True} for slot in morning_slots],
            "afternoon": [{"time": slot, "available": True} for slot in afternoon_slots]
        }


# Appointment Routes
@api_router.post("/appointments", response_model=Appointment)
async def create_appointment(appointment_data: AppointmentCreate):
    """Create a new appointment"""
    if not supabase_client:
        raise HTTPException(status_code=500, detail="Database client not initialized")
    try:
        # Verify doctor exists
        res_doc = supabase_client.table("doctors").select("*").eq("id", appointment_data.doctor_id).execute()
        if not res_doc.data:
            raise HTTPException(status_code=404, detail="Doctor not found")
        doctor = res_doc.data[0]
        
        # Check if slot is already booked
        res_existing = supabase_client.table("appointments").select("*").eq("doctor_id", appointment_data.doctor_id).eq("appointment_date", appointment_data.appointment_date).eq("appointment_time", appointment_data.appointment_time).execute()
        if res_existing.data:
            raise HTTPException(status_code=400, detail="This time slot is already booked")
        
        # Create appointment
        appointment = Appointment(
            doctor_id=appointment_data.doctor_id,
            doctor_name=doctor.get("name", ""),
            department=doctor.get("department", ""),
            appointment_date=appointment_data.appointment_date,
            appointment_time=appointment_data.appointment_time,
            patient=appointment_data.patient,
            consultation_fee=120.0,
            status="confirmed"
        )
        
        # Save to database
        doc = appointment.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        
        supabase_client.table("appointments").insert(doc).execute()
        return appointment
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating appointment: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.post("/send-notification")
async def send_notification(req: NotificationRequest):
    """Send SMS and WhatsApp notifications via Twilio"""
    account_sid = os.environ.get('TWILIO_ACCOUNT_SID')
    auth_token = os.environ.get('TWILIO_AUTH_TOKEN')
    from_sms = os.environ.get('TWILIO_PHONE_NUMBER')
    from_whatsapp = os.environ.get('TWILIO_WHATSAPP_NUMBER', 'whatsapp:+14155238886')

    if not account_sid or not auth_token:
        logger.warning("Twilio credentials missing. Skipping notifications.")
        return {"message": "Notifications skipped (missing credentials)", "status": "skipped"}

    results = {"sms": "not_sent", "whatsapp": "not_sent"}
    
    try:
        twilio_client = TwilioClient(account_sid, auth_token)
        
        # Format phone number for Twilio (ensure it has + prefix)
        to_phone = req.phone if req.phone.startswith('+') else f"+{req.phone}"

        # 1. Send SMS
        if req.send_sms and from_sms:
            try:
                message = twilio_client.messages.create(
                    body=f"Your appointment is confirmed with Dr. {req.doctor_name} on {req.date} at {req.time}. Thank you.",
                    from_=from_sms,
                    to=to_phone
                )
                results["sms"] = "sent"
                logger.info(f"SMS sent: {message.sid}")
            except Exception as e:
                results["sms"] = f"error: {str(e)}"
                logger.error(f"Error sending SMS: {e}")

        # 2. Send WhatsApp
        if req.send_whatsapp and from_whatsapp:
            try:
                wa_body = (
                    f"Appointment Confirmed ✅\n"
                    f"Doctor: {req.doctor_name}\n"
                    f"Date: {req.date}\n"
                    f"Time: {req.time}\n"
                    f"Hospital: Clinical Serenity"
                )
                message = twilio_client.messages.create(
                    body=wa_body,
                    from_=from_whatsapp,
                    to=f"whatsapp:{to_phone}"
                )
                results["whatsapp"] = "sent"
                logger.info(f"WhatsApp sent: {message.sid}")
            except Exception as e:
                results["whatsapp"] = f"error: {str(e)}"
                logger.error(f"Error sending WhatsApp: {e}")

        return {"message": "Notification process completed", "results": results}
    except Exception as e:
        logger.error(f"Twilio Client Error: {e}")
        return {"message": "Notification failed", "error": str(e)}, 500
@api_router.post("/doctors")
async def create_doctor_form(
    full_name: str = Form(...),
    title: str = Form(...),
    speciality: str = Form(...),
    department: str = Form(...),
    experience: int = Form(...),
    schedule: str = Form(...),
    available: bool = Form(...),
    display_sections: List[str] = Form([]),
    image: Optional[UploadFile] = File(None),
    photo_url: Optional[str] = Form(None)
):
    """Create a new doctor using Form Data"""
    # Handle image upload
    final_photo_url = photo_url
    if image:
        file_ext = image.filename.split('.')[-1]
        file_name = f"{uuid.uuid4()}.{file_ext}"
        file_path = UPLOAD_DIR / file_name
        with open(file_path, "wb") as f:
            f.write(await image.read())
        final_photo_url = f"/uploads/{file_name}"

    doctor_id = str(uuid.uuid4())
    doctor_doc = {
        "id": doctor_id,
        "name": full_name,
        "title": title,
        "specialty": speciality,
        "department": department,
        "experience_years": experience,
        "languages": ["English", "Hindi"], # Default
        "schedule": schedule,
        "schedule_details": {"days": [], "start": "", "end": ""}, # Standard empty
        "rating": 5.0,
        "review_count": 0,
        "available_today": available,
        "photo_url": final_photo_url,
        "display_sections": display_sections,
    }
    
    if supabase_client:
        supabase_client.table("doctors").insert(doctor_doc).execute()
    return {"message": "Doctor created successfully", "id": doctor_id}

@api_router.put("/doctors/{doctor_id}")
async def update_doctor_form(
    doctor_id: str,
    full_name: str = Form(...),
    title: str = Form(...),
    speciality: str = Form(...),
    department: str = Form(...),
    experience: int = Form(...),
    schedule: str = Form(...),
    available: bool = Form(...),
    display_sections: List[str] = Form([]),
    image: Optional[UploadFile] = File(None),
    photo_url: Optional[str] = Form(None)
):
    """Update doctor using Form Data"""
    # Handle image upload
    final_photo_url = photo_url
    if image:
        file_ext = image.filename.split('.')[-1]
        file_name = f"{uuid.uuid4()}.{file_ext}"
        file_path = UPLOAD_DIR / file_name
        with open(file_path, "wb") as f:
            f.write(await image.read())
        final_photo_url = f"/uploads/{file_name}"

    update_doc = {
        "name": full_name,
        "title": title,
        "specialty": speciality,
        "department": department,
        "experience_years": experience,
        "schedule": schedule,
        "available_today": available,
        "display_sections": display_sections,
    }
    if final_photo_url:
        update_doc["photo_url"] = final_photo_url

    if not supabase_client:
        raise HTTPException(status_code=500, detail="Database client not initialized")
        
    res = supabase_client.table("doctors").update(update_doc).eq("id", doctor_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Doctor not found")
        
    return {"message": "Doctor updated successfully"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    pass

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="127.0.0.1", port=8000, reload=True)
