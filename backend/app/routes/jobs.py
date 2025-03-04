# app/routes/placement_cycles.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.placement_service import PlacementService
from app.utils.auth import admin_required
from app.utils.validators import validate_placement_cycle

placement_cycles_bp = Blueprint('placement_cycles', __name__)

@placement_cycles_bp.route('', methods=['GET'])
@jwt_required()
def get_placement_cycles():
    cycles = PlacementService.get_all_placement_cycles()
    return jsonify(cycles), 200

@placement_cycles_bp.route('/<cycle_id>', methods=['GET'])
@jwt_required()
def get_placement_cycle(cycle_id):
    cycle = PlacementService.get_placement_cycle_by_id(cycle_id)
    if not cycle:
        return jsonify({"message": "Placement cycle not found"}), 404
    
    return jsonify(cycle), 200

@placement_cycles_bp.route('', methods=['POST'])
@jwt_required()
@admin_required
def create_placement_cycle():
    data = request.get_json()
    
    # Validate input
    errors = validate_placement_cycle(data)
    if errors:
        return jsonify({"errors": errors}), 400
    
    cycle_id = PlacementService.create_placement_cycle(data)
    cycle = PlacementService.get_placement_cycle_by_id(cycle_id)
    
    return jsonify(cycle), 201

@placement_cycles_bp.route('/<cycle_id>', methods=['PUT'])
@jwt_required()
@admin_required
def update_placement_cycle(cycle_id):
    data = request.get_json()
    
    # Validate input
    errors = validate_placement_cycle(data)
    if errors:
        return jsonify({"errors": errors}), 400
    
    updated = PlacementService.update_placement_cycle(cycle_id, data)
    if not updated:
        return jsonify({"message": "Placement cycle not found"}), 404
    
    cycle = PlacementService.get_placement_cycle_by_id(cycle_id)
    return jsonify(cycle), 200

@placement_cycles_bp.route('/<cycle_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_placement_cycle(cycle_id):
    deleted = PlacementService.delete_placement_cycle(cycle_id)
    if not deleted:
        return jsonify({"message": "Placement cycle not found"}), 404
    
    return jsonify({"message": "Placement cycle deleted successfully"}), 200

# Jobs within placement cycles
@placement_cycles_bp.route('/<cycle_id>/jobs', methods=['GET'])
@jwt_required()
def get_jobs_by_cycle(cycle_id):
    jobs = PlacementService.get_jobs_by_cycle(cycle_id)
    return jsonify(jobs), 200

@placement_cycles_bp.route('/<cycle_id>/jobs', methods=['POST'])
@jwt_required()
@admin_required
def create_job(cycle_id):
    data = request.get_json()
    
    # Validate input for job
    # Implementation of job validation left out for brevity
    
    job_id = PlacementService.create_job(cycle_id, data)
    job = PlacementService.get_job_by_id(job_id)
    
    return jsonify(job), 201
