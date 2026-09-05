from backend.app.ml.patient_analysis import analyze_patient


result = analyze_patient(
    age=58,
    heart_rate=142,
    systolic_bp=78,
    spo2=84,
    respiratory_rate=34,
    temperature=38.9,
)

print("\n--- PATIENT ANALYSIS ---\n")
print(result)

