# app/routes/reports.py
from flask import Blueprint, request, jsonify, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.report_service import ReportService
from app.utils.auth import admin_required
import os
import json
import traceback

reports_bp = Blueprint('reports', __name__)

@reports_bp.route('/types', methods=['GET'])
@jwt_required()
def get_report_types():
    """Get available report types"""
    try:
        report_types = ReportService.get_report_types()
        return jsonify(report_types), 200
    except Exception as e:
        return jsonify({"message": str(e), "error": True}), 500

@reports_bp.route('/generate', methods=['POST'])
@jwt_required()
def generate_report():
    """Generate a report based on specified type and filters"""
    try:
        data = request.get_json()
        
        if not data.get('type') or not data.get('filters'):
            return jsonify({"message": "Report type and filters are required"}), 400
        
        # Get the current user
        current_user = get_jwt_identity()
        
        # Pass only the parameters that ReportService.generate_report accepts
        report_id = ReportService.generate_report(
            data.get('type'),
            data.get('filters')
        )
        
        report = ReportService.get_report_by_id(report_id)
        
        if not report:
            return jsonify({"message": "Failed to generate report", "status": "error"}), 500
            
        return jsonify(report), 201
    except Exception as e:
        print(f"Error generating report: {str(e)}")
        print(traceback.format_exc())
        return jsonify({"message": str(e), "status": "error"}), 500

@reports_bp.route('/download/<report_id>', methods=['GET'])
@jwt_required()
def download_report(report_id):
    """Download a report in a specific format"""
    try:
        format_type = request.args.get('format', 'excel')
        
        if format_type not in ['excel', 'pdf', 'csv']:
            return jsonify({"message": "Invalid format type"}), 400
        
        file_path = ReportService.get_report_file(report_id, format_type)
        if not file_path:
            return jsonify({"message": "Report not found or could not be generated"}), 404
        
        # Get the filename from the report data if possible
        report = ReportService.get_report_by_id(report_id)
        filename = f"report_{report_id}"
        if report and 'type' in report:
            filename = f"{report['type']}_{report_id}"
            
        return send_file(file_path, as_attachment=True, 
                        download_name=f"{filename}.{format_type if format_type != 'excel' else 'xlsx'}")
    except Exception as e:
        print(f"Error downloading report: {str(e)}")
        print(traceback.format_exc())
        return jsonify({"message": str(e), "error": True}), 500

# Report templates
@reports_bp.route('/templates', methods=['GET'])
@jwt_required()
def get_report_templates():
    """Get all report templates"""
    try:
        templates = ReportService.get_report_templates()
        return jsonify(templates), 200
    except Exception as e:
        return jsonify({"message": str(e), "error": True}), 500

@reports_bp.route('/templates/<template_id>', methods=['GET'])
@jwt_required()
def get_report_template(template_id):
    """Get a specific report template by ID"""
    try:
        template = ReportService.get_template_by_id(template_id)
        if not template:
            return jsonify({"message": "Template not found"}), 404
        
        return jsonify(template), 200
    except Exception as e:
        return jsonify({"message": str(e), "error": True}), 500

@reports_bp.route('/templates', methods=['POST'])
@jwt_required()
def create_report_template():
    """Create a new report template"""
    try:
        data = request.get_json()
        
        if not data.get('name') or not data.get('columns'):
            return jsonify({"message": "Template name and columns are required"}), 400
        
        # Add current user as creator
        current_user = get_jwt_identity()
        data['createdBy'] = current_user
        
        template_id = ReportService.create_template(data)
        template = ReportService.get_template_by_id(template_id)
        
        return jsonify(template), 201
    except Exception as e:
        return jsonify({"message": str(e), "error": True}), 500

@reports_bp.route('/templates/<template_id>', methods=['PUT'])
@jwt_required()
def update_report_template(template_id):
    """Update an existing report template"""
    try:
        data = request.get_json()
        
        updated = ReportService.update_template(template_id, data)
        if not updated:
            return jsonify({"message": "Template not found"}), 404
        
        template = ReportService.get_template_by_id(template_id)
        return jsonify(template), 200
    except Exception as e:
        return jsonify({"message": str(e), "error": True}), 500

@reports_bp.route('/templates/<template_id>', methods=['DELETE'])
@jwt_required()
def delete_report_template(template_id):
    """Delete a report template"""
    try:
        deleted = ReportService.delete_template(template_id)
        if not deleted:
            return jsonify({"message": "Template not found"}), 404
        
        return jsonify({"message": "Template deleted successfully"}), 200
    except Exception as e:
        return jsonify({"message": str(e), "error": True}), 500
