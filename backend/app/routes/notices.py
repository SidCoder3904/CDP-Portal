# app/routes/notices.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.notice_service import NoticeService
from app.utils.auth import admin_required
from app.utils.validators import validate_notice

notices_bp = Blueprint('notices', __name__)

@notices_bp.route('', methods=['GET'])
def get_notices():
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 10))
    notice_type = request.args.get('type')
    company = request.args.get('company')
    
    notices, total = NoticeService.get_notices(page, per_page, notice_type, company)
    
    return jsonify({
        'notices': notices,
        'pagination': {
            'total': total,
            'page': page,
            'per_page': per_page,
            'pages': (total + per_page - 1) // per_page
        }
    }), 200

@notices_bp.route('/<notice_id>', methods=['GET'])
def get_notice(notice_id):
    notice = NoticeService.get_notice_by_id(notice_id)
    if not notice:
        return jsonify({"message": "Notice not found"}), 404
    
    return jsonify(notice), 200

@notices_bp.route('', methods=['POST'])
@jwt_required()
@admin_required
def create_notice():
    data = request.get_json()
    
    # Validate input
    errors = validate_notice(data)
    if errors:
        return jsonify({"errors": errors}), 400
    
    # Get current user
    current_user = get_jwt_identity()
    
    notice_id = NoticeService.create_notice(data, current_user['id'])
    notice = NoticeService.get_notice_by_id(notice_id)
    
    return jsonify(notice), 201

@notices_bp.route('/<notice_id>', methods=['PUT'])
@jwt_required()
@admin_required
def update_notice(notice_id):
    data = request.get_json()
    
    # Validate input
    errors = validate_notice(data)
    if errors:
        return jsonify({"errors": errors}), 400
    
    updated = NoticeService.update_notice(notice_id, data)
    if not updated:
        return jsonify({"message": "Notice not found"}), 404
    
    notice = NoticeService.get_notice_by_id(notice_id)
    return jsonify(notice), 200

@notices_bp.route('/<notice_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_notice(notice_id):
    deleted = NoticeService.delete_notice(notice_id)
    if not deleted:
        return jsonify({"message": "Notice not found"}), 404
    
    return jsonify({"message": "Notice successfully deleted"}), 200
