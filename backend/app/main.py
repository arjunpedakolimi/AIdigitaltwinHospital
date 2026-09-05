
from fastapi import FastAPI
from pydantic import BaseModel
from backend.app.ml.patient_analysis import analyze_patient
from backend.app.ml.patient_risk import predict_patient_risk
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

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1):\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
class PatientRiskRequest(BaseModel):
    age: float
    heart_rate: float
    systolic_bp: float
    spo2: float
    respiratory_rate: float
    temperature: float
class PatientRiskRequest(BaseModel):
    age: float
    heart_rate: float
    systolic_bp: float
    spo2: float
    respiratory_rate: float
    temperature: float


class PatientAnalysisRequest(BaseModel):
    age: float
    heart_rate: float
    systolic_bp: float
    spo2: float
    respiratory_rate: float
    temperature: float
@app.post("/api/ai/patient-risk")
def patient_risk(request: PatientRiskRequest):
    result = predict_patient_risk(
        age=request.age,
        heart_rate=request.heart_rate,
        systolic_bp=request.systolic_bp,
        spo2=request.spo2,
        respiratory_rate=request.respiratory_rate,
        temperature=request.temperature,
    )

    return {
        "success": True,
        "prediction": result,
    }
@app.post("/api/ai/patient-analysis")
def patient_analysis(request: PatientAnalysisRequest):

    result = analyze_patient(
        age=request.age,
        heart_rate=request.heart_rate,
        systolic_bp=request.systolic_bp,
        spo2=request.spo2,
        respiratory_rate=request.respiratory_rate,
        temperature=request.temperature,
    )

    return {
        "success": True,
        **result,
    }
# ---------------------------------------------------------
# CORS
# ---------------------------------------------------------
# Vite frontend normally runs on localhost:5173.
# 127.0.0.1:5173 is also allowed.


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
