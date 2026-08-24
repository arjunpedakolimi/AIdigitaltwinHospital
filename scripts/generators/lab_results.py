import random
import pandas as pd
from faker import Faker

from scripts.config import LIMITS
from scripts.utils.medical_mappings import DIAGNOSIS_MAPPING

fake = Faker()

STATUS = [
    "Normal",
    "Abnormal",
    "Critical"
]


def generate_lab_results(
    patients_df,
    doctors_df
):

    rows = []

    lab_number = 1

    for _, patient in patients_df.iterrows():

        diagnosis = patient["diagnosis"]

        doctor_id = patient["doctor_id"]

        tests = DIAGNOSIS_MAPPING.get(
            diagnosis,
            {
                "labs": ["Complete Blood Count"]
            }
        )["labs"]

        test_count = min(
            random.randint(
                1,
                LIMITS["max_lab_tests_per_patient"]
            ),
            len(tests)
        )

        selected_tests = random.sample(
            tests,
            test_count
        )

        for test in selected_tests:

            status = random.choices(
                STATUS,
                weights=[60, 30, 10],
                k=1
            )[0]

            if status == "Normal":
                value = random.uniform(0.9, 1.1)

            elif status == "Abnormal":
                value = random.uniform(1.2, 1.8)

            else:
                value = random.uniform(2.0, 3.5)

            sample_date = fake.date_between(
                start_date="-30d",
                end_date="today"
            )

            reported_date = fake.date_between(
                start_date=sample_date,
                end_date="today"
            )

            rows.append({

                "lab_result_id":
                f"LAB{lab_number:06d}",

                "patient_id":
                patient["patient_id"],

                "doctor_id":
                doctor_id,

                "diagnosis":
                diagnosis,

                "test_name":
                test,

                "result_value":
                round(value, 2),

                "status":
                status,

                "sample_date":
                sample_date,

                "reported_date":
                reported_date,

                "lab_technician":
                fake.name()

            })

            lab_number += 1

    return pd.DataFrame(rows)