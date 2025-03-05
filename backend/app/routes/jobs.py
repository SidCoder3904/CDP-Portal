# app/routes/jobs.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.job_service import JobService
from app.utils.auth import admin_required, student_required
from app.utils.validators import validate_job

jobs_bp = Blueprint('jobs', __name__)

@jobs_bp.route('/<job_id>', methods=['GET'])
@jwt_required()
def get_job(job_id):
    job = JobService.get_job_by_id(job_id)
    if not job:
        return jsonify({"message": "Job not found"}), 404
    
    return jsonify(job), 200

@jobs_bp.route('/<job_id>', methods=['PUT'])
@jwt_required()
@admin_required
def update_job(job_id):
    data = request.get_json()
    
    # Validate input
    errors = validate_job(data)
    if errors:
        return jsonify({"errors": errors}), 400
    
    updated = JobService.update_job(job_id, data)
    if not updated:
        return jsonify({"message": "Job not found"}), 404
    
    job = JobService.get_job_by_id(job_id)
    return jsonify(job), 200

@jobs_bp.route('/<job_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_job(job_id):
    deleted = JobService.delete_job(job_id)
    if not deleted:
        return jsonify({"message": "Job not found"}), 404
    
    return jsonify({"message": "Job deleted successfully"}), 200

@jobs_bp.route('/<job_id>/apply', methods=['POST'])
@jwt_required()
@student_required
def apply_for_job(job_id):
    current_user = get_jwt_identity()
    
    # Check if student is eligible
    eligible = JobService.check_student_eligibility(job_id, current_user['id'])
    if not eligible:
        return jsonify({"message": "You are not eligible for this job"}), 403
    
    # Check if student has already applied
    already_applied = JobService.has_student_applied(job_id, current_user['id'])
    if already_applied:
        return jsonify({"message": "You have already applied for this job"}), 400
    
    application_id = JobService.create_application(job_id, current_user['id'])
    application = JobService.get_application_by_id(application_id)
    
    return jsonify(application), 201

@jobs_bp.route('/<job_id>/applications', methods=['GET'])
@jwt_required()
@admin_required
def get_job_applications(job_id):
    applications = JobService.get_applications_by_job(job_id)
    return jsonify(applications), 200

@jobs_bp.route('/applications/<application_id>/status', methods=['PUT'])
@jwt_required()
@admin_required
def update_application_status(application_id):
    data = request.get_json()
    
    if not data.get('status') or not data.get('currentStage'):
        return jsonify({"message": "Status and currentStage are required"}), 400
    
    updated = JobService.update_application_status(
        application_id, 
        data.get('status'),
        data.get('currentStage')
    )
    
    if not updated:
        return jsonify({"message": "Application not found"}), 404
    
    application = JobService.get_application_by_id(application_id)
    return jsonify(application), 200
