from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
from datetime import datetime
from app.services.comment_service import create_comment, get_comments_by_notice, reply_to_comment, get_all_comments
from app.services.user_service import get_user_by_id, is_admin
from app.services.notice_service import get_notice_by_id

comments_bp = Blueprint('comments', __name__)

@comments_bp.route('', methods=['POST'])
def add_comment():
    """Create a new comment/query"""
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data or not all(k in data for k in ('notice_id', 'content')):
        return jsonify({"error": "Missing required fields"}), 400
    
    # Validate notice exists
    notice = get_notice_by_id(data['notice_id'])
    if not notice:
        return jsonify({"error": "Notice not found"}), 404
    
    comment_data = {
        "notice_id": ObjectId(data['notice_id']),
        "user_id": ObjectId(current_user_id),
        "content": data['content'],
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    comment_id = create_comment(comment_data)
    
    return jsonify({
        "message": "Comment added successfully",
        "comment_id": str(comment_id)
    }), 201

@comments_bp.route('/notice/<notice_id>', methods=['GET'])
def get_notice_comments(notice_id):
    """Get all comments for a specific notice"""
    try:
        comments = get_comments_by_notice(notice_id)
        
        # Format the response
        formatted_comments = []
        for comment in comments:
            user = get_user_by_id(comment['user_id'])
            user_name = user.get('email', 'Unknown').split('@')[0] if user else 'Unknown'
            
            replied_by_name = None
            if 'replied_by' in comment and comment['replied_by']:
                admin = get_user_by_id(comment['replied_by'])
                replied_by_name = admin.get('email', 'Admin').split('@')[0] if admin else 'Admin'
            
            formatted_comment = {
                "id": str(comment['_id']),
                "notice_id": str(comment['notice_id']),
                "user": user_name,
                "content": comment['content'],
                "created_at": comment['created_at'].isoformat(),
                "has_reply": bool(comment.get('admin_reply')),
                "admin_reply": comment.get('admin_reply'),
                "replied_by": replied_by_name,
                "replied_at": comment.get('replied_at', '').isoformat() if comment.get('replied_at') else None
            }
            
            formatted_comments.append(formatted_comment)
        
        return jsonify({"comments": formatted_comments}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@comments_bp.route('/<comment_id>/reply', methods=['POST'])
def admin_reply(comment_id):
    """Reply to a comment (admin only)"""
    current_user_id = get_jwt_identity()
    
    # Check if user is admin
    if not is_admin(current_user_id):
        return jsonify({"error": "Unauthorized. Admin access required"}), 403
    
    data = request.get_json()
    
    if not data or 'reply' not in data:
        return jsonify({"error": "Reply content is required"}), 400
    
    reply_data = {
        "admin_reply": data['reply'],
        "replied_by": ObjectId(current_user_id),
        "replied_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    success = reply_to_comment(comment_id, reply_data)
    
    if success:
        return jsonify({"message": "Reply added successfully"}), 200
    else:
        return jsonify({"error": "Comment not found or reply failed"}), 404

@comments_bp.route('', methods=['GET'])
def list_all_comments():
    """Get all comments (admin only)"""
    current_user_id = get_jwt_identity()
    
    # Check if user is admin
    if not is_admin(current_user_id):
        return jsonify({"error": "Unauthorized. Admin access required"}), 403
    
    comments = get_all_comments()
    
    # Format the response
    formatted_comments = []
    for comment in comments:
        user = get_user_by_id(comment['user_id'])
        user_name = user.get('email', 'Unknown').split('@')[0] if user else 'Unknown'
        
        notice = get_notice_by_id(str(comment['notice_id']))
        notice_title = notice.get('title', 'Unknown Notice') if notice else 'Unknown Notice'
        
        replied_by_name = None
        if 'replied_by' in comment and comment['replied_by']:
            admin = get_user_by_id(comment['replied_by'])
            replied_by_name = admin.get('email', 'Admin').split('@')[0] if admin else 'Admin'
        
        formatted_comment = {
            "id": str(comment['_id']),
            "notice_id": str(comment['notice_id']),
            "notice_title": notice_title,
            "user": user_name,
            "content": comment['content'],
            "created_at": comment['created_at'].isoformat(),
            "has_reply": bool(comment.get('admin_reply')),
            "admin_reply": comment.get('admin_reply'),
            "replied_by": replied_by_name,
            "replied_at": comment.get('replied_at', '').isoformat() if comment.get('replied_at') else None
        }
        
        formatted_comments.append(formatted_comment)
    
    return jsonify({"comments": formatted_comments}), 200

