from pathlib import Path

import joblib
import numpy as np


MODEL_PATH = Path(__file__).parent / "patient_risk_model.joblib"

model = joblib.load(MODEL_PATH)


def predict_patient_risk(
    age: float,
    heart_rate: float,
    systolic_bp: float,
    spo2: float,
    respiratory_rate: float,
    temperature: float,
):
    features = np.array([[
        age,
        heart_rate,
        systolic_bp,
        spo2,
        respiratory_rate,
        temperature,
    ]])

    probability = float(model.predict_proba(features)[0][1])

    if probability >= 0.70:
        level = "HIGH"
    elif probability >= 0.40:
        level = "MODERATE"
    else:
        level = "LOW"

    return {
        "risk_level": level,
        "risk_probability": round(probability * 100, 1),
    }
