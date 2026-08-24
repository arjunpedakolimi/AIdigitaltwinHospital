import random
import pandas as pd
from faker import Faker

fake = Faker()

SHIFTS = [
    "Morning",
    "Evening",
    "Night"
]

SHIFT_HOURS = {
    "Morning": ("06:00", "14:00"),
    "Evening": ("14:00", "22:00"),
    "Night": ("22:00", "06:00")
}


def generate_staff_schedule(
    doctors_df,
    nurses_df
):

    rows = []

    schedule_number = 1

    staff = []

    for _, doctor in doctors_df.iterrows():

        staff.append({
            "staff_id": doctor["doctor_id"],
            "name": doctor["name"],
            "role": "Doctor",
            "department_id": doctor["department_id"]
        })

    for _, nurse in nurses_df.iterrows():

        staff.append({
            "staff_id": nurse["nurse_id"],
            "name": nurse["name"],
            "role": "Nurse",
            "department_id": nurse["department_id"]
        })

    for member in staff:

        for day in range(30):

            shift = random.choice(SHIFTS)

            start, end = SHIFT_HOURS[shift]

            rows.append({

                "schedule_id":
                f"SCH{schedule_number:06d}",

                "staff_id":
                member["staff_id"],

                "staff_name":
                member["name"],

                "role":
                member["role"],

                "department_id":
                member["department_id"],

                "date":
                fake.date_between(
                    start_date="today",
                    end_date="+30d"
                ),

                "shift":
                shift,

                "start_time":
                start,

                "end_time":
                end,

                "status":
                random.choice([
                    "Scheduled",
                    "Completed",
                    "Leave",
                    "Emergency Call"
                ])

            })

            schedule_number += 1

    return pd.DataFrame(rows)