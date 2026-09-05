import os
from dotenv import load_dotenv
from mistralai.client import Mistral

load_dotenv("backend/.env")

api_key = os.getenv("MISTRAL_API_KEY")

if not api_key:
    raise RuntimeError("MISTRAL_API_KEY is missing from backend/.env")

client = Mistral(api_key=api_key)

response = client.chat.complete(
    model="mistral-small-latest",
    messages=[
        {
            "role": "user",
            "content": (
                "You are an AI assistant for a hospital digital twin. "
                "Explain in one short sentence why monitoring ICU "
                "patient deterioration is important."
            ),
        }
    ],
)

print(response.choices[0].message.content)
