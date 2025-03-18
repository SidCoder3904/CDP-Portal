from flask import Blueprint, jsonify, request
from bson.objectid import ObjectId
from datetime import datetime
from app import mongo  # Import the mongo instance from app/__init__.py

notices_bp = Blueprint("notices", __name__)

def serialize_notice(notice):
    """Convert MongoDB document to JSON serializable format."""
    return {
        "_id": str(notice["_id"]),  # Convert ObjectId to string
        "title": notice.get("title", ""),  # Use .get() to avoid KeyError
        "content": notice.get("content", ""),  # Use .get() to avoid KeyError
        "created_by": str(notice.get("created_by", "")),  # Convert ObjectId to string if exists
        "created_at": notice.get("created_at", ""),
        "updated_at": notice.get("updated_at", ""),
    }



@notices_bp.route("/", methods=["GET"])
def list_notices():
    """Fetch all notices, sorted by creation date (newest first)."""
    try:
        notices_cursor = mongo.db.notification.find().sort("created_at", -1)
        notices_list = list(notices_cursor)

        # Serialize each document
        serialized_notices = [serialize_notice(notice) for notice in notices_list]

        return jsonify({"notices": serialized_notices}), 200
    except Exception as e:
        print(f"Error in list_notices: {str(e)}")
        return jsonify({"error": str(e)}), 500



@notices_bp.route("/", methods=["POST"])
def create_notice():
    """Create a new notice."""
    try:
        data = request.json
        
        # Validate required fields
        if not data or "title" not in data or "content" not in data or "created_by" not in data:
            return jsonify({"error": "Missing required fields"}), 400
        
        # Prepare the new notice document
        new_notice = {
            "title": data["title"],
            "content": data["content"],
            "created_by": data["created_by"],  # No ObjectId conversion needed
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        # Insert into MongoDB
        result = mongo.db.notification.insert_one(new_notice)
        
        return jsonify({
            "message": "Notice added successfully",
            "id": str(result.inserted_id)  # Convert ObjectId to string
        }), 201
    except Exception as e:
        print(f"Error in create_notice: {str(e)}")
        return jsonify({"error": str(e)}), 500

@notices_bp.route("/<string:notice_id>", methods=["DELETE"])
def delete_notice(notice_id):
    """Delete a notice by its ID."""
    try:
        # Find and delete notice using PyMongo
        result = mongo.db.notification.delete_one({"_id": ObjectId(notice_id)})
        
        if result.deleted_count == 0:
            return jsonify({"error": "Notice not found"}), 404
        
        return jsonify({"message": "Notice deleted successfully"}), 200
    except Exception as e:
        print(f"Error in delete_notice: {str(e)}")
        return jsonify({"error": str(e)}), 500
