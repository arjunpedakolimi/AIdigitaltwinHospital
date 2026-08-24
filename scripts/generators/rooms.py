import random
import pandas as pd

from scripts.utils.constants import DEPARTMENTS
from scripts.utils.helpers import (
    random_coordinates,
    random_status
)


def generate_rooms(departments_df):
    rows = []
    room_number = 1

    room_types = {
        "Emergency": "Emergency Room",
        "ICU": "ICU",
        "Operation Theatre": "Operation Theatre",
        "General Ward": "Ward",
        "Cardiology": "Consultation",
        "Neurology": "Consultation",
        "Orthopedics": "Consultation",
        "Radiology": "Imaging",
        "Laboratory": "Lab",
        "Pharmacy": "Pharmacy",
        "Administration": "Office",
        "Reception": "Reception"
    }

    for department in DEPARTMENTS:

        for i in range(department["rooms"]):

            x, y, z = random_coordinates()

            rows.append({
                "room_id": f"ROOM{room_number:04d}",
                "room_name": f'{department["prefix"]}-{i+1:03d}',
                "department_id": department["department_id"],
                "department_name": department["name"],
                "floor": department["floor"],
                "room_type": room_types.get(
                    department["name"],
                    "General"
                ),
                "capacity": department["capacity_per_room"],
                "occupied": random.randint(
                    0,
                    department["capacity_per_room"]
                ),
                "status": random_status(),
                "x_coordinate": x,
                "y_coordinate": y,
                "z_coordinate": z
            })

            room_number += 1

    return pd.DataFrame(rows)