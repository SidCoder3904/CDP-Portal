# app/routes/reports.py
from flask import Blueprint, request, jsonify, send_file
from flask_jwt_extended import jwt_required
from app.services.report_service import ReportService
from app.utils.auth import admin_required
import os

reports_bp = Blueprint('reports', __name__)

@reports_bp.route('/types', methods=['GET'])
@jwt_required()
@admin_required
def get_report_types():
    report_types = ReportService.get_report_types()
    return jsonify(report_types), 200

@reports_bp.route('/generate', methods=['POST'])
@jwt_required()
@admin_required
def generate_report():
    data = request.get_json()
    
    if not data.get('type') or not data.get('filters'):
        return jsonify({"message": "Report type and filters are required"}), 400
    
    report_id = ReportService.generate_report(
        data.get('type'),
        data.get('filters')
    )
    
    report = ReportService.get_report_by_id(report_id)
    return jsonify(report), 201

@reports_bp.route('/download/<report_id>', methods=['GET'])
@jwt_required()
@admin_required
def download_report(report_id):
    format_type = request.args.get('format', 'excel')
    
    if format_type not in ['excel', 'pdf']:
        return jsonify({"message": "Invalid format type"}), 400
    
    file_path = ReportService.get_report_file(report_id, format_type)
    if not file_path:
        return jsonify({"message": "Report not found"}), 404
    
    return send_file(file_path, as_attachment=True)

# Report templates
@reports_bp.route('/templates', methods=['GET'])
@jwt_required()
@admin_required
def get_report_templates():
    templates = ReportService.get_report_templates()
    return jsonify(templates), 200

@reports_bp.route('/templates/<template_id>', methods=['GET'])
@jwt_required()
@admin_required
def get_report_template(template_id):
    template = ReportService.get_template_by_id(template_id)
    if not template:
        return jsonify({"message": "Template not found"}), 404
    
    return jsonify(template), 200

@reports_bp.route('/templates', methods=['POST'])
@jwt_required()
@admin_required
def create_report_template():
    data = request.get_json()
    
    if not data.get('name') or not data.get('columns'):
        return jsonify({"message": "Template name and columns are required"}), 400
    
    template_id = ReportService.create_template(data)
    template = ReportService.get_template_by_id(template_id)
    
    return jsonify(template), 201

@reports_bp.route('/templates/<template_id>', methods=['PUT'])
@jwt_required()
@admin_required
def update_report_template(template_id):
    data = request.get_json()
    
    updated = ReportService.update_template(template_id, data)
    if not updated:
        return jsonify({"message": "Template not found"}), 404
    
    template = ReportService.get_template_by_id(template_id)
    return jsonify(template), 200

@reports_bp.route('/templates/<template_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_report_template(template_id):
    deleted = ReportService.delete_template(template_id)
    if not deleted:
        return jsonify({"message": "Template not found"}), 404
    
    return jsonify({"message": "Template deleted successfully"}), 200
