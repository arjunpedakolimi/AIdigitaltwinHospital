import pandas as pd


def generate_hospital_state(
    patients_df,
    beds_df,
    doctors_df,
    nurses_df,
    equipment_df,
    ambulances_df,
    alerts_df
):

    total_beds = len(beds_df)

    occupied_beds = len(
        patients_df["bed_id"].unique()
    )

    available_beds = total_beds - occupied_beds

    bed_occupancy = round(
        occupied_beds / total_beds * 100,
        2
    )

    total_doctors = len(doctors_df)

    total_nurses = len(nurses_df)

    available_ambulances = len(

        ambulances_df[
            ambulances_df["status"] == "Available"
        ]

    )

    operational_equipment = len(

        equipment_df[
            equipment_df["status"] == "Operational"
        ]

    )

    total_equipment = len(equipment_df)

    active_alerts = len(alerts_df)

    critical_patients = len(

        patients_df[
            patients_df["severity"] == "Critical"
        ]

    )

    state = {

        "timestamp":
        str(pd.Timestamp.now()),

        "hospital": {

            "status":
            "Operational",

            "active_patients":
            len(patients_df),

            "critical_patients":
            critical_patients

        },

        "beds": {

            "total":
            total_beds,

            "occupied":
            occupied_beds,

            "available":
            available_beds,

            "occupancy_percent":
            bed_occupancy

        },

        "staff": {

            "doctors":
            total_doctors,

            "nurses":
            total_nurses

        },

        "equipment": {

            "total":
            total_equipment,

            "operational":
            operational_equipment,

            "maintenance":
            total_equipment - operational_equipment

        },

        "ambulances": {

            "available":
            available_ambulances,

            "busy":
            len(ambulances_df) - available_ambulances

        },

        "alerts": {

            "active":
            active_alerts

        }

    }

    return state