"""
Seed script for Insurance Module - Populates insurance providers, plans, cashless hospital mappings,
sample claims, document metadata, and insurance FAQs.
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

# Deterministic IDs for cross-table references
PROVIDER_IDS = {
    "star": "a1111111-1111-4111-a111-111111111111",
    "care": "a2222222-2222-4222-a222-222222222222",
    "hdfc": "a3333333-3333-4333-a333-333333333333",
    "bupa": "a4444444-4444-4444-a444-444444444444"
}

HOSPITAL_IDS = {
    "main": "11111111-1111-4111-a111-111111111111",
    "eastside": "22222222-2222-4222-a222-222222222222",
    "metro": "33333333-3333-4333-a333-333333333333",
    "northland": "44444444-4444-4444-a444-444444444444"
}

SEED_INSURANCE_DATA = {
    "insurance_providers": [
        {
            "id": PROVIDER_IDS["star"],
            "provider_name": "Star Health Insurance",
            "provider_logo": "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=200&h=200&auto=format&fit=crop",
            "description": "Leading specialist health insurer with over 14,000+ cashless hospital networks across the nation.",
            "support_email": "support@starhealth.in",
            "support_phone": "+1 (800) 425-2255",
            "website": "https://starhealth.in",
            "status": "active"
        },
        {
            "id": PROVIDER_IDS["care"],
            "provider_name": "Care Health Insurance",
            "provider_logo": "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=200&h=200&auto=format&fit=crop",
            "description": "Comprehensive health protection offering high sum insured, annual health checkups, and instant pre-authorization.",
            "support_email": "customerfirst@careinsurance.com",
            "support_phone": "+1 (800) 102-4488",
            "website": "https://careinsurance.com",
            "status": "active"
        },
        {
            "id": PROVIDER_IDS["hdfc"],
            "provider_name": "HDFC ERGO Health Insurance",
            "provider_logo": "https://images.unsplash.com/photo-1556742049-0a670f4a4587?q=80&w=200&h=200&auto=format&fit=crop",
            "description": "Trusted provider with 10,000+ hospital partnerships, 2-hour cashless approval, and zero co-payment options.",
            "support_email": "care@hdfcergo.com",
            "support_phone": "+1 (800) 266-6444",
            "website": "https://hdfcergo.com",
            "status": "active"
        },
        {
            "id": PROVIDER_IDS["bupa"],
            "provider_name": "Niva Bupa Health Insurance",
            "provider_logo": "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?q=80&w=200&h=200&auto=format&fit=crop",
            "description": "Specialized health policies offering global coverage, maternity protection, and senior citizen wellness.",
            "support_email": "customercare@nivabupa.com",
            "support_phone": "+1 (800) 301-03333",
            "website": "https://nivabupa.com",
            "status": "active"
        }
    ],
    "insurance_plans": [
        {
            "id": "plan-101",
            "provider_id": PROVIDER_IDS["star"],
            "plan_name": "Star Comprehensive Health Plan",
            "plan_type": "Family Floater",
            "coverage_amount": 100000.0,
            "description": "No sub-limits on room rent, automatic restoration of basic sum insured, and annual health checkups for family.",
            "eligibility": "Age 18 to 65 years. Dependent children covered up to 25 years.",
            "waiting_period": "30 days initial waiting period; 24 months for pre-existing conditions.",
            "status": "active"
        },
        {
            "id": "plan-102",
            "provider_id": PROVIDER_IDS["star"],
            "plan_name": "Star Senior Citizens Red Carpet Plan",
            "plan_type": "Senior Citizen",
            "coverage_amount": 50000.0,
            "description": "Tailored for senior citizens with no pre-insurance medical test required up to 75 years of age.",
            "eligibility": "Age 60 to 75 years.",
            "waiting_period": "12 months for pre-existing diseases.",
            "status": "active"
        },
        {
            "id": "plan-201",
            "provider_id": PROVIDER_IDS["care"],
            "plan_name": "Care Supreme Unlimited Super Plan",
            "plan_type": "Individual & Family",
            "coverage_amount": 250000.0,
            "description": "Unlimited cumulative bonus, organ donor coverage, day-care procedures, and 500% sum insured restoration.",
            "eligibility": "Any individual above 18 years.",
            "waiting_period": "30 days initial waiting period.",
            "status": "active"
        },
        {
            "id": "plan-301",
            "provider_id": PROVIDER_IDS["hdfc"],
            "plan_name": "HDFC ERGO Optima Secure Plan",
            "plan_type": "Super Top-Up & Comprehensive",
            "coverage_amount": 150000.0,
            "description": "4x coverage benefit: 2x base cover from day 1, 100% renewal bonus, and 100% secure benefit.",
            "eligibility": "Age 18 to 65 years.",
            "waiting_period": "24 months for named ailments.",
            "status": "active"
        }
    ],
    "hospital_insurance": [
        {"id": "hospins-1", "hospital_id": HOSPITAL_IDS["main"], "provider_id": PROVIDER_IDS["star"], "cashless_available": True, "pre_authorization_required": True, "status": "active"},
        {"id": "hospins-2", "hospital_id": HOSPITAL_IDS["main"], "provider_id": PROVIDER_IDS["care"], "cashless_available": True, "pre_authorization_required": True, "status": "active"},
        {"id": "hospins-3", "hospital_id": HOSPITAL_IDS["main"], "provider_id": PROVIDER_IDS["hdfc"], "cashless_available": True, "pre_authorization_required": False, "status": "active"},
        {"id": "hospins-4", "hospital_id": HOSPITAL_IDS["eastside"], "provider_id": PROVIDER_IDS["star"], "cashless_available": True, "pre_authorization_required": True, "status": "active"},
        {"id": "hospins-5", "hospital_id": HOSPITAL_IDS["eastside"], "provider_id": PROVIDER_IDS["bupa"], "cashless_available": True, "pre_authorization_required": True, "status": "active"},
        {"id": "hospins-6", "hospital_id": HOSPITAL_IDS["metro"], "provider_id": PROVIDER_IDS["care"], "cashless_available": True, "pre_authorization_required": True, "status": "active"},
        {"id": "hospins-7", "hospital_id": HOSPITAL_IDS["metro"], "provider_id": PROVIDER_IDS["hdfc"], "cashless_available": True, "pre_authorization_required": True, "status": "active"}
    ],
    "insurance_claims": [
        {
            "id": "claim-1001",
            "user_id": "00000000-0000-0000-0000-000000000001",
            "hospital_id": HOSPITAL_IDS["main"],
            "provider_id": PROVIDER_IDS["star"],
            "plan_id": "plan-101",
            "claim_number": "CLM-2026-8801",
            "claim_amount": 3500.0,
            "approved_amount": 3250.0,
            "claim_status": "approved",
            "remarks": "Claim processed and pre-authorization approved for cardiac diagnostic procedures.",
            "submitted_at": "2026-07-28T09:30:00Z",
            "updated_at": "2026-07-29T14:20:00Z"
        },
        {
            "id": "claim-1002",
            "user_id": "00000000-0000-0000-0000-000000000001",
            "hospital_id": HOSPITAL_IDS["eastside"],
            "provider_id": PROVIDER_IDS["care"],
            "plan_id": "plan-201",
            "claim_number": "CLM-2026-8802",
            "claim_amount": 1800.0,
            "approved_amount": 0.0,
            "claim_status": "under_review",
            "remarks": "Documents submitted. Pending verification of original hospital bill and medical records.",
            "submitted_at": "2026-08-01T11:15:00Z",
            "updated_at": "2026-08-02T10:00:00Z"
        }
    ],
    "insurance_documents": [
        {
            "id": "doc-501",
            "claim_id": "claim-1001",
            "document_name": "Hospital_Discharge_Summary.pdf",
            "document_type": "discharge_summary",
            "document_url": "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
            "uploaded_at": "2026-07-28T09:35:00Z"
        },
        {
            "id": "doc-502",
            "claim_id": "claim-1001",
            "document_name": "Medical_Diagnostic_Bill.pdf",
            "document_type": "hospital_bill",
            "document_url": "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
            "uploaded_at": "2026-07-28T09:36:00Z"
        }
    ]
}

SEED_FAQS = [
    {
        "question": "How does Cashless Insurance work at Clinical Serenity hospitals?",
        "answer": "At any network hospital, present your health insurance e-card and photo ID at the Insurance Helpdesk. Our team submits a pre-authorization request directly to your insurer. Once approved, hospital bills are settled directly with the insurer with zero out-of-pocket payment for covered expenses."
    },
    {
        "question": "What is the pre-authorization approval time for emergency admissions?",
        "answer": "Emergency pre-authorization requests are fast-tracked within 15 to 30 minutes at our 24/7 Trauma Insurance Desk. Planned admissions require pre-authorization requests submitted 48 hours prior to admission."
    },
    {
        "question": "What documents are required to file a reimbursement claim?",
        "answer": "You will need: 1) Duly filled & signed claim form, 2) Original hospital discharge summary, 3) Itemized final hospital bill & payment receipts, 4) Diagnostic lab reports & prescriptions, 5) Patient ID proof & canceled cheque for direct bank transfer."
    },
    {
        "question": "Can I claim insurance if I am admitted to a non-network hospital?",
        "answer": "Yes! If admitted to a non-network facility, you can file a Reimbursement Claim. Pay the hospital bills during discharge and submit original bills, discharge summary, and diagnostic reports via our Online Claim Submission Portal for processing."
    }
]


def seed_insurance_all():
    print("Beginning Insurance Module Data Seeding...")
    if not supabase_client:
        print("Warning: Supabase client is not available. Returning local seed dictionary.")
        return SEED_INSURANCE_DATA

    for table_name, records in SEED_INSURANCE_DATA.items():
        try:
            print(f"Upserting {len(records)} records into table '{table_name}'...")
            supabase_client.table(table_name).upsert(records).execute()
            print(f"✓ Table '{table_name}' seeded successfully.")
        except Exception as e:
            print(f"Note/Error seeding '{table_name}': {e}")

    print("Insurance seeding completed!")
    return SEED_INSURANCE_DATA


if __name__ == "__main__":
    seed_insurance_all()
