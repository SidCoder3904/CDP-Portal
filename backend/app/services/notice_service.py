from app import mongo
from bson import ObjectId
from datetime import datetime

def create_notice(notice_data):
    """Create a new notice"""
    result = mongo.db.notices.insert_one(notice_data)
    return result.inserted_id

def get_all_notices():
    """Get all notices, sorted by creation date (newest first)"""
    return list(mongo.db.notices.find().sort("created_at", -1))

def get_notice_by_id(notice_id):
    """Get a notice by ID"""
    try:
        return mongo.db.notices.find_one({"_id": ObjectId(notice_id)})
    except:
        return None

def update_notice(notice_id, update_data):
    """Update a notice"""
    try:
        result = mongo.db.notices.update_one(
            {"_id": ObjectId(notice_id)},
            {"$set": update_data}
        )
        return result.modified_count > 0
    except:
        return False

def delete_notice(notice_id):
    """Delete a notice"""
    try:
        result = mongo.db.notices.delete_one({"_id": ObjectId(notice_id)})
        return result.deleted_count > 0
    except:
        return False

