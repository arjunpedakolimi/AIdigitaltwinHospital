import random
import pandas as pd

from scripts.config import LIMITS

EQUIPMENT_BY_DEPARTMENT = {

    "Emergency": [
        "Defibrillator",
        "Patient Monitor",
        "ECG Machine",
        "Infusion Pump"
    ],

    "ICU": [
        "Ventilator",
        "Patient Monitor",
        "Infusion Pump",
        "Syringe Pump",
        "Defibrillator"
    ],

    "Operation Theatre": [
        "Anesthesia Machine",
        "Surgical Light",
        "Patient Monitor",
        "Electrosurgical Unit"
    ],

    "Cardiology": [
        "ECG Machine",
        "Stress Test System",
        "Patient Monitor"
    ],

    "Neurology": [
        "EEG Machine",
        "Patient Monitor"
    ],

    "Orthopedics": [
        "C-Arm",
        "X-Ray Machine",
        "Traction System"
    ],

    "Radiology": [
        "MRI Scanner",
        "CT Scanner",
        "Ultrasound Machine",
        "X-Ray Machine"
    ],

    "Laboratory": [
        "Blood Analyzer",
        "Microscope",
        "Centrifuge"
    ],

    "Pharmacy": [
        "Medicine Refrigerator",
        "Dispensing Cabinet"
    ],

    "General Ward": [
        "Patient Monitor",
        "Infusion Pump"
    ]
}

STATUS = [
    "Operational",
    "Operational",
    "Operational",
    "Maintenance",
    "Offline"
]


def generate_equipment(rooms_df):

    rows = []

    equipment_number = 1

    max_per_room = LIMITS["max_equipment_per_room"]

    for _, room in rooms_df.iterrows():

        department = room["department_name"]

        equipment_list = EQUIPMENT_BY_DEPARTMENT.get(
            department,
            ["Patient Monitor"]
        )

        equipment_count = random.randint(
            1,
            min(
                max_per_room,
                len(equipment_list)
            )
        )

        selected_equipment = random.sample(
            equipment_list,
            equipment_count
        )

        for equipment in selected_equipment:

            status = random.choices(
                STATUS,
                weights=[
                    45,
                    25,
                    15,
                    10,
                    5
                ],
                k=1
            )[0]

            rows.append({

                "equipment_id":
                f"EQP{equipment_number:06d}",

                "equipment_name":
                equipment,

                "department_id":
                room["department_id"],

                "department_name":
                department,

                "room_id":
                room["room_id"],

                "status":
                status,

                "installation_year":
                random.randint(2018, 2025),

                "last_service_days":
                random.randint(1, 180),

                "next_service_due_days":
                random.randint(1, 90),

                "manufacturer":
                random.choice([
                    "GE Healthcare",
                    "Philips",
                    "Siemens",
                    "Mindray",
                    "Dräger",
                    "Medtronic"
                ]),

                "purchase_cost":
                random.randint(
                    50000,
                    5000000
                )

            })

            equipment_number += 1

    return pd.DataFrame(rows)