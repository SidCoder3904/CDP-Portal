# app/routes/students.py
from json import dumps
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.student_service import StudentService
from app.utils.auth import admin_required, student_required
from app.utils.validators import validate_student
from app.services.job_service import JobService


students_bp = Blueprint('students', __name__)

@students_bp.route('/<student_id>', methods=['GET'])
@jwt_required()
def get_student(student_id):
    current_user = get_jwt_identity()
    
    # Check if user is admin or the student themselves
    if current_user['role'] != 'admin' and current_user['id'] != student_id:
        return jsonify({"message": "Unauthorized access"}), 403
    
    student = StudentService.get_student_by_id(student_id)
    if not student:
        return jsonify({"message": "Student not found"}), 404
    
    return jsonify(student), 200

@students_bp.route('/<student_id>', methods=['PUT'])
@jwt_required()
def update_student(student_id):
    current_user = get_jwt_identity()
    
    # Check if user is admin or the student themselves
    if current_user['role'] != 'admin' and current_user['id'] != student_id:
        return jsonify({"message": "Unauthorized access"}), 403
    
    data = request.get_json()
    
    # Validate input
    errors = validate_student(data)
    if errors:
        return jsonify({"errors": errors}), 400
    
    updated = StudentService.update_student(student_id, data)
    if not updated:
        return jsonify({"message": "Student not found"}), 404
    
    student = StudentService.get_student_by_id(student_id)
    return jsonify(student), 200

@students_bp.route('/<student_id>/education', methods=['GET'])
@jwt_required()
def get_education(student_id):
    current_user = get_jwt_identity()
    
    # Check if user is admin or the student themselves
    if current_user['role'] != 'admin' and current_user['id'] != student_id:
        return jsonify({"message": "Unauthorized access"}), 403
    
    education_records = StudentService.get_education_by_student(student_id)
    return jsonify(education_records), 200

@students_bp.route('/<student_id>/education', methods=['POST'])
@jwt_required()
def add_education(student_id):
    current_user = get_jwt_identity()
    
    # Check if user is admin or the student themselves
    if current_user['role'] != 'admin' and current_user['id'] != student_id:
        return jsonify({"message": "Unauthorized access"}), 403
    
    data = request.get_json()
    education_id = StudentService.add_education(student_id, data)
    education = StudentService.get_education_by_id(education_id)
    
    return jsonify(education), 201

# Similar endpoints for experience, projects, etc.

@students_bp.route('/<student_id>/<section>/<item_id>/verify', methods=['PATCH'])
@jwt_required()
@admin_required
def verify_item(student_id, section, item_id):
    verified = StudentService.verify_item(student_id, section, item_id)
    if not verified:
        return jsonify({"message": f"{section.capitalize()} item not found"}), 404
    
    return jsonify({"message": f"{section.capitalize()} item verified successfully"}), 200


@students_bp.route('/me/applications', methods=['GET'])
@jwt_required()
# @student_required
def get_my_applications():
    """Get all applications submitted by the current student"""
    current_user = get_jwt_identity()
    student_id = current_user['id']
    
    applications = JobService.get_applications_by_student(student_id)
    
    # Convert ObjectId to string for JSON serialization
    return dumps(applications), 200