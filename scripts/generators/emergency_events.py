import random
from datetime import datetime, timedelta

import pandas as pd
from faker import Faker

from scripts.config import COUNTS

fake = Faker()


def generate_emergency_events():

    rows = []

    event_types = [
        "Cardiac Arrest",
        "Road Traffic Accident",
        "Stroke",
        "Fire Accident",
        "Poisoning",
        "Trauma",
        "Burn Injury",
        "Respiratory Failure",
        "Seizure",
        "Mass Casualty"
    ]

    priorities = [
        "Low",
        "Medium",
        "High",
        "Critical"
    ]

    statuses = [
        "Resolved",
        "In Progress",
        "Dispatched"
    ]

    for i in range(COUNTS["emergency_events"]):

        priority = random.choices(
            priorities,
            weights=[15, 35, 30, 20],
            k=1
        )[0]

        response_time = {
            "Critical": random.randint(2, 5),
            "High": random.randint(5, 10),
            "Medium": random.randint(10, 20),
            "Low": random.randint(20, 40)
        }[priority]

        rows.append({

            "event_id": f"EMG{i+1:05d}",

            "event_type": random.choice(event_types),

            "priority": priority,

            "status": random.choice(statuses),

            "reported_time": fake.date_time_between(
                start_date="-365d",
                end_date="now"
            ),

            "response_time_minutes": response_time,

            "ambulance_id": (
                f"AMB{random.randint(1, COUNTS['ambulances']):03d}"
            ),

            "location": fake.address().replace("\n", ", "),

            "casualties": random.randint(1, 8)

        })

    return pd.DataFrame(rows)