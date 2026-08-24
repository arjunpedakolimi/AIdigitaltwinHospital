import random
import pandas as pd

ALLERGIES = [
    "Penicillin",
    "Latex",
    "Peanuts",
    "Shellfish",
    "Milk",
    "Eggs",
    "Soy",
    "Dust",
    "Pollen",
    "Bee Sting",
    "Aspirin",
    "Ibuprofen",
    "Sulfa Drugs",
    "None"
]

SEVERITY = [
    "Mild",
    "Moderate",
    "Severe",
    "Life Threatening"
]

REACTIONS = [
    "Skin Rash",
    "Hives",
    "Swelling",
    "Breathing Difficulty",
    "Anaphylaxis",
    "Vomiting",
    "Itching",
    "Sneezing"
]


def generate_allergies(patients_df):

    rows = []

    allergy_number = 1

    for _, patient in patients_df.iterrows():

        count = random.randint(0, 3)

        if count == 0:

            rows.append({

                "allergy_id": f"ALG{allergy_number:06d}",

                "patient_id": patient["patient_id"],

                "allergen": "None",

                "severity": "None",

                "reaction": "None",

                "notes": "No known allergies"

            })

            allergy_number += 1

            continue

        allergies = random.sample(
            ALLERGIES[:-1],
            min(count, len(ALLERGIES)-1)
        )

        for allergy in allergies:

            rows.append({

                "allergy_id": f"ALG{allergy_number:06d}",

                "patient_id": patient["patient_id"],

                "allergen": allergy,

                "severity": random.choice(SEVERITY),

                "reaction": random.choice(REACTIONS),

                "notes": "Recorded in medical history"

            })

            allergy_number += 1

    return pd.DataFrame(rows)