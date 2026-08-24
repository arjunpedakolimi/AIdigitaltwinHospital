import random
from datetime import datetime, timedelta

import pandas as pd

from scripts.config import COUNTS


def generate_hospital_kpis(
    patients_df,
    beds_df,
    doctors_df,
    nurses_df,
    equipment_df,
    departments_df
):

    rows = []

    total_beds = len(beds_df)
    total_doctors = len(doctors_df)
    total_nurses = len(nurses_df)
    total_equipment = len(equipment_df)

    occupied_beds = len(
        patients_df["bed_id"].unique()
    )

    available_beds = total_beds - occupied_beds

    active_equipment = len(
        equipment_df[
            equipment_df["status"] == "Operational"
        ]
    )

    department_stats = []

    for _, department in departments_df.iterrows():

        patient_count = len(

            patients_df[
                patients_df["department_id"]
                ==
                department["department_id"]
            ]

        )

        department_stats.append({

            "department_name":
            department["department_name"],

            "patients":
            patient_count

        })

    busiest = max(
        department_stats,
        key=lambda x: x["patients"]
    )["department_name"]

    least_busy = min(
        department_stats,
        key=lambda x: x["patients"]
    )["department_name"]

    for day in range(COUNTS["hospital_kpis"]):

        occupied = max(
            0,
            min(
                total_beds,
                occupied_beds + random.randint(-20, 20)
            )
        )

        available = total_beds - occupied

        bed_utilization = round(
            occupied / total_beds * 100,
            2
        )

        doctor_utilization = round(
            occupied / total_doctors,
            2
        )

        nurse_utilization = round(
            occupied / total_nurses,
            2
        )

        equipment_utilization = round(
            active_equipment /
            total_equipment *
            100,
            2
        )

        rows.append({

            "timestamp":
            datetime.now() -
            timedelta(days=day),

            "total_patients":
            occupied,

            "total_doctors":
            total_doctors,

            "total_nurses":
            total_nurses,

            "total_beds":
            total_beds,

            "occupied_beds":
            occupied,

            "available_beds":
            available,

            "bed_occupancy_percent":
            bed_utilization,

            "doctor_utilization":
            doctor_utilization,

            "nurse_utilization":
            nurse_utilization,

            "equipment_utilization_percent":
            equipment_utilization,

            "active_equipment":
            active_equipment,

            "total_equipment":
            total_equipment,

            "busiest_department":
            busiest,

            "least_busy_department":
            least_busy,

            "average_wait_time_minutes":
            random.randint(5, 45),

            "average_length_of_stay_days":
            round(
                random.uniform(2, 7),
                1
            ),

            "emergency_cases_today":
            random.randint(15, 80),

            "surgeries_today":
            random.randint(5, 30)

        })

    return pd.DataFrame(rows)