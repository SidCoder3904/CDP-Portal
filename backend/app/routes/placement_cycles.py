from venv import logger
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.placement_service import PlacementService
from app.utils.auth import admin_required, student_required
from app.utils.validators import validate_placement_cycle, validate_job
from bson.json_util import dumps
import json
from app.services.student_service import StudentService
from app.services.email_service import EmailService


placement_cycles_bp = Blueprint('placement_cycles', __name__)

def format_placement_cycle(raw_cycle):
    """Format a raw placement cycle into the expected frontend format"""
    return {
        "id": str(raw_cycle.get("_id", "")),
        "name": raw_cycle.get("name", ""),
        "type": raw_cycle.get("type", ""),
        "startDate": raw_cycle.get("startDate", "").isoformat() if raw_cycle.get("startDate") else "",
        "endDate": raw_cycle.get("endDate", "").isoformat() if raw_cycle.get("endDate") else "",
        "status": raw_cycle.get("status", ""),
        "jobs": raw_cycle.get("jobs", 0),
        "students": raw_cycle.get("students", 0),
        "description": raw_cycle.get("description", ""),
        "batch": raw_cycle.get("batch", ""),
        "eligiblePrograms": raw_cycle.get("eligiblePrograms", []),
        "createdAt": raw_cycle.get("createdAt", "").isoformat() if raw_cycle.get("createdAt") else "",
        "updatedAt": raw_cycle.get("updatedAt", "").isoformat() if raw_cycle.get("updatedAt") else ""
    }

@placement_cycles_bp.route('/student', methods=['GET'])
@jwt_required()
@student_required
def get_student_cycle():
    """Get the active cycle for the current student"""
    current_user = get_jwt_identity()
    student_id = current_user.get('id')
    
    # Get student's eligible cycle
    cycle_id = StudentService.get_student_eligible_cycles(student_id)
    if not cycle_id:
        return jsonify({"message": "Placement cycle not found"}), 404
    
    # Get cycle details
    cycle = PlacementService.get_placement_cycle_by_id(cycle_id)
    if not cycle:
        return jsonify({"message": "Placement cycle not found"}), 404
    
    return jsonify(format_placement_cycle(cycle)), 200

@placement_cycles_bp.route('', methods=['GET'])
@jwt_required()
def get_all_placement_cycles():
    """Get all placement cycles with optional filtering"""
    status = request.args.get('status')
    type_filter = request.args.get('type')

    # Parse filters into a dictionary
    filters = {}
    if status:
        filters['status'] = status
    if type_filter:
        filters['type'] = type_filter
        
    cycles = PlacementService.get_all_placement_cycles(filters)
    formatted_cycles = [format_placement_cycle(cycle) for cycle in cycles]
    return dumps(formatted_cycles), 200

@placement_cycles_bp.route('/<cycle_id>', methods=['GET'])
# @jwt_required()
def get_placement_cycle(cycle_id):
    """Get details of a specific placement cycle"""
    cycle = PlacementService.get_placement_cycle_by_id(cycle_id)
    if not cycle:
        return jsonify({"message": "Placement cycle not found"}), 404
    
    return dumps(format_placement_cycle(cycle)), 200



@placement_cycles_bp.route('', methods=['POST'])
# @jwt_required()
# @admin_required
def create_placement_cycle():
    """Create a new placement cycle"""
    logger.info("Creating a new placement cycle")
    data = request.get_json()
    
    
    # Validate input
    errors = validate_placement_cycle(data)
    if errors:
        return jsonify({"errors": errors}), 400
    
    cycle_id = PlacementService.create_placement_cycle(data)
    cycle = PlacementService.get_placement_cycle_by_id(cycle_id)

    return dumps(cycle), 201

@placement_cycles_bp.route('/<cycle_id>', methods=['PUT'])
@jwt_required()
@admin_required
def update_placement_cycle(cycle_id):
    """Update an existing placement cycle"""
    data = request.get_json()
    
    # Validate input
    errors = validate_placement_cycle(data)
    if errors:
        return jsonify({"errors": errors}), 400
    
    updated = PlacementService.update_placement_cycle(cycle_id, data)
    if not updated:
        return jsonify({"message": "Placement cycle not found"}), 404
    
    cycle = PlacementService.get_placement_cycle_by_id(cycle_id)
    return dumps(cycle), 200

@placement_cycles_bp.route('/<cycle_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_placement_cycle(cycle_id):
    """Delete a placement cycle and its associated jobs"""
    deleted = PlacementService.delete_placement_cycle(cycle_id)
    if not deleted:
        return jsonify({"message": "Placement cycle not found"}), 404
    
    return jsonify({"message": "Placement cycle deleted successfully"}), 200

@placement_cycles_bp.route('/<cycle_id>/jobs', methods=['GET'])
# @jwt_required()
def get_cycle_jobs(cycle_id):
    """Get all jobs associated with a placement cycle"""
    status = request.args.get('status')
    company = request.args.get('company')
    
    filters = {'cycleId': cycle_id}
    if status:
        filters['status'] = status
    if company:
        filters['company'] = company
        
    jobs = PlacementService.get_jobs_by_filters(filters)
    return dumps(jobs), 200

@placement_cycles_bp.route('/<cycle_id>/jobs', methods=['POST'])
# @jwt_required()
# @admin_required
def create_job(cycle_id):
    """Create a new job within a placement cycle"""
    
    data = request.get_json()

    errors = validate_job(data)
    if errors:
        return jsonify({"errors": errors}), 400
    
    # Check if cycle exists
    cycle = PlacementService.get_placement_cycle_by_id(cycle_id)
    if not cycle:
        return jsonify({"message": "Placement cycle not found"}), 404
    
    # Add cycle reference to the job data
    data['cycle'] = cycle_id
    
    job_id = PlacementService.create_job(cycle_id,data)
    job = PlacementService.get_job_by_id(job_id)
    
    # Send email notification to all eligible students
    try:
        print("\n=== Sending Job Creation Email Notifications ===")
        EmailService.send_notice_notification(
            cycle_id=cycle_id,
            notice_type="add",
            notice_title=f"New Job Posted: {data['company']} - {data['role']}",
            notice_content=f"""
            A new job has been posted in your placement cycle:

            Company: {data['company']}
            Role: {data['role']}
            Package: {data['package']}
            Location: {data['location']}
            Deadline: {data['deadline']}

            Please check the portal for more details and to apply.
            """
        )
        print("✅ Email notifications sent successfully")
    except Exception as e:
        print(f"❌ Error sending email notifications: {str(e)}")
        print("Continuing without email notification")
    
    return dumps(job), 201

@placement_cycles_bp.route('/<cycle_id>/statistics', methods=['GET'])
@jwt_required()
def get_cycle_statistics(cycle_id):
    """Get statistics for a placement cycle"""
    statistics = PlacementService.get_cycle

@placement_cycles_bp.route('/<cycle_id>/students', methods=['GET'])
# @jwt_required()
def get_cycle_students(cycle_id):
    """Get all students eligible for a placement cycle based on batch and programs"""
    try:
        # Get cycle details first
        cycle = PlacementService.get_placement_cycle_by_id(cycle_id)
        if not cycle:
            return jsonify({"message": "Placement cycle not found"}), 404
        
        # Extract batch and eligible programs from cycle
        batch = cycle.get('batch')
        eligible_programs = cycle.get('eligiblePrograms', [])
        
        if not batch or not eligible_programs:
            return jsonify({"message": "Cycle is missing batch or eligible programs information"}), 400
        
        # Use the new service method to get eligible students
        students = StudentService.get_students_by_cycle(cycle_id, batch, eligible_programs)
        logger.info(f"Students in cycle {cycle_id}: {students}")
        
        return dumps(students), 200
    
    except Exception as e:
        print(f"Error in get_cycle_students: {str(e)}")
        return jsonify({"message": f"Error fetching students: {str(e)}"}), 500
