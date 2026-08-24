import random
import pandas as pd
from faker import Faker
P
fake = Faker()

APPOINTMENT_TYPES = [
    "General Consultation",
    "Follow-up",
    "Emergency",
    "Lab Test",
    "Radiology",
    "Vaccination",
    "Health Checkup",
    "Specialist Consultation"
]

STATUS = [
    "Scheduled",
    "Completed",
    "Cancelled",
    "No Show"
]

PRIORITY = [
    "Low",
    "Medium",
    "High",
    "Critical"
]


def generate_appointments(
    patients_df,
    doctors_df
):

    rows = []

    appointment_number = 1

    for _, patient in patients_df.iterrows():

        appointments = random.randint(1, 4)

        for _ in range(appointments):

            rows.append({

                "appointment_id":
                f"APT{appointment_number:06d}",

                "patient_id":
                patient["patient_id"],

                "doctor_id":
                patient["doctor_id"],

                "department_id":
                patient["department_id"],

                "appointment_date":
                fake.date_between(
                    start_date="-90d",
                    end_date="+90d"
                ),

                "appointment_time":
                fake.time(),

                "appointment_type":
                random.choice(APPOINTMENT_TYPES),

                "priority":
                random.choice(PRIORITY),

                "status":
                random.choice(STATUS),

                "notes":
                fake.sentence()

            })

            appointment_number += 1

    return pd.DataFrame(rows)