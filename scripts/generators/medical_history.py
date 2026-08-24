import random
import pandas as pd
from faker import Faker

fake = Faker()


DIAGNOSES = [
    "Hypertension",
    "Diabetes",
    "Pneumonia",
    "COVID-19",
    "Asthma",
    "Heart Disease",
    "Stroke",
    "Kidney Disease",
    "Cancer",
    "Migraine",
    "Fracture",
    "Appendicitis",
    "Infection",
    "Trauma"
]

PROCEDURES = [
    "Blood Test",
    "MRI Scan",
    "CT Scan",
    "ECG",
    "Ultrasound",
    "X-Ray",
    "Surgery",
    "Physiotherapy",
    "Dialysis",
    "Chemotherapy"
]

PRESCRIPTIONS = [
    "Paracetamol",
    "Amoxicillin",
    "Metformin",
    "Atorvastatin",
    "Aspirin",
    "Insulin",
    "Ibuprofen",
    "Losartan",
    "Omeprazole",
    "Azithromycin"
]


def generate_medical_history(patients_df, doctors_df):

    rows = []

    history_number = 1

    for _, patient in patients_df.iterrows():

        visits = random.randint(1, 6)

        patient_doctors = doctors_df[
            doctors_df["doctor_id"] == patient["doctor_id"]
        ]

        if len(patient_doctors) == 0:
            doctor = doctors_df.sample(1).iloc[0]
        else:
            doctor = patient_doctors.iloc[0]

        for _ in range(visits):

            rows.append({

                "history_id": f"HIS{history_number:06d}",

                "patient_id": patient["patient_id"],

                "visit_date": fake.date_between(
                    start_date="-5y",
                    end_date="today"
                ),

                "doctor_id": doctor["doctor_id"],

                "diagnosis": random.choice(DIAGNOSES),

                "procedure": random.choice(PROCEDURES),

                "prescription": random.choice(PRESCRIPTIONS),

                "lab_result": random.choice([
                    "Normal",
                    "Abnormal",
                    "Requires Follow-up"
                ]),

                "discharge_summary": fake.sentence(12)

            })

            history_number += 1

    return pd.DataFrame(rows)