import random
import pandas as pd
from faker import Faker

from scripts.config import LIMITS
from scripts.utils.medical_mappings import DIAGNOSIS_MAPPING

fake = Faker()


SURGERY_DURATION = {
    "Angioplasty": (1, 2),
    "Bypass Surgery": (4, 6),
    "Heart Valve Repair": (3, 5),
    "Brain Tumor Removal": (4, 8),
    "Hip Replacement": (2, 4),
    "Knee Replacement": (2, 4),
    "Kidney Transplant": (4, 8),
    "Appendectomy": (1, 2),
    "Emergency Trauma Surgery": (2, 6),
    "Tumor Removal": (2, 6)
}


ANESTHESIA_TYPES = [
    "General",
    "Regional",
    "Local"
]


SURGERY_STATUS = [
    "Completed",
    "Scheduled",
    "In Progress",
    "Cancelled"
]


def generate_surgeries(
    patients_df,
    doctors_df,
    rooms_df
):

    rows = []

    surgery_number = 1

    # --------------------------------------------------
    # Find Operation Theatre rooms
    # --------------------------------------------------

    operation_rooms = rooms_df[
        rooms_df["room_type"] == "Operation Theatre"
    ]

    # Fallback in case room_type changes
    if operation_rooms.empty:

        operation_rooms = rooms_df[
            rooms_df["department_name"] == "Operation Theatre"
        ]

    # If there are no operation theatres at all,
    # return an empty but correctly structured DataFrame.
    if operation_rooms.empty:

        return pd.DataFrame(
            columns=[
                "surgery_id",
                "patient_id",
                "doctor_id",
                "department_id",
                "operation_room",
                "surgery_name",
                "duration_hours",
                "anesthesia",
                "status",
                "surgery_date"
            ]
        )

    # --------------------------------------------------
    # Generate Surgeries
    # --------------------------------------------------

    for _, patient in patients_df.iterrows():

        diagnosis = patient["diagnosis"]

        diagnosis_data = DIAGNOSIS_MAPPING.get(
            diagnosis,
            {}
        )

        possible_surgeries = diagnosis_data.get(
            "surgeries",
            []
        )

        # Diagnosis does not require surgery
        if not possible_surgeries:
            continue

        # Configurable probability that an eligible
        # patient actually undergoes surgery
        if random.random() > LIMITS["surgery_probability"]:
            continue

        surgery_name = random.choice(
            possible_surgeries
        )

        duration_range = SURGERY_DURATION.get(
            surgery_name,
            (1, 4)
        )

        duration_hours = round(
            random.uniform(
                duration_range[0],
                duration_range[1]
            ),
            1
        )

        # --------------------------------------------------
        # Select Doctor
        # --------------------------------------------------

        department_doctors = doctors_df[
            doctors_df["department_id"]
            ==
            patient["department_id"]
        ]

        if department_doctors.empty:
            department_doctors = doctors_df

        surgeon = department_doctors.sample(
            n=1
        ).iloc[0]

        # --------------------------------------------------
        # Select Operation Theatre
        # --------------------------------------------------

        theatre = operation_rooms.sample(
            n=1
        ).iloc[0]

        # --------------------------------------------------
        # Determine Surgery Status
        # --------------------------------------------------

        status = random.choices(
            SURGERY_STATUS,
            weights=[
                70,  # Completed
                20,  # Scheduled
                5,   # In Progress
                5    # Cancelled
            ],
            k=1
        )[0]

        # --------------------------------------------------
        # Surgery Date
        # --------------------------------------------------

        if status == "Scheduled":

            surgery_date = fake.date_between(
                start_date="today",
                end_date="+30d"
            )

        else:

            surgery_date = fake.date_between(
                start_date="-180d",
                end_date="today"
            )

        # --------------------------------------------------
        # Add Surgery Record
        # --------------------------------------------------

        rows.append({

            "surgery_id":
            f"SUR{surgery_number:06d}",

            "patient_id":
            patient["patient_id"],

            "doctor_id":
            surgeon["doctor_id"],

            "department_id":
            patient["department_id"],

            "operation_room":
            theatre["room_id"],

            "surgery_name":
            surgery_name,

            "duration_hours":
            duration_hours,

            "anesthesia":
            random.choice(
                ANESTHESIA_TYPES
            ),

            "status":
            status,

            "surgery_date":
            surgery_date

        })

        surgery_number += 1

    return pd.DataFrame(rows)