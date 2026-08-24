DEPARTMENTS = [
    {
        "department_id": "DEP0001",
        "name": "Emergency",
        "floor": 1,
        "prefix": "ER",
        "rooms": 20,
        "capacity_per_room": 5,
        "doctor_count": 20,
        "nurse_count": 40,
        "specializations": [
            "Emergency Medicine",
            "Trauma Surgery",
            "Critical Care"
        ]
    },
    {
        "department_id": "DEP0002",
        "name": "ICU",
        "floor": 2,
        "prefix": "ICU",
        "rooms": 15,
        "capacity_per_room": 2,
        "doctor_count": 18,
        "nurse_count": 45,
        "specializations": [
            "Critical Care",
            "Pulmonology",
            "Intensive Medicine"
        ]
    },
    {
        "department_id": "DEP0003",
        "name": "Operation Theatre",
        "floor": 2,
        "prefix": "OT",
        "rooms": 10,
        "capacity_per_room": 1,
        "doctor_count": 15,
        "nurse_count": 20,
        "specializations": [
            "General Surgery",
            "Anesthesiology"
        ]
    },
    {
        "department_id": "DEP0004",
        "name": "General Ward",
        "floor": 3,
        "prefix": "GW",
        "rooms": 80,
        "capacity_per_room": 6,
        "doctor_count": 35,
        "nurse_count": 90,
        "specializations": [
            "Internal Medicine"
        ]
    },
    {
        "department_id": "DEP0005",
        "name": "Cardiology",
        "floor": 4,
        "prefix": "CARD",
        "rooms": 20,
        "capacity_per_room": 4,
        "doctor_count": 12,
        "nurse_count": 25,
        "specializations": [
            "Cardiology"
        ]
    },
    {
        "department_id": "DEP0006",
        "name": "Neurology",
        "floor": 4,
        "prefix": "NEU",
        "rooms": 20,
        "capacity_per_room": 4,
        "doctor_count": 10,
        "nurse_count": 20,
        "specializations": [
            "Neurology"
        ]
    },
    {
        "department_id": "DEP0007",
        "name": "Orthopedics",
        "floor": 5,
        "prefix": "ORTH",
        "rooms": 20,
        "capacity_per_room": 4,
        "doctor_count": 10,
        "nurse_count": 20,
        "specializations": [
            "Orthopedic Surgery"
        ]
    },
    {
        "department_id": "DEP0008",
        "name": "Radiology",
        "floor": 1,
        "prefix": "RAD",
        "rooms": 10,
        "capacity_per_room": 2,
        "doctor_count": 5,
        "nurse_count": 8,
        "specializations": [
            "Radiology"
        ]
    },
    {
        "department_id": "DEP0009",
        "name": "Laboratory",
        "floor": 1,
        "prefix": "LAB",
        "rooms": 10,
        "capacity_per_room": 2,
        "doctor_count": 5,
        "nurse_count": 8,
        "specializations": [
            "Pathology"
        ]
    },
    {
        "department_id": "DEP0010",
        "name": "Pharmacy",
        "floor": 1,
        "prefix": "PHARM",
        "rooms": 5,
        "capacity_per_room": 2,
        "doctor_count": 0,
        "nurse_count": 5,
        "specializations": [
            "Pharmacy"
        ]
    },
    {
        "department_id": "DEP0011",
        "name": "Administration",
        "floor": 6,
        "prefix": "ADMIN",
        "rooms": 25,
        "capacity_per_room": 2,
        "doctor_count": 0,
        "nurse_count": 0,
        "specializations": []
    },
    {
        "department_id": "DEP0012",
        "name": "Reception",
        "floor": 1,
        "prefix": "REC",
        "rooms": 15,
        "capacity_per_room": 2,
        "doctor_count": 0,
        "nurse_count": 10,
        "specializations": []
    }
]

ROOM_STATUSES = [
    "Available",
    "Occupied",
    "Cleaning",
    "Maintenance"
]

SHIFTS = [
    "Morning",
    "Evening",
    "Night"
]

GENDERS = [
    "Male",
    "Female"
]

BLOOD_GROUPS = [
    "A+",
    "A-",
    "B+",
    "B-",
    "AB+",
    "AB-",
    "O+",
    "O-"
]

PATIENT_STATUS = [
    "Stable",
    "Critical",
    "Recovering",
    "Discharged"
]

SEVERITY_LEVELS = [
    "Low",
    "Moderate",
    "High",
    "Critical"
]

EQUIPMENT_STATUS = [
    "Available",
    "In Use",
    "Maintenance",
    "Offline"
]