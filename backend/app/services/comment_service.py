from app import mongo
from bson import ObjectId
from datetime import datetime

def create_comment(comment_data):
    """Create a new comment"""
    result = mongo.db.comments.insert_one(comment_data)
    return result.inserted_id

def get_comments_by_notice(notice_id):
    """Get all comments for a specific notice, sorted by creation date"""
    return list(mongo.db.comments.find(
        {"notice_id": ObjectId(notice_id)}
    ).sort("created_at", 1))

def reply_to_comment(comment_id, reply_data):
    """Add an admin reply to a comment"""
    try:
        result = mongo.db.comments.update_one(
            {"_id": ObjectId(comment_id)},
            {"$set": reply_data}
        )
        return result.modified_count > 0
    except:
        return False

def get_all_comments():
    """Get all comments, sorted by creation date (newest first)"""
    return list(mongo.db.comments.find().sort("created_at", -1))

