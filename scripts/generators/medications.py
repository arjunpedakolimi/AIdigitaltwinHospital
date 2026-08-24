import random
import pandas as pd
from faker import Faker

from scripts.config import LIMITS
from scripts.utils.medical_mappings import DIAGNOSIS_MAPPING

fake = Faker()

DOSAGES = [
    "250 mg",
    "500 mg",
    "650 mg",
    "1 g",
    "5 ml",
    "10 ml",
    "20 Units"
]

FREQUENCIES = [
    "Once Daily",
    "Twice Daily",
    "Three Times Daily",
    "Every 6 Hours",
    "Every 8 Hours",
    "Every 12 Hours",
    "SOS"
]

ROUTES = [
    "Oral",
    "IV",
    "IM",
    "Subcutaneous",
    "Inhalation"
]


def generate_medications(patients_df, doctors_df):

    rows = []

    medication_number = 1

    for _, patient in patients_df.iterrows():

        diagnosis = patient["diagnosis"]

        medications = DIAGNOSIS_MAPPING.get(
            diagnosis,
            {
                "medications": ["Paracetamol"]
            }
        )["medications"]

        medication_count = min(
            random.randint(
                1,
                LIMITS["max_medications_per_patient"]
            ),
            len(medications)
        )

        selected = random.sample(
            medications,
            medication_count
        )

        for medicine in selected:

            rows.append({

                "medication_id":
                f"MED{medication_number:06d}",

                "patient_id":
                patient["patient_id"],

                "doctor_id":
                patient["doctor_id"],

                "diagnosis":
                diagnosis,

                "medication_name":
                medicine,

                "dosage":
                random.choice(DOSAGES),

                "frequency":
                random.choice(FREQUENCIES),

                "route":
                random.choice(ROUTES),

                "start_date":
                fake.date_between(
                    start_date="-30d",
                    end_date="today"
                ),

                "end_date":
                fake.date_between(
                    start_date="today",
                    end_date="+30d"
                ),

                "quantity":
                random.randint(5, 60),

                "refills_remaining":
                random.randint(0, 5),

                "pharmacy_status":
                random.choice([
                    "Dispensed",
                    "Pending"
                ]),

                "status":
                random.choice([
                    "Active",
                    "Completed",
                    "Discontinued"
                ])

            })

            medication_number += 1

    return pd.DataFrame(rows)