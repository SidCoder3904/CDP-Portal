from flask import Blueprint, jsonify, request
from app import mongo  # Import Flask-PyMongo instance

notices_bp = Blueprint("notices", __name__)

@notices_bp.route("/notices", methods=["GET"])
def list_notices():
    """Fetch all notices, sorted by creation date (newest first)."""
    try:
        notices = mongo.db.notices.find().sort("created_at", -1)  # Sorting in descending order
        notice_list = []

        for notice in notices:
            notice["_id"] = str(notice["_id"])  # Convert ObjectId to string for JSON serialization
            notice_list.append(notice)

        return jsonify(notice_list), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@notices_bp.route("/notices", methods=["POST"])
def create_notice():
    """Create a new notice."""
    try:
        data = request.json
        if not data or "title" not in data or "content" not in data:
            return jsonify({"error": "Missing required fields"}), 400
        
        new_notice = {
            "title": data["title"],
            "content": data["content"],
            "created_at": data.get("created_at")  # Optional, else MongoDB adds default timestamp
        }

        result = mongo.db.notices.insert_one(new_notice)
        return jsonify({"message": "Notice added", "id": str(result.inserted_id)}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@notices_bp.route("/notices/<string:notice_id>", methods=["DELETE"])
def delete_notice(notice_id):
    """Delete a notice by its ID."""
    from bson.objectid import ObjectId
    try:
        result = mongo.db.notices.delete_one({"_id": ObjectId(notice_id)})

        if result.deleted_count == 0:
            return jsonify({"error": "Notice not found"}), 404

        return jsonify({"message": "Notice deleted"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
