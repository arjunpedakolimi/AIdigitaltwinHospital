import json

from scripts.config import DATASET_DIR

from scripts.generators.departments import generate_departments
from scripts.generators.rooms import generate_rooms
from scripts.generators.beds import generate_beds
from scripts.generators.doctors import generate_doctors
from scripts.generators.nurses import generate_nurses
from scripts.generators.patients import generate_patients
from scripts.generators.medical_history import generate_medical_history
from scripts.generators.lab_results import generate_lab_results
from scripts.generators.medications import generate_medications
from scripts.generators.equipment import generate_equipment
from scripts.generators.ambulances import generate_ambulances
from scripts.generators.patient_vitals import generate_patient_vitals
from scripts.generators.hospital_kpis import generate_hospital_kpis
from scripts.generators.alerts import generate_alerts
from scripts.generators.predictions import generate_predictions
from scripts.generators.emergency_events import generate_emergency_events
from scripts.generators.hospital_state import generate_hospital_state
from scripts.generators.hospital_layout import generate_hospital_layout
from scripts.generators.billing_insurance import generate_billing_insurance
from scripts.generators.surgeries import generate_surgeries

from scripts.utils.logger import log
from scripts.utils.timer import Timer


def main():

    log("Starting Smart Hospital Dataset Generation...")

    # --------------------------------------------------
    # Core Hospital Data
    # --------------------------------------------------

    departments = generate_departments()

    rooms = generate_rooms(
        departments
    )

    beds = generate_beds(
        rooms
    )

    doctors = generate_doctors(
        departments,
        rooms
    )

    nurses = generate_nurses(
        departments,
        rooms
    )

    # --------------------------------------------------
    # Patients
    # --------------------------------------------------

    with Timer():

        patients = generate_patients(
            doctors,
            nurses,
            beds,
            rooms,
            departments
        )

    # --------------------------------------------------
    # Clinical Data
    # --------------------------------------------------

    medical_history = generate_medical_history(
        patients,
        doctors
    )

    lab_results = generate_lab_results(
        patients,
        doctors
    )

    medications = generate_medications(
        patients,
        doctors
    )

    surgeries = generate_surgeries(
        patients,
        doctors,
        rooms
    )

    patient_vitals = generate_patient_vitals(
        patients
    )

    # --------------------------------------------------
    # Hospital Resources
    # --------------------------------------------------

    equipment = generate_equipment(
        rooms
    )

    ambulances = generate_ambulances()

    # --------------------------------------------------
    # Operations
    # --------------------------------------------------

    emergency_events = generate_emergency_events()

    # --------------------------------------------------
    # Analytics
    # --------------------------------------------------

    hospital_kpis = generate_hospital_kpis(
        patients,
        beds,
        doctors,
        nurses,
        equipment,
        departments
    )

    alerts = generate_alerts(
        patients,
        patient_vitals,
        equipment,
        ambulances,
        beds,
        departments
    )

    predictions = generate_predictions(
        patients,
        beds,
        patient_vitals,
        alerts,
        ambulances
    )

    # --------------------------------------------------
    # Billing
    # --------------------------------------------------

    billing_insurance = generate_billing_insurance(
        patients,
        medications,
        lab_results,
        surgeries,
        rooms
    )

    # --------------------------------------------------
    # JSON Outputs
    # --------------------------------------------------

    hospital_state = generate_hospital_state(
        patients,
        beds,
        doctors,
        nurses,
        equipment,
        ambulances,
        alerts
    )

    hospital_layout = generate_hospital_layout(
        rooms
    )

    # --------------------------------------------------
    # Save CSVs
    # --------------------------------------------------

    datasets = {

    "departments": departments,

    "rooms": rooms,

    "beds": beds,

    "doctors": doctors,

    "nurses": nurses,

    "patients": patients,

    "medical_history": medical_history,

    "lab_results": lab_results,

    "medications": medications,

    "surgeries": surgeries,

    "equipment": equipment,

    "ambulances": ambulances,

    "patient_vitals": patient_vitals,

    "hospital_kpis": hospital_kpis,

    "alerts": alerts,

    "predictions": predictions,

    "billing_insurance": billing_insurance,

    "emergency_events": emergency_events

}

    log("Saving datasets...")

    for name, dataframe in datasets.items():

        dataframe.to_csv(
            DATASET_DIR / f"{name}.csv",
            index=False
        )

        log(
            f"Saved {name}.csv ({len(dataframe):,} rows)"
        )

    # --------------------------------------------------
    # Save JSON Files
    # --------------------------------------------------

    with open(
        DATASET_DIR / "hospital_state.json",
        "w"
    ) as f:

        json.dump(
            hospital_state,
            f,
            indent=4
        )

    with open(
        DATASET_DIR / "hospital_layout.json",
        "w"
    ) as f:

        json.dump(
            hospital_layout,
            f,
            indent=4
        )

    # --------------------------------------------------
    # Summary
    # --------------------------------------------------

    print("\n")
    print("=" * 70)
    print("SMART HOSPITAL DATASET SUMMARY")
    print("=" * 70)

    for name, dataframe in datasets.items():

        print(
            f"{name:<25}{len(dataframe):>12,}"
        )

    print("=" * 70)
    print(f"Output Folder : {DATASET_DIR.resolve()}")
    print("=" * 70)

    log("Dataset generation completed successfully.")


if __name__ == "__main__":
    main()