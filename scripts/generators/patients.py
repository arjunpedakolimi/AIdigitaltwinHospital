import random
from datetime import datetime, timedelta

import pandas as pd
from faker import Faker

from scripts.config import COUNTS
from scripts.config import LIMITS
from scripts.utils.medical_mappings import DIAGNOSIS_MAPPING

fake = Faker()


PATIENT_STATUS = [
    "Admitted",
    "Observation",
    "Discharged",
    "Critical"
]

SEVERITY_WEIGHTS = {
    "Low": 45,
    "Medium": 35,
    "High": 15,
    "Critical": 5
}


def random_severity():

    return random.choices(

        population=list(SEVERITY_WEIGHTS.keys()),

        weights=list(SEVERITY_WEIGHTS.values()),

        k=1

    )[0]


def generate_patients(

    doctors_df,

    nurses_df,

    beds_df,

    rooms_df,

    departments_df

):

    rows = []

    patient_number = 1

    beds = beds_df.copy()

    beds["occupied"] = False


    total_patients = min(COUNTS["patients"], len(beds))

    diagnosis_list = list(

        DIAGNOSIS_MAPPING.keys()

    )

    for _ in range(total_patients):

        available_beds = beds[
            beds["occupied"] == False
        ]

        if available_beds.empty:
            break

        bed = available_beds.sample(1).iloc[0]

        room = rooms_df[
            rooms_df["room_id"] == bed["room_id"]
        ].iloc[0]

        department_id = room["department_id"]

        department_name = room["department_name"]

        department_doctors = doctors_df[
            doctors_df["department_id"]
            ==
            department_id
        ]

        if department_doctors.empty:

            department_doctors = doctors_df

        doctor = department_doctors.sample(1).iloc[0]

        department_nurses = nurses_df[
            nurses_df["department_id"]
            ==
            department_id
        ]

        if department_nurses.empty:

            department_nurses = nurses_df

        nurse = department_nurses.sample(1).iloc[0]

        diagnosis = random.choice(
            diagnosis_list
        )

        severity = random_severity()

        age = random.randint(
        LIMITS["min_patient_age"],
        LIMITS["max_patient_age"]
        )

        gender = random.choice(
            [
                "Male",
                "Female"
            ]
        )

        admission_date = fake.date_time_between(
            start_date="-60d",
            end_date="now"
        )

        stay = random.randint(
        1,
        LIMITS["max_length_of_stay"]
        )

        discharge_date = None

        status = random.choice(
            PATIENT_STATUS
        )

        if status == "Discharged":

            discharge_date = (
                admission_date
                +
                timedelta(days=stay)
            )
        patient_name = fake.name()

        phone = fake.phone_number()

        email = fake.email()

        address = fake.address().replace("\n", ", ")

        blood_group = random.choice([
            "A+",
            "A-",
            "B+",
            "B-",
            "AB+",
            "AB-",
            "O+",
            "O-"
        ])

        insurance_provider = random.choice([
            "None",
            "Blue Cross",
            "Aetna",
            "United Healthcare",
            "Cigna",
            "Medicare",
            "Medicaid"
        ])

        emergency_contact = fake.name()

        emergency_phone = fake.phone_number()

        rows.append({

            "patient_id":
            f"PAT{patient_number:05d}",

            "name":
            patient_name,

            "gender":
            gender,

            "age":
            age,

            "blood_group":
            blood_group,

            "phone":
            phone,

            "email":
            email,

            "address":
            address,

            "department_id":
            department_id,

            "department_name":
            department_name,

            "doctor_id":
            doctor["doctor_id"],

            "doctor_name":
            doctor["name"],

            "nurse_id":
            nurse["nurse_id"],

            "nurse_name":
            nurse["name"],

            "room_id":
            room["room_id"],

            "bed_id":
            bed["bed_id"],

            "diagnosis":
            diagnosis,

            "severity":
            severity,

            "status":
            status,

            "admission_date":
            admission_date,

            "discharge_date":
            discharge_date,

            "insurance_provider":
            insurance_provider,

            "emergency_contact":
            emergency_contact,

            "emergency_contact_phone":
            emergency_phone

        })

        beds.loc[
            beds["bed_id"] == bed["bed_id"],
            "occupied"
        ] = True

        beds.loc[
            beds["bed_id"] == bed["bed_id"],
            "patient_id"
        ] = f"PAT{patient_number:05d}"

        patient_number += 1

    patients_df = pd.DataFrame(rows)

    # --------------------------------------------------
    # Synchronize room occupancy
    # --------------------------------------------------

    room_occupancy = (
        patients_df.groupby("room_id")
        .size()
        .to_dict()
    )

    rooms_df["occupied"] = rooms_df["room_id"].map(
        room_occupancy
    ).fillna(0).astype(int)

    # --------------------------------------------------
    # Synchronize department occupancy
    # --------------------------------------------------

    department_occupancy = (
        patients_df.groupby("department_id")
        .size()
        .to_dict()
    )

    departments_df["occupied_beds"] = departments_df[
        "department_id"
    ].map(
        department_occupancy
    ).fillna(0).astype(int)

    departments_df["available_beds"] = (
        departments_df["capacity"]
        -
        departments_df["occupied_beds"]
    )

    # --------------------------------------------------
    # Synchronize bed occupancy
    # --------------------------------------------------

    occupied_map = patients_df.set_index(
        "bed_id"
    )["patient_id"].to_dict()

    beds_df["occupied"] = beds_df["bed_id"].isin(
        occupied_map.keys()
    )

    beds_df["patient_id"] = beds_df["bed_id"].map(
        occupied_map
    )

    return patients_df