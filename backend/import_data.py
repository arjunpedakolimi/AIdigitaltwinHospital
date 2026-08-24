from pathlib import Path

import pandas as pd
from dotenv import load_dotenv
from pymongo import MongoClient
import os
import certifi

load_dotenv("backend/.env")

client = MongoClient(
    os.getenv("MONGODB_URI"),
    tlsCAFile=certifi.where()
)

db = client[os.getenv("DATABASE_NAME")]

DATASET_DIR = Path("datasets/synthetic")

CSV_FILES = [
    "departments",
    "rooms",
    "beds",
    "doctors",
    "nurses",
    "patients",
    "medical_history",
    "lab_results",
    "medications",
    "surgeries",
    "equipment",
    "ambulances",
    "patient_vitals",
    "hospital_kpis",
    "alerts",
    "predictions",
    "billing_insurance",
    "emergency_events"
]


def import_collection(name):

    file_path = DATASET_DIR / f"{name}.csv"

    if not file_path.exists():
        print(f"⚠ {name}.csv not found")
        return

    df = pd.read_csv(file_path)

    records = df.to_dict(orient="records")

    collection = db[name]

    collection.delete_many({})

    if records:
        collection.insert_many(records)

    print(f"✅ {name:<20} {len(records):>8} documents")


def main():

    print("=" * 60)
    print("IMPORTING DATASETS TO MONGODB")
    print("=" * 60)

    for collection in CSV_FILES:
        import_collection(collection)

    print("=" * 60)
    print("🎉 Import Completed")
    print("=" * 60)


if __name__ == "__main__":
    main()