from faker import Faker

fake = Faker()

def name():
    return fake.name()

def phone():
    return fake.phone_number()

def email():
    return fake.email()

def address():
    return fake.address()

def date():
    return fake.date_between("-365d", "today")