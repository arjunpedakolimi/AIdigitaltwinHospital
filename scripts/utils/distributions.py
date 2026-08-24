import random


def heart_rate():
    return max(40, min(180, int(random.gauss(78, 12))))


def spo2():
    return max(82, min(100, int(random.gauss(97, 2))))


def temperature():
    return round(random.gauss(36.8, 0.6), 1)


def respiration():
    return max(8, min(35, int(random.gauss(16, 3))))


def systolic():
    return max(90, min(180, int(random.gauss(122, 14))))


def diastolic():
    return max(55, min(120, int(random.gauss(78, 9))))


def blood_pressure():
    return f"{systolic()}/{diastolic()}"