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

@jobs_bp.route('', methods=['GET'])
@jwt_required()
def get_all_jobs():
    """Get all available jobs with optional filtering"""
    current_user = get_jwt_identity()
    
    # Get query parameters for filtering
    query_text = request.args.get('query', '')
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 20))
    
    # Build filters based on query parameters
    filters = {}
    
    # Filter by job type if specified
    job_type = request.args.get('type')
    if job_type:
        filters['jobType'] = job_type
    
    # Filter by status if specified
    status = request.args.get('status')
    if status:
        filters['status'] = status
    
    # Get jobs with pagination
    jobs, total = JobService.search_jobs(query_text, filters, page, per_page)
    
    # For students, add application status to each job
    if current_user.get('role') == 'student':
        student_id = current_user.get('id')
        for job in jobs:
            # Check if student has applied
            job['hasApplied'] = JobService.has_student_applied(str(job['_id']), student_id)
            
            # Check if student is eligible
            job['isEligible'] = JobService.check_student_eligibility(str(job['_id']), student_id)
    
    # Convert ObjectId to string for JSON serialization
    from bson.json_util import dumps
    return dumps({
        'jobs': jobs,
        'total': total,
        'page': page,
        'per_page': per_page,
        'pages': (total + per_page - 1) // per_page
    }), 200

