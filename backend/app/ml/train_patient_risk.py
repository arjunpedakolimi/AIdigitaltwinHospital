from pathlib import Path

import joblib
import numpy as np
from sklearn.ensemble import RandomForestClassifier


# Synthetic training data for prototype demonstration.
# Features:
# age, heart_rate, systolic_bp, spo2, respiratory_rate, temperature

X = np.array([
    [35, 75, 125, 98, 16, 36.7],
    [42, 82, 120, 97, 17, 36.8],
    [50, 90, 118, 96, 18, 37.0],
    [45, 88, 122, 97, 17, 36.9],
    [58, 96, 110, 94, 21, 37.3],

    [60, 105, 100, 91, 24, 37.8],
    [65, 112, 96, 89, 27, 38.2],
    [55, 118, 94, 90, 28, 38.5],
    [70, 120, 92, 88, 29, 38.7],

    [62, 138, 82, 86, 32, 38.7],
    [58, 142, 78, 84, 34, 38.9],
    [67, 135, 80, 85, 33, 39.0],
    [72, 148, 76, 82, 36, 39.1],
])

# 0 = lower deterioration risk
# 1 = higher deterioration risk

y = np.array([
    0, 0, 0, 0, 0,
    0, 0, 1, 1,
    1, 1, 1, 1
])


model = RandomForestClassifier(
    n_estimators=150,
    random_state=42,
    class_weight="balanced"
)

model.fit(X, y)

output = Path(__file__).parent / "patient_risk_model.joblib"

joblib.dump(model, output)

print(f"Model saved to: {output}")
