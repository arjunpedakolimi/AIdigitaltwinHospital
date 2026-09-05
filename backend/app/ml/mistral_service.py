import os

from dotenv import load_dotenv
from mistralai.client import Mistral

load_dotenv("backend/.env")

MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")

if not MISTRAL_API_KEY:
    raise RuntimeError("MISTRAL_API_KEY is missing")

client = Mistral(api_key=MISTRAL_API_KEY)


def generate_patient_risk_explanation(
    age: float,
    heart_rate: float,
    systolic_bp: float,
    spo2: float,
    respiratory_rate: float,
    temperature: float,
    risk_level: str,
    risk_probability: float,
) -> str:

    prompt = f"""
You are an AI explanation assistant inside a hospital
digital twin.

The patient-risk ML model produced:

Risk level: {risk_level}
Risk probability: {risk_probability}%

Patient data:

Age: {age}
Heart rate: {heart_rate} bpm
Systolic blood pressure: {systolic_bp} mmHg
SpO2: {spo2}%
Respiratory rate: {respiratory_rate} /min
Temperature: {temperature} °C

Explain briefly why this patient is considered
{risk_level} risk.

Mention the important abnormal vital signs and
provide a safe recommendation for clinical review.

Do not diagnose a disease.
Do not replace a clinician.
Keep the explanation concise and suitable for
a hospital dashboard.
"""

    response = client.chat.complete(
        model="mistral-small-latest",
        messages=[
            {
                "role": "user",
                "content": prompt,
            }
        ],
    )

    return response.choices[0].message.content
