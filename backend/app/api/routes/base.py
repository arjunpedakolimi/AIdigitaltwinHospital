from fastapi import APIRouter
from backend.app.database.mongodb import get_database
from bson import ObjectId
import math


def clean_for_json(value):
    """
    Recursively convert values that cannot be represented
    safely in standard JSON.
    """

    # MongoDB ObjectId
    if isinstance(value, ObjectId):
        return str(value)

    # Handle dictionaries
    if isinstance(value, dict):
        return {
            key: clean_for_json(val)
            for key, val in value.items()
        }

    # Handle lists / tuples
    if isinstance(value, (list, tuple)):
        return [
            clean_for_json(item)
            for item in value
        ]

    # Handle NaN and Infinity
    if isinstance(value, float):
        if not math.isfinite(value):
            return None

    return value


def create_router(collection_name: str, tag: str):

    router = APIRouter(
        prefix=f"/api/{collection_name}",
        tags=[tag]
    )

    @router.get("/")
    async def get_data():

        db = get_database()

        data = await db[collection_name].find().to_list(length=1000)

        # Clean MongoDB data before returning it as JSON
        data = clean_for_json(data)

        return data

    return router
