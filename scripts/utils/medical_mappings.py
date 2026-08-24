DIAGNOSIS_MAPPING = {

    "Hypertension": {

        "medications": [
            "Losartan",
            "Amlodipine",
            "Hydrochlorothiazide"
        ],

        "labs": [
            "Blood Pressure",
            "Kidney Function Test",
            "Electrolytes"
        ],

        "surgeries": [],

        "vitals": {
            "heart_rate": (70, 100),
            "spo2": (95, 100),
            "temperature": (36.5, 37.3)
        }
    },

    "Heart Disease": {

        "medications": [
            "Aspirin",
            "Atorvastatin",
            "Heparin",
            "Losartan"
        ],

        "labs": [
            "ECG",
            "Troponin",
            "Lipid Profile"
        ],

        "surgeries": [
            "Angioplasty",
            "Bypass Surgery",
            "Heart Valve Repair"
        ],

        "vitals": {
            "heart_rate": (90, 140),
            "spo2": (90, 97),
            "temperature": (36.5, 37.5)
        }
    },

    "Stroke": {

        "medications": [
            "Aspirin",
            "Heparin"
        ],

        "labs": [
            "CT Brain",
            "MRI Brain",
            "Blood Glucose"
        ],

        "surgeries": [
            "Brain Tumor Removal"
        ],

        "vitals": {
            "heart_rate": (90, 130),
            "spo2": (88, 95),
            "temperature": (36.8, 38.0)
        }
    },

    "Diabetes": {

        "medications": [
            "Metformin",
            "Insulin"
        ],

        "labs": [
            "HbA1c",
            "Blood Glucose"
        ],

        "surgeries": [],

        "vitals": {
            "heart_rate": (70, 95),
            "spo2": (96, 100),
            "temperature": (36.5, 37.2)
        }
    },

    "COVID-19": {

        "medications": [
            "Azithromycin",
            "Paracetamol"
        ],

        "labs": [
            "CRP",
            "D-Dimer",
            "CBC"
        ],

        "surgeries": [],

        "vitals": {
            "heart_rate": (90, 130),
            "spo2": (82, 94),
            "temperature": (37.8, 40.0)
        }
    },

    "Pneumonia": {

        "medications": [
            "Amoxicillin",
            "Azithromycin"
        ],

        "labs": [
            "CBC",
            "Chest X-Ray"
        ],

        "surgeries": [],

        "vitals": {
            "heart_rate": (85, 120),
            "spo2": (88, 95),
            "temperature": (37.5, 39.5)
        }
    },

    "Fracture": {

        "medications": [
            "Ibuprofen",
            "Morphine"
        ],

        "labs": [
            "X-Ray"
        ],

        "surgeries": [
            "Hip Replacement",
            "Knee Replacement"
        ],

        "vitals": {
            "heart_rate": (75, 110),
            "spo2": (96, 100),
            "temperature": (36.5, 37.2)
        }
    },

    "Asthma": {

        "medications": [
            "Salbutamol"
        ],

        "labs": [
            "Pulmonary Function Test"
        ],

        "surgeries": [],

        "vitals": {
            "heart_rate": (80, 110),
            "spo2": (90, 96),
            "temperature": (36.5, 37.3)
        }
    },

    "Kidney Disease": {

        "medications": [
            "Losartan"
        ],

        "labs": [
            "Creatinine",
            "Urea"
        ],

        "surgeries": [
            "Kidney Transplant"
        ],

        "vitals": {
            "heart_rate": (70, 100),
            "spo2": (94, 99),
            "temperature": (36.5, 37.5)
        }
    },

    "Migraine": {

        "medications": [
            "Ibuprofen",
            "Paracetamol"
        ],

        "labs": [
            "CT Brain"
        ],

        "surgeries": [],

        "vitals": {
            "heart_rate": (70, 95),
            "spo2": (96, 100),
            "temperature": (36.5, 37.2)
        }
    },

    "Appendicitis": {

        "medications": [
            "Amoxicillin",
            "Paracetamol"
        ],

        "labs": [
            "CBC",
            "CRP"
        ],

        "surgeries": [
            "Appendectomy"
        ],

        "vitals": {
            "heart_rate": (85, 120),
            "spo2": (95, 100),
            "temperature": (37.5, 39.0)
        }
    },

    "Trauma": {

        "medications": [
            "Morphine",
            "Ibuprofen"
        ],

        "labs": [
            "CBC",
            "X-Ray",
            "CT Brain"
        ],

        "surgeries": [
            "Emergency Trauma Surgery"
        ],

        "vitals": {
            "heart_rate": (100, 150),
            "spo2": (88, 96),
            "temperature": (36.0, 37.8)
        }
    },

    "Cancer": {

        "medications": [
            "Morphine"
        ],

        "labs": [
            "Biopsy",
            "CBC"
        ],

        "surgeries": [
            "Tumor Removal"
        ],

        "vitals": {
            "heart_rate": (80, 120),
            "spo2": (92, 98),
            "temperature": (36.8, 38.5)
        }
    },

    "Infection": {

        "medications": [
            "Amoxicillin",
            "Azithromycin",
            "Paracetamol"
        ],

        "labs": [
            "CBC",
            "CRP"
        ],

        "surgeries": [],

        "vitals": {
            "heart_rate": (80, 120),
            "spo2": (94, 99),
            "temperature": (37.5, 39.0)
        }
    }
}