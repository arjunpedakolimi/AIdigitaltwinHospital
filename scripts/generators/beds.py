import pandas as pd


def generate_beds(rooms_df):

    rows = []

    bed_number = 1

    for _, room in rooms_df.iterrows():

        for _ in range(room["capacity"]):

            rows.append({
                "bed_id": f"BED{bed_number:05d}",
                "room_id": room["room_id"],
                "department_id": room["department_id"],
                "bed_type": room["room_type"],
                "occupied": False,
                "patient_id": None
            })

            bed_number += 1

    return pd.DataFrame(rows)