import pandas as pd
from scripts.utils.constants import DEPARTMENTS

def generate_departments():
    rows = []

    for department in DEPARTMENTS:

        total_capacity = (
            department["rooms"] *
            department["capacity_per_room"]
        )

        rows.append({
            "department_id": department["department_id"],
            "department_name": department["name"],
            "floor": department["floor"],
            "room_prefix": department["prefix"],
            "total_rooms": department["rooms"],
            "capacity_per_room": department["capacity_per_room"],
            "capacity": total_capacity,
            "occupied_beds": 0,
            "available_beds": total_capacity,
            "doctor_count": department["doctor_count"],
            "nurse_count": department["nurse_count"],
            "status": "Operational"
        })

    return pd.DataFrame(rows)