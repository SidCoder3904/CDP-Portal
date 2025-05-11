# app/routes/notices.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.notice_service import NoticeService
from app.utils.auth import admin_required
from app.utils.validators import validate_notice
from app.utils.cloudinary_config import upload_file, upload_notice
import logging
import cloudinary
from functools import wraps

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

notices_bp = Blueprint('notices', __name__)

@notices_bp.route('', methods=['GET'])
def get_notices():
    try:
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
    except Exception as e:
        logger.error(f"Error in get_notices: {str(e)}", exc_info=True)
        return jsonify({"error": "Failed to fetch notices"}), 500

@notices_bp.route('/<notice_id>', methods=['GET'])
def get_notice(notice_id):
    try:
        notice = NoticeService.get_notice_by_id(notice_id)
        if not notice:
            return jsonify({"error": "Notice not found"}), 404
        
        return jsonify(notice), 200
    except Exception as e:
        logger.error(f"Error in get_notice: {str(e)}", exc_info=True)
        return jsonify({"error": "Failed to fetch notice"}), 500

@notices_bp.route('', methods=['POST'])
# @jwt_required()
# @admin_required
def create_notice():
    try:
        data = request.get_json()
        logger.debug(f"Received notice data: {data}")
        
        # Log request headers
        logger.debug(f"Request headers: {dict(request.headers)}")
        
        # Validate input
        errors = validate_notice(data)
        if errors:
            logger.error(f"Validation errors: {errors}")
            return jsonify({
                "error": "Validation failed",
                "errors": errors
            }), 422
        
        try:
            # Ensure all required fields are present
            required_fields = ['title', 'link', 'date']
            missing_fields = [field for field in required_fields if not data.get(field)]
            if missing_fields:
                logger.error(f"Missing required fields: {missing_fields}")
                return jsonify({
                    "error": "Missing required fields",
                    "errors": {field: f"{field} is required" for field in missing_fields}
                }), 422

            # Log the data being sent to the database
            logger.debug(f"Creating notice with data: {data}")
            
            notice_id = NoticeService.create_notice(data, "67c76574a6a847eeac43c9ce")
            notice = NoticeService.get_notice_by_id(notice_id)
            
            if not notice:
                return jsonify({"error": "Failed to create notice"}), 500
                
            logger.info(f"Successfully created notice with ID: {notice_id}")
            return jsonify(notice), 201
            
        except Exception as e:
            logger.error(f"Error creating notice in database: {str(e)}", exc_info=True)
            return jsonify({"error": "Failed to create notice in database"}), 500
            
    except Exception as e:
        logger.error(f"Unexpected error in create_notice: {str(e)}", exc_info=True)
        return jsonify({"error": "Internal server error"}), 500

@notices_bp.route('/<notice_id>', methods=['PUT'])
# @jwt_required()
# @admin_required
def update_notice(notice_id):
    try:
        data = request.get_json()
        logger.debug(f"Received update data: {data}")
        
        # Validate input
        errors = validate_notice(data)
        if errors:
            logger.error(f"Validation errors: {errors}")
            return jsonify({
                "error": "Validation failed",
                "errors": errors
            }), 422
        
        try:
            # Ensure all required fields are present
            required_fields = ['title', 'link', 'date']
            missing_fields = [field for field in required_fields if not data.get(field)]
            if missing_fields:
                logger.error(f"Missing required fields: {missing_fields}")
                return jsonify({
                    "error": "Missing required fields",
                    "errors": {field: f"{field} is required" for field in missing_fields}
                }), 422

            updated = NoticeService.update_notice(notice_id, data)
            if not updated:
                return jsonify({"error": "Notice not found"}), 404
            
            notice = NoticeService.get_notice_by_id(notice_id)
            return jsonify(notice), 200
            
        except Exception as e:
            logger.error(f"Error updating notice in database: {str(e)}", exc_info=True)
            return jsonify({"error": "Failed to update notice"}), 500
            
    except Exception as e:
        logger.error(f"Error in update_notice: {str(e)}", exc_info=True)
        return jsonify({"error": "Failed to update notice"}), 500

@notices_bp.route('/<notice_id>', methods=['DELETE'])
# @jwt_required()
# @admin_required
def delete_notice(notice_id):
    try:
        deleted = NoticeService.delete_notice(notice_id)
        if not deleted:
            return jsonify({"error": "Notice not found"}), 404
        
        return jsonify({"message": "Notice successfully deleted"}), 200
    except Exception as e:
        logger.error(f"Error in delete_notice: {str(e)}", exc_info=True)
        return jsonify({"error": "Failed to delete notice"}), 500

@notices_bp.route('/upload', methods=['POST'])
@jwt_required()
@admin_required
def upload_notice_handler():
    """Upload a notice PDF file"""
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400
            
        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
            
        # Validate file type
        if not file.filename.lower().endswith('.pdf'):
            return jsonify({"error": "Only PDF files are allowed"}), 400
            
        # Upload to Cloudinary
        file_url = upload_notice(file)
        
        return jsonify({"url": file_url}), 200
        
    except Exception as e:
        print(f"Notice upload error: {str(e)}")
        return jsonify({"error": str(e)}), 500

@notices_bp.route('/test-cloudinary', methods=['GET'])
def test_cloudinary():
    try:
        # Test Cloudinary configuration
        test_result = cloudinary.api.ping()
        return jsonify({
            "status": "success",
            "message": "Cloudinary configuration is working",
            "details": test_result
        }), 200
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": "Cloudinary configuration error",
            "error": str(e)
        }), 500
