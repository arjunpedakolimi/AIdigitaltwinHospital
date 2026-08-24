import random
import pandas as pd


def generate_alerts(
    patients_df,
    patient_vitals_df,
    equipment_df,
    ambulances_df,
    beds_df,
    departments_df
):

    rows = []

    alert_number = 1

    timestamp = pd.Timestamp.now()

    # -------------------------------------------------------
    # Critical Patient Alerts
    # -------------------------------------------------------

    latest_vitals = (
        patient_vitals_df
        .sort_values("timestamp")
        .groupby("patient_id")
        .tail(1)
    )

    for _, vital in latest_vitals.iterrows():

        if vital["spo2"] < 90:

            rows.append({

                "alert_id": f"ALT{alert_number:05d}",

                "timestamp": timestamp,

                "severity": "Critical",

                "category": "Patient",

                "department_id": None,

                "patient_id": vital["patient_id"],

                "message":
                f"Patient {vital['patient_id']} has critically low SpO₂ ({vital['spo2']}%)."

            })

            alert_number += 1

        if vital["heart_rate"] > 130:

            rows.append({

                "alert_id": f"ALT{alert_number:05d}",

                "timestamp": timestamp,

                "severity": "High",

                "category": "Patient",

                "department_id": None,

                "patient_id": vital["patient_id"],

                "message":
                f"Patient {vital['patient_id']} has elevated heart rate ({vital['heart_rate']} bpm)."

            })

            alert_number += 1

    # -------------------------------------------------------
    # Equipment Alerts
    # -------------------------------------------------------

    failed = equipment_df[
        equipment_df["status"] != "Operational"
    ]

    for _, equipment in failed.iterrows():

        rows.append({

            "alert_id": f"ALT{alert_number:05d}",

            "timestamp": timestamp,

            "severity": "Medium",

            "category": "Equipment",

            "department_id":
            equipment["department_id"],

            "patient_id": None,

            "message":
            f"{equipment['equipment_name']} is {equipment['status']}."

        })

        alert_number += 1

    # -------------------------------------------------------
    # Ambulance Alerts
    # -------------------------------------------------------

    available = len(

        ambulances_df[
            ambulances_df["status"] == "Available"
        ]

    )

    if available < 3:

        rows.append({

            "alert_id": f"ALT{alert_number:05d}",

            "timestamp": timestamp,

            "severity": "High",

            "category": "Ambulance",

            "department_id": None,

            "patient_id": None,

            "message":
            "Low ambulance availability."

        })

        alert_number += 1

    # -------------------------------------------------------
    # Bed Occupancy
    # -------------------------------------------------------

    occupied = len(
        patients_df["bed_id"].unique()
    )

    occupancy = occupied / len(beds_df)

    if occupancy > 0.90:

        rows.append({

            "alert_id": f"ALT{alert_number:05d}",

            "timestamp": timestamp,

            "severity": "High",

            "category": "Capacity",

            "department_id": None,

            "patient_id": None,

            "message":
            f"Hospital bed occupancy is {occupancy*100:.1f}%."

        })

        alert_number += 1

    # -------------------------------------------------------
    # Department Capacity
    # -------------------------------------------------------

    for _, dep in departments_df.iterrows():

        patient_count = len(

            patients_df[
                patients_df["department_id"]
                ==
                dep["department_id"]
            ]

        )

        if patient_count > dep["capacity"] * 0.90:

            rows.append({

                "alert_id": f"ALT{alert_number:05d}",

                "timestamp": timestamp,

                "severity": "Medium",

                "category": "Department",

                "department_id":
                dep["department_id"],

                "patient_id": None,

                "message":
                f"{dep['department_name']} is above 90% capacity."

            })

            alert_number += 1

    return pd.DataFrame(rows)