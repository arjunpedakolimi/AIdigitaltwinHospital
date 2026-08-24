import os

from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv("backend/.env")

uri = os.getenv("MONGODB_URI")

client = MongoClient(uri)

try:
    client.admin.command("ping")
    print("✅ Connected to MongoDB Atlas!")
except Exception as e:
    print(e)