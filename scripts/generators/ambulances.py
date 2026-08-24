import random
import pandas as pd
from faker import Faker

from scripts.config import COUNTS

fake = Faker()


def generate_ambulances():

    rows = []

    statuses = [
        "Available",
        "On Call",
        "En Route",
        "At Hospital",
        "Maintenance"
    ]

    vehicle_types = [
        "Basic Life Support",
        "Advanced Life Support",
        "ICU Ambulance"
    ]

    for i in range(COUNTS["ambulances"]):

        status = random.choices(
            statuses,
            weights=[45, 20, 15, 15, 5],
            k=1
        )[0]

        rows.append({

            "ambulance_id": f"AMB{i+1:03d}",

            "vehicle_number": f"KL-07-AMB-{1000+i}",

            "driver_name": fake.name(),

            "paramedic_name": fake.name(),

            "vehicle_type": random.choice(vehicle_types),

            "status": status,

            "fuel_level": random.randint(20, 100),

            "speed_kmph": (
                random.randint(30, 90)
                if status in ["En Route", "On Call"]
                else 0
            ),

            "current_patient": (
                f"PAT{random.randint(1, COUNTS['patients']):05d}"
                if status in ["En Route", "At Hospital"]
                else None
            ),

            "gps_latitude": round(
                random.uniform(10.95, 11.10),
                6
            ),

            "gps_longitude": round(
                random.uniform(76.85, 77.05),
                6
            ),

            "last_service_date": fake.date_between(
                start_date="-180d",
                end_date="today"
            )

        })

    return pd.DataFrame(rows)