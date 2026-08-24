import random
from datetime import datetime, timedelta

import pandas as pd

from scripts.config import COUNTS
from scripts.utils.medical_mappings import DIAGNOSIS_MAPPING


def generate_patient_vitals(patients_df):

    rows = []

    total_rows = COUNTS["patient_vitals"]

    patient_count = len(patients_df)

    now = datetime.now()

    for i in range(total_rows):

        patient = patients_df.iloc[i % patient_count]

        diagnosis = patient["diagnosis"]

        vitals = DIAGNOSIS_MAPPING.get(
            diagnosis,
            {
                "vitals": {
                    "heart_rate": (70, 90),
                    "spo2": (96, 100),
                    "temperature": (36.5, 37.2)
                }
            }
        )["vitals"]

        hr_min, hr_max = vitals["heart_rate"]
        spo2_min, spo2_max = vitals["spo2"]
        temp_min, temp_max = vitals["temperature"]

        systolic = random.randint(100, 140)
        diastolic = random.randint(60, 90)

        rows.append({

            "patient_id": patient["patient_id"],

            "timestamp": now - timedelta(minutes=i * 5),

            "heart_rate": random.randint(
                hr_min,
                hr_max
            ),

            "spo2": random.randint(
                spo2_min,
                spo2_max
            ),

            "temperature": round(
                random.uniform(
                    temp_min,
                    temp_max
                ),
                1
            ),

            "respiration_rate": random.randint(
                12,
                24
            ),

            "blood_pressure": f"{systolic}/{diastolic}"

        })

    return pd.DataFrame(rows)