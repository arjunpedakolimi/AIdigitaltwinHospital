from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.database.mongodb import get_database

# ---------------------------------------------------------
# API ROUTERS
# ---------------------------------------------------------

from backend.app.api.routes.patients import router as patients_router
from backend.app.api.routes.doctors import router as doctors_router
from backend.app.api.routes.nurses import router as nurses_router
from backend.app.api.routes.departments import router as departments_router
from backend.app.api.routes.beds import router as beds_router
from backend.app.api.routes.rooms import router as rooms_router
from backend.app.api.routes.equipment import router as equipment_router
from backend.app.api.routes.ambulances import router as ambulances_router
from backend.app.api.routes.patient_vitals import router as patient_vitals_router
from backend.app.api.routes.predictions import router as predictions_router
from backend.app.api.routes.hospital_kpis import router as hospital_kpis_router
from backend.app.api.routes.alerts import router as alerts_router
from backend.app.api.routes.emergency_events import router as emergency_events_router
from backend.app.api.routes.lab_results import router as lab_results_router
from backend.app.api.routes.medical_history import router as medical_history_router
from backend.app.api.routes.medications import router as medications_router
from backend.app.api.routes.surgeries import router as surgeries_router
from backend.app.api.routes.billing_insurance import router as billing_insurance_router


# ---------------------------------------------------------
# FASTAPI APPLICATION
# ---------------------------------------------------------

app = FastAPI(
    title="Smart Hospital API",
    version="1.0.0",
    description="Backend API for Smart Hospital Digital Twin",
)


# ---------------------------------------------------------
# CORS
# ---------------------------------------------------------
# Vite frontend normally runs on localhost:5173.
# 127.0.0.1:5173 is also allowed.

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------
# REGISTER API ROUTERS
# ---------------------------------------------------------

app.include_router(patients_router)
app.include_router(doctors_router)
app.include_router(nurses_router)
app.include_router(departments_router)
app.include_router(beds_router)
app.include_router(rooms_router)
app.include_router(equipment_router)
app.include_router(ambulances_router)
app.include_router(patient_vitals_router)
app.include_router(predictions_router)
app.include_router(hospital_kpis_router)
app.include_router(alerts_router)
app.include_router(emergency_events_router)
app.include_router(lab_results_router)
app.include_router(medical_history_router)
app.include_router(medications_router)
app.include_router(surgeries_router)
app.include_router(billing_insurance_router)


# ---------------------------------------------------------
# ROOT ENDPOINT
# ---------------------------------------------------------

@app.get("/", tags=["Root"])
async def root():
    return {
        "message": "Smart Hospital Backend Running"
    }


# ---------------------------------------------------------
# HEALTH CHECK
# ---------------------------------------------------------

@app.get("/health", tags=["Health"])
async def health_check():
    db = get_database()

    collections = await db.list_collection_names()

    return {
        "status": "healthy",
        "database": "connected",
        "collections": collections,
    }
