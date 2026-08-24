import random
import pandas as pd
from faker import Faker

from scripts.utils.constants import DEPARTMENTS
from scripts.utils.helpers import random_gender, random_shift

fake = Faker()


def generate_nurses(departments_df, rooms_df):

    rows = []

    nurse_number = 1

    for department in DEPARTMENTS:

        department_rooms = rooms_df[
            rooms_df["department_id"] == department["department_id"]
        ]

        for _ in range(department["nurse_count"]):

            room = department_rooms.sample(n=1).iloc[0]

            rows.append({

                "nurse_id": f"NUR{nurse_number:04d}",

                "name": fake.name(),

                "gender": random_gender(),

                "age": random.randint(22, 60),

                "department_id": department["department_id"],

                "department_name": department["name"],

                "room_id": room["room_id"],

                "experience": random.randint(1, 25),

                "shift": random_shift(),

                "available": random.choice([True, False])

            })

            nurse_number += 1

    return pd.DataFrame(rows)