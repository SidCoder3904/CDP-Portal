from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
from app.services.comment_service import CommentService
from app.utils.auth import admin_required, student_required

comment_bp = Blueprint('comment', __name__)
comment_service = CommentService()

@comment_bp.route('/api/comments', methods=['GET'])
@cross_origin()
def get_comments():
    placement_cycle_id = request.args.get('placement_cycle_id')
    if not placement_cycle_id:
        return jsonify({'error': 'placement_cycle_id is required'}), 400
    
    try:
        comments = comment_service.get_comments(placement_cycle_id)
        return jsonify(comments)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@comment_bp.route('/api/comments', methods=['POST'])
@cross_origin()
def create_comment():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    required_fields = ['content', 'user', 'user_type', 'placement_cycle_id']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'{field} is required'}), 400
    
    try:
        comment = comment_service.create_comment(data)
        return jsonify(comment), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@comment_bp.route('/api/comments/<comment_id>', methods=['DELETE'])
@cross_origin()
def delete_comment(comment_id):
    try:
        comment_service.delete_comment(comment_id)
        return '', 204
    except Exception as e:
        return jsonify({'error': str(e)}), 500 