import random

from scripts.utils.constants import (
    ROOM_STATUSES,
    SHIFTS,
    GENDERS,
    BLOOD_GROUPS,
    PATIENT_STATUS,
    SEVERITY_LEVELS
)


def random_choice(items):
    return random.choice(items)


def probability(percent):
    return random.random() < percent


def random_coordinates():
    return (
        round(random.uniform(0, 100), 2),
        round(random.uniform(0, 20), 2),
        round(random.uniform(0, 100), 2)
    )


def random_status():
    return random.choice(ROOM_STATUSES)


def random_shift():
    return random.choice(SHIFTS)


def random_gender():
    return random.choice(GENDERS)


def random_blood_group():
    return random.choice(BLOOD_GROUPS)


def random_patient_status():
    return random.choice(PATIENT_STATUS)


def random_severity():
    return random.choices(
        SEVERITY_LEVELS,
        weights=[45, 30, 15, 10],
        k=1
    )[0]