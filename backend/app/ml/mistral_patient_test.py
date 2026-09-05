from mistral_service import generate_patient_risk_explanation


result = generate_patient_risk_explanation(
    age=58,
    heart_rate=142,
    systolic_bp=78,
    spo2=84,
    respiratory_rate=34,
    temperature=38.9,
    risk_level="HIGH",
    risk_probability=99.3,
)

print("\n--- MISTRAL PATIENT RISK EXPLANATION ---\n")
print(result)
