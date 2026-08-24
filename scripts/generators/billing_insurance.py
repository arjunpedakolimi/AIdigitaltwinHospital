import random
import pandas as pd

ROOM_COST = {
    "General Ward": 2500,
    "Emergency": 5000,
    "ICU": 12000,
    "Operation Theatre": 25000,
    "Cardiology": 6000,
    "Neurology": 6500,
    "Orthopedics": 5500,
    "Radiology": 3000,
    "Laboratory": 1000
}

MEDICATION_COST = {
    "Paracetamol": 20,
    "Aspirin": 35,
    "Atorvastatin": 120,
    "Losartan": 90,
    "Metformin": 70,
    "Insulin": 300,
    "Amoxicillin": 80,
    "Azithromycin": 150,
    "Morphine": 450,
    "Ibuprofen": 40,
    "Salbutamol": 180,
    "Heparin": 350
}

LAB_COST = {
    "ECG": 500,
    "Troponin": 1200,
    "Lipid Profile": 700,
    "HbA1c": 900,
    "Blood Glucose": 200,
    "CBC": 350,
    "Chest X-Ray": 800,
    "MRI Brain": 7000,
    "CT Brain": 4500,
    "Blood Pressure": 150,
    "Kidney Function Test": 600,
    "Electrolytes": 500,
    "Creatinine": 350,
    "Urea": 300,
    "Pulmonary Function Test": 900,
    "Biopsy": 5000,
    "X-Ray": 700,
    "CRP": 900,
    "D-Dimer": 1500
}

SURGERY_COST = {
    "Angioplasty": 180000,
    "Bypass Surgery": 350000,
    "Heart Valve Repair": 280000,
    "Brain Tumor Removal": 450000,
    "Hip Replacement": 220000,
    "Knee Replacement": 180000,
    "Kidney Transplant": 900000,
    "Tumor Removal": 300000
}


def generate_billing_insurance(
    patients_df,
    medications_df,
    lab_results_df,
    surgeries_df,
    rooms_df
):

    rows = []

    bill_number = 1

    for _, patient in patients_df.iterrows():

        patient_id = patient["patient_id"]

        room = rooms_df[
            rooms_df["room_id"] == patient["room_id"]
        ].iloc[0]

        room_charge = ROOM_COST.get(
            room["department_name"],
            2500
        )

        stay_days = random.randint(2,10)

        room_total = room_charge * stay_days

        meds = medications_df[
            medications_df["patient_id"] == patient_id
        ]

        medication_total = 0

        for _, med in meds.iterrows():

            medication_total += MEDICATION_COST.get(
                med["medication_name"],
                50
            ) * med["quantity"]

        labs = lab_results_df[
            lab_results_df["patient_id"] == patient_id
        ]

        lab_total = 0

        for _, lab in labs.iterrows():

            lab_total += LAB_COST.get(
                lab["test_name"],
                500
            )

        surgeries = surgeries_df[
            surgeries_df["patient_id"] == patient_id
        ]

        surgery_total = 0

        for _, surgery in surgeries.iterrows():

            surgery_total += SURGERY_COST.get(
                surgery["surgery_name"],
                0
            )

        gross_total = (
            room_total
            + medication_total
            + lab_total
            + surgery_total
        )

        insurance_percent = random.choice(
            [0,50,70,80,90]
        )

        insurance_amount = round(
            gross_total * insurance_percent / 100,
            2
        )

        patient_payable = round(
            gross_total - insurance_amount,
            2
        )

        rows.append({

            "bill_id":
            f"BILL{bill_number:06d}",

            "patient_id":
            patient_id,

            "stay_days":
            stay_days,

            "room_charges":
            room_total,

            "medication_charges":
            medication_total,

            "lab_charges":
            lab_total,

            "surgery_charges":
            surgery_total,

            "gross_amount":
            gross_total,

            "insurance_coverage_percent":
            insurance_percent,

            "insurance_amount":
            insurance_amount,

            "patient_payable":
            patient_payable,

            "payment_status":
            random.choice([
                "Paid",
                "Pending",
                "Partially Paid"
            ])

        })

        bill_number += 1

    return pd.DataFrame(rows)