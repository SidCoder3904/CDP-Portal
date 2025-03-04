from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.services.placement_service import PlacementService
from app.utils.auth import admin_required
from app.utils.validators import validate_placement_cycle, validate_job
from bson.json_util import dumps
import json

placement_cycles_bp = Blueprint('placement_cycles', __name__)

@placement_cycles_bp.route('', methods=['GET'])
@jwt_required()
def get_all_placement_cycles():
    """Get all placement cycles with optional filtering"""
    status = request.args.get('status')
    type_filter = request.args.get('type')
    year = request.args.get('year')
    
    # Parse filters into a dictionary
    filters = {}
    if status:
        filters['status'] = status
    if type_filter:
        filters['type'] = type_filter
    if year:
        filters['year'] = year
        
    cycles = PlacementService.get_all_placement_cycles(filters)
    return dumps(cycles), 200

@placement_cycles_bp.route('/<cycle_id>', methods=['GET'])
@jwt_required()
def get_placement_cycle(cycle_id):
    """Get details of a specific placement cycle"""
    cycle = PlacementService.get_placement_cycle_by_id(cycle_id)
    if not cycle:
        return jsonify({"message": "Placement cycle not found"}), 404
    
    return dumps(cycle), 200

@placement_cycles_bp.route('', methods=['POST'])
@jwt_required()
@admin_required
def create_placement_cycle():
    """Create a new placement cycle"""
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
@jwt_required()
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
@jwt_required()
@admin_required
def create_job(cycle_id):
    """Create a new job within a placement cycle"""
    data = request.get_json()
    
    # Validate input
    errors = validate_job(data)
    if errors:
        return jsonify({"errors": errors}), 400
    
    # Check if cycle exists
    cycle = PlacementService.get_placement_cycle_by_id(cycle_id)
    if not cycle:
        return jsonify({"message": "Placement cycle not found"}), 404
    
    job_id = PlacementService.create_job(cycle_id, data)
    job = PlacementService.get_job_by_id(job_id)
    
    return dumps(job), 201

@placement_cycles_bp.route('/<cycle_id>/statistics', methods=['GET'])
@jwt_required()
def get_cycle_statistics(cycle_id):
    """Get statistics for a placement cycle"""
    statistics = PlacementService.get_cycle
