# app/routes/jobs.py
from flask import Blueprint, current_app, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.job_service import JobService
from app.utils.auth import admin_required, student_required
from app.utils.validators import validate_job
from bson.objectid import ObjectId
from bson.json_util import dumps
from flask import Response

from app.services.student_service import StudentService

jobs_bp = Blueprint('jobs', __name__)


@jobs_bp.route('/<job_id>', methods=['GET'])
@jwt_required()
def get_job(job_id):
    job = JobService.get_job_by_id(job_id)
    if not job:
        return jsonify({"message": "Job not found"}), 404
    
    # Convert ObjectId fields to string
    job["_id"] = str(job["_id"]) if "_id" in job else None
    
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
    data = request.get_json() or {}
    

    # Get resume ID from request
    resume_id = data.get('resumeId')
    logger = current_app.logger
    logger.info(f"Resume ID: {resume_id}")

    if not resume_id:
        return jsonify({"message": "Resume ID is required"}), 400
    
    # Check if student is eligible
    eligible = JobService.check_student_eligibility(job_id, current_user['id'])
    if not eligible:
        return jsonify({"message": "You are not eligible for this job"}), 403
    
    # Check if student has already applied
    already_applied = JobService.has_student_applied(job_id, current_user['id'])
    if already_applied:
        return jsonify({"message": "You have already applied for this job"}), 400
    
    
    
    # Check if resume exists and belongs to the student
    # resume = mongo.db.documents.find_one({
    #     '_id': ObjectId(resume_id),
    #     'student_id': ObjectId(current_user['id']),
    #     'type': 'resume'
    # })

    # if not resume:
    #     return jsonify({"message": "Invalid resume selected"}), 400
    
    # Create application with resume ID
    application_data = {
        'resumeId': resume_id
    }
    
    application_id = JobService.create_application(job_id, current_user['id'], application_data)
    application = JobService.get_application_by_id(application_id)
    
    return Response(dumps(application), mimetype='application/json'), 201

@jobs_bp.route('/<job_id>/applications', methods=['GET'])
@jwt_required()
@admin_required
def get_job_applications(job_id):
    applications, total = JobService.get_applications_by_job(job_id)
    return dumps(applications), 200

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
    
    student_cycle = StudentService.get_student_eligible_cycles(current_user.get('id'))
    filters['cycleId'] = student_cycle

    # Get jobs with pagination
    jobs, total = JobService.search_jobs(query_text, filters, page, per_page)
    
    # For students, add application status to each job
    if current_user.get('role') == 'student':
        student_id = current_user.get('id')
        for job in jobs:
            job_id = job['_id']
            if isinstance(job_id, dict) and '$oid' in job_id:
                job_id = job_id['$oid']
                
            # Check if student has applied
            job['hasApplied'] = JobService.has_student_applied(job_id, student_id)
            
            # Check if student is eligible
            job['isEligible'] = JobService.check_student_eligibility(job_id, student_id)
    
    # Convert ObjectId to string for JSON serialization
    
    return dumps({
        'jobs': jobs,
        'total': total,
        'page': page,
        'per_page': per_page,
        'pages': (total + per_page - 1) // per_page
    }), 200

