# app/routes/comments.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.comment_service import CommentService
from app.utils.auth import admin_required
from app.utils.validators import validate_comment
from bson.objectid import ObjectId

comments_bp = Blueprint('comments', __name__)

@comments_bp.route('/', methods=['GET'])
def get_comments():
    """Get all comments for a placement cycle"""
    try:
        placement_cycle_id = request.args.get('placement_cycle_id')
        if not placement_cycle_id:
            return jsonify({'error': 'placement_cycle_id is required'}), 400

        comments = CommentService.get_comments(placement_cycle_id)
        return jsonify(comments)
    except Exception as e:
        print(f"Error in get_comments route: {str(e)}")
        return jsonify({'error': str(e)}), 500

@comments_bp.route('/notices/<notice_id>/comments', methods=['POST'])
@jwt_required()
def add_comment(notice_id):
    data = request.get_json()
    
    # Validate input
    errors = validate_comment(data)
    if errors:
        return jsonify({"errors": errors}), 400
    
    current_user = get_jwt_identity()
    
    comment_id = CommentService.create_comment(notice_id, current_user['id'], data.get('content'))
    comment = CommentService.get_comment_by_id(comment_id)
    
    return jsonify(comment), 201

@comments_bp.route('/<comment_id>/reply', methods=['POST'])
@jwt_required()
@admin_required
def reply_to_comment(comment_id):
    data = request.get_json()
    
    # Validate input
    if not data.get('content'):
        return jsonify({"errors": {"content": "Reply content is required"}}), 400
    
    current_user = get_jwt_identity()
    
    updated = CommentService.add_reply(comment_id, current_user['id'], data.get('content'))
    if not updated:
        return jsonify({"message": "Comment not found"}), 404
    
    comment = CommentService.get_comment_by_id(comment_id)
    return jsonify(comment), 200

@comments_bp.route('/<comment_id>', methods=['DELETE'])
@jwt_required()
def delete_comment(comment_id):
    current_user = get_jwt_identity()
    
    # Check if user is admin or comment owner
    can_delete = CommentService.can_delete_comment(comment_id, current_user['id'], current_user['role'])
    if not can_delete:
        return jsonify({"message": "Unauthorized to delete this comment"}), 403
    
    deleted = CommentService.delete_comment(comment_id)
    if not deleted:
        return jsonify({"message": "Comment not found"}), 404
    
    return jsonify({"message": "Comment successfully deleted"}), 200
