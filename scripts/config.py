from pathlib import Path

# =====================================================
# Project Paths
# =====================================================

BASE_DIR = Path(__file__).resolve().parent.parent

DATASET_DIR = BASE_DIR / "datasets" / "synthetic"
DATASET_DIR.mkdir(parents=True, exist_ok=True)

# =====================================================
# Hospital Information
# =====================================================

HOSPITAL = {
    "name": "SmartCare Medical Center",
    "floors": 6,
    "buildings": 1
}

# =====================================================
# Main Dataset Counts
# =====================================================

COUNTS = {

    # Core hospital data
    "patients": 2000,
    "ambulances": 25,
    "emergency_events": 500,

    # Time-series / history
    "patient_vitals": 100000,
    "hospital_kpis": 365,
    "predictions": 365,

    # Optional alert generation
    "alerts": 2000
}

# =====================================================
# Generator Limits
# =====================================================

LIMITS = {

    # Equipment
    "max_equipment_per_room": 8,

    # Clinical
    "max_medications_per_patient": 5,
    "max_lab_tests_per_patient": 5,

    # Surgeries
    "surgery_probability": 0.35,

    # Admissions
    "max_length_of_stay": 20,

    # Patient age
    "min_patient_age": 1,
    "max_patient_age": 95
}

# =====================================================
# Random Seed
# =====================================================
# Set to an integer (e.g., 42) for reproducible datasets.
# Leave as None for new random data on every run.

RANDOM_SEED = None

# =====================================================
# Output Files
# =====================================================

OUTPUT_FILES = {

    "departments": "departments.csv",
    "rooms": "rooms.csv",
    "beds": "beds.csv",
    "doctors": "doctors.csv",
    "nurses": "nurses.csv",
    "patients": "patients.csv",
    "medical_history": "medical_history.csv",
    "lab_results": "lab_results.csv",
    "medications": "medications.csv",
    "surgeries": "surgeries.csv",
    "equipment": "equipment.csv",
    "ambulances": "ambulances.csv",
    "patient_vitals": "patient_vitals.csv",
    "hospital_kpis": "hospital_kpis.csv",
    "alerts": "alerts.csv",
    "predictions": "predictions.csv",
    "billing_insurance": "billing_insurance.csv",
    "emergency_events": "emergency_events.csv",
    "hospital_state": "hospital_state.json",
    "hospital_layout": "hospital_layout.json"
}