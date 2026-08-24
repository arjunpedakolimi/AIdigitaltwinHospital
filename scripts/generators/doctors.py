import random
import pandas as pd
from faker import Faker

from scripts.utils.constants import DEPARTMENTS
from scripts.utils.helpers import random_gender, random_shift

fake = Faker()


def generate_doctors(departments_df, rooms_df):

    rows = []

    doctor_number = 1

    for department in DEPARTMENTS:

        department_rooms = rooms_df[
            rooms_df["department_id"] == department["department_id"]
        ]

        for _ in range(department["doctor_count"]):

            room = department_rooms.sample(n=1).iloc[0]

            rows.append({

                "doctor_id": f"DOC{doctor_number:04d}",

                "name": fake.name(),

                "gender": random_gender(),

                "age": random.randint(28, 65),

                "department_id": department["department_id"],

                "department_name": department["name"],

                "room_id": room["room_id"],

                "specialization": random.choice(
                    department["specializations"]
                ) if department["specializations"] else None,

                "experience": random.randint(1, 35),

                "shift": random_shift(),

                "available": random.choice([True, False])

            })

            doctor_number += 1

    return pd.DataFrame(rows)