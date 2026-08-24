import pandas as pd
from pathlib import Path

DATASET_DIR = Path("datasets/synthetic")


def load(name):
    return pd.read_csv(DATASET_DIR / f"{name}.csv")


def check_fk(df, column, reference_df, reference_column, name):

    missing = df[
        ~df[column].isin(reference_df[reference_column])
    ]

    if missing.empty:
        print(f"✅ {name}")

    else:
        print(f"❌ {name}")

        print(
            missing[
                [column]
            ].drop_duplicates()
        )


def main():

    print("=" * 70)
    print("SMART HOSPITAL DATASET VALIDATION")
    print("=" * 70)

    departments = load("departments")
    rooms = load("rooms")
    beds = load("beds")
    doctors = load("doctors")
    nurses = load("nurses")
    patients = load("patients")
    medications = load("medications")
    lab_results = load("lab_results")
    equipment = load("equipment")
    billing = load("billing_insurance")
    surgeries = load("surgeries")

    print()

    check_fk(
        patients,
        "department_id",
        departments,
        "department_id",
        "Patients → Departments"
    )

    check_fk(
        patients,
        "doctor_id",
        doctors,
        "doctor_id",
        "Patients → Doctors"
    )

    check_fk(
        patients,
        "nurse_id",
        nurses,
        "nurse_id",
        "Patients → Nurses"
    )

    check_fk(
        patients,
        "room_id",
        rooms,
        "room_id",
        "Patients → Rooms"
    )

    check_fk(
        patients,
        "bed_id",
        beds,
        "bed_id",
        "Patients → Beds"
    )

    check_fk(
        medications,
        "patient_id",
        patients,
        "patient_id",
        "Medications → Patients"
    )

    check_fk(
        lab_results,
        "patient_id",
        patients,
        "patient_id",
        "Labs → Patients"
    )

    check_fk(
        surgeries,
        "patient_id",
        patients,
        "patient_id",
        "Surgeries → Patients"
    )

    check_fk(
        billing,
        "patient_id",
        patients,
        "patient_id",
        "Billing → Patients"
    )

    check_fk(
        equipment,
        "room_id",
        rooms,
        "room_id",
        "Equipment → Rooms"
    )

    print()

    print("=" * 70)

    print("Duplicate ID Check")

    print("=" * 70)

    tables = {

        "patients":
        ("patient_id", patients),

        "doctors":
        ("doctor_id", doctors),

        "nurses":
        ("nurse_id", nurses),

        "beds":
        ("bed_id", beds),

        "rooms":
        ("room_id", rooms),

        "equipment":
        ("equipment_id", equipment)

    }

    for name, (column, df) in tables.items():

        duplicates = df[
            df[column].duplicated()
        ]

        if duplicates.empty:

            print(f"✅ {name}")

        else:

            print(f"❌ {name}")

    print()

    print("=" * 70)
    print("Validation Complete")
    print("=" * 70)


if __name__ == "__main__":
    main()