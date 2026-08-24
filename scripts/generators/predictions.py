import random
from datetime import datetime, timedelta

import pandas as pd

from scripts.config import COUNTS


def generate_predictions(
    patients_df,
    beds_df,
    patient_vitals_df,
    alerts_df,
    ambulances_df
):

    rows = []

    occupied_beds = len(
        patients_df["bed_id"].unique()
    )

    total_beds = len(beds_df)

    occupancy = occupied_beds / total_beds

    latest_vitals = (
        patient_vitals_df
        .sort_values("timestamp")
        .groupby("patient_id")
        .tail(1)
    )

    critical_patients = len(

        latest_vitals[
            (latest_vitals["spo2"] < 90)
            |
            (latest_vitals["heart_rate"] > 130)
        ]

    )

    active_alerts = len(alerts_df)

    available_ambulances = len(

        ambulances_df[
            ambulances_df["status"] == "Available"
        ]

    )

    for day in range(COUNTS["predictions"]):

        predicted_admissions = int(

            len(patients_df)

            *

            random.uniform(0.08, 0.15)

        )

        predicted_discharges = int(

            len(patients_df)

            *

            random.uniform(0.05, 0.10)

        )

        predicted_icu = int(

            critical_patients

            *

            random.uniform(1.0, 1.3)

        )

        if available_ambulances < 5:

            ambulance_demand = "High"

        elif available_ambulances < 10:

            ambulance_demand = "Medium"

        else:

            ambulance_demand = "Low"

        if occupancy > 0.90:

            capacity_risk = "High"

        elif occupancy > 0.75:

            capacity_risk = "Medium"

        else:

            capacity_risk = "Low"

        rows.append({

            "timestamp":
            datetime.now() - timedelta(days=day),

            "current_patients":
            max(
                0,
                len(patients_df) +
                random.randint(-30, 30)
            ),

            "current_bed_occupancy":
            round(
                max(
                    0,
                    min(
                        100,
                        occupancy * 100 +
                        random.uniform(-5, 5)
                    )
                ),
                2
            ),

            "active_alerts":
            max(
                0,
                active_alerts +
                random.randint(-10, 10)
            ),

            "critical_patients":
            max(
                0,
                critical_patients +
                random.randint(-5, 5)
            ),

            "predicted_admissions":
            predicted_admissions,

            "predicted_discharges":
            predicted_discharges,

            "predicted_icu_patients":
            predicted_icu,

            "capacity_risk":
            capacity_risk,

            "ambulance_demand":
            ambulance_demand,

            "available_ambulances":
            available_ambulances,

            "prediction_confidence":
            round(
                random.uniform(
                    0.85,
                    0.99
                ),
                2
            )

        })

    return pd.DataFrame(rows)