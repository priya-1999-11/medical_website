from fastapi import FastAPI, APIRouter, HTTPException, Query
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, date, time

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# ============= MODELS =============

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


# ============= ROUTES =============

@api_router.get("/")
async def root():
    return {"message": "Clinical Serenity API"}


# Department Routes
@api_router.get("/departments", response_model=List[Department])
async def get_departments():
    """Get all medical departments"""
    departments = await db.departments.find({}, {"_id": 0}).to_list(1000)
    return departments


# Doctor Routes
@api_router.get("/doctors", response_model=List[Doctor])
async def get_doctors(
    department: Optional[str] = Query(None, description="Filter by department"),
    available_today: Optional[bool] = Query(None, description="Filter by availability today"),
    search: Optional[str] = Query(None, description="Search by name or specialty")
):
    """Get all doctors with optional filters"""
    query = {}
    
    if department and department != "All Departments":
        query["department"] = department
    
    if available_today is not None:
        query["available_today"] = available_today
    
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"specialty": {"$regex": search, "$options": "i"}},
            {"title": {"$regex": search, "$options": "i"}}
        ]
    
    doctors = await db.doctors.find(query, {"_id": 0}).to_list(1000)
    return doctors


@api_router.get("/doctors/{doctor_id}", response_model=Doctor)
async def get_doctor(doctor_id: str):
    """Get single doctor by ID"""
    doctor = await db.doctors.find_one({"id": doctor_id}, {"_id": 0})
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    return doctor


@api_router.get("/doctors/{doctor_id}/available-slots")
async def get_available_slots(doctor_id: str, date: str = Query(..., description="Date in YYYY-MM-DD format")):
    """Get available time slots for a doctor on a specific date"""
    doctor = await db.doctors.find_one({"id": doctor_id}, {"_id": 0})
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    
    # Check existing appointments for this doctor on this date
    existing_appointments = await db.appointments.find({
        "doctor_id": doctor_id,
        "appointment_date": date
    }, {"_id": 0}).to_list(1000)
    
    booked_times = {apt["appointment_time"] for apt in existing_appointments}
    
    # Generate time slots based on doctor's schedule
    # For simplicity, generating standard slots
    morning_slots = ["09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM"]
    afternoon_slots = ["02:00 PM", "02:45 PM", "03:30 PM", "04:00 PM", "04:30 PM", "05:30 PM"]
    
    all_slots = morning_slots + afternoon_slots
    
    available_slots = {
        "morning": [{"time": slot, "available": slot not in booked_times} for slot in morning_slots],
        "afternoon": [{"time": slot, "available": slot not in booked_times} for slot in afternoon_slots]
    }
    
    return available_slots


# Appointment Routes
@api_router.post("/appointments", response_model=Appointment)
async def create_appointment(appointment_data: AppointmentCreate):
    """Create a new appointment"""
    # Verify doctor exists
    doctor = await db.doctors.find_one({"id": appointment_data.doctor_id}, {"_id": 0})
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    
    # Check if slot is already booked
    existing = await db.appointments.find_one({
        "doctor_id": appointment_data.doctor_id,
        "appointment_date": appointment_data.appointment_date,
        "appointment_time": appointment_data.appointment_time
    })
    
    if existing:
        raise HTTPException(status_code=400, detail="This time slot is already booked")
    
    # Create appointment
    appointment = Appointment(
        doctor_id=appointment_data.doctor_id,
        doctor_name=doctor["name"],
        department=doctor["department"],
        appointment_date=appointment_data.appointment_date,
        appointment_time=appointment_data.appointment_time,
        patient=appointment_data.patient,
        consultation_fee=120.0,  # Standard fee
        status="confirmed"
    )
    
    # Save to database
    doc = appointment.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.appointments.insert_one(doc)
    return appointment


@api_router.get("/appointments/{appointment_id}", response_model=Appointment)
async def get_appointment(appointment_id: str):
    """Get appointment by ID"""
    appointment = await db.appointments.find_one({"id": appointment_id}, {"_id": 0})
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    # Convert ISO string back to datetime
    if isinstance(appointment.get('created_at'), str):
        appointment['created_at'] = datetime.fromisoformat(appointment['created_at'])
    
    return appointment


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
    client.close()
