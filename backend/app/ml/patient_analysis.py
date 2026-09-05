from backend.app.ml.patient_risk import predict_patient_risk
from backend.app.ml.mistral_service import generate_patient_risk_explanation


def analyze_patient(
    age: float,
    heart_rate: float,
    systolic_bp: float,
    spo2: float,
    respiratory_rate: float,
    temperature: float,
):
    # 1. Run the trained ML model
    risk = predict_patient_risk(
        age=age,
        heart_rate=heart_rate,
        systolic_bp=systolic_bp,
        spo2=spo2,
        respiratory_rate=respiratory_rate,
        temperature=temperature,
    )

    # 2. Send the ML result to Mistral for explanation
    explanation = generate_patient_risk_explanation(
        age=age,
        heart_rate=heart_rate,
        systolic_bp=systolic_bp,
        spo2=spo2,
        respiratory_rate=respiratory_rate,
        temperature=temperature,
        risk_level=risk["risk_level"],
        risk_probability=risk["risk_probability"],
    )

    # 3. Return both results
    return {
        "risk": risk,
        "explanation": explanation,
    }
