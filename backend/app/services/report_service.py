from app.services.database import mongo, to_object_id, serialize_id
from bson.objectid import ObjectId
from datetime import datetime
# import pandas as pd
import os
import uuid
from flask import current_app
import json

class ReportService:
    @staticmethod
    def get_report_types():
        """
        Get available report types.
        
        Returns:
            List of report type objects
        """
        return [
            {
                "id": "placement_summary",
                "name": "Placement Summary",
                "description": "Summary of placements for a specific cycle"
            },
            {
                "id": "student_placement_status",
                "name": "Student Placement Status",
                "description": "Detailed status of each student's placement"
            },
            {
                "id": "company_wise_recruitment",
                "name": "Company-wise Recruitment",
                "description": "Breakdown of recruitment by company"
            },
            {
                "id": "branch_wise_statistics",
                "name": "Branch-wise Statistics",
                "description": "Placement statistics by branch"
            },
            {
                "id": "ctc_analysis",
                "name": "CTC Analysis",
                "description": "Analysis of salary packages offered"
            }
        ]
    
    @staticmethod
    def generate_report(report_type, filters):
        """
        Generate a report based on type and filters.
        
        Args:
            report_type: Type of report to generate
            filters: Dictionary of filter criteria
            
        Returns:
            The ID of the generated report
        """
        # Create report record
        report = {
            'type': report_type,
            'filters': filters,
            'status': 'processing',
            'createdAt': datetime.utcnow(),
            'updatedAt': datetime.utcnow()
        }
        
        result = mongo.db.reports.insert_one(report)
        report_id = str(result.inserted_id)
        
        try:
            # Generate report data based on type
            if report_type == 'placement_summary':
                data = ReportService._generate_placement_summary(filters)
            elif report_type == 'student_placement_status':
                data = ReportService._generate_student_placement_status(filters)
            elif report_type == 'company_wise_recruitment':
                data = ReportService._generate_company_wise_recruitment(filters)
            elif report_type == 'branch_wise_statistics':
                data = ReportService._generate_branch_wise_statistics(filters)
            elif report_type == 'ctc_analysis':
                data = ReportService._generate_ctc_analysis(filters)
            else:
                # Update report status to error
                mongo.db.reports.update_one(
                    {'_id': to_object_id(report_id)},
                    {'$set': {'status': 'error', 'errorMessage': 'Invalid report type', 'updatedAt': datetime.utcnow()}}
                )
                return report_id
            
            # Save report data
            reports_dir = os.path.join(current_app.config.get('UPLOAD_FOLDER', 'uploads'), 'reports')
            os.makedirs(reports_dir, exist_ok=True)
            report_data_path = os.path.join(reports_dir, f"{report_id}.json")
            
            with open(report_data_path, 'w') as f:
                json.dump(data, f)
            
            # Update report status to completed
            mongo.db.reports.update_one(
                {'_id': to_object_id(report_id)},
                {'$set': {
                    'status': 'completed',
                    'dataPath': report_data_path,
                    'updatedAt': datetime.utcnow()
                }}
            )
            
            return report_id
            
        except Exception as e:
            # Update report status to error
            mongo.db.reports.update_one(
                {'_id': to_object_id(report_id)},
                {'$set': {
                    'status': 'error',
                    'errorMessage': str(e),
                    'updatedAt': datetime.utcnow()
                }}
            )
            print(f"Error generating report: {str(e)}")
            return report_id
    
    @staticmethod
    def get_report_by_id(report_id):
        """
        Get a report by ID.
        
        Args:
            report_id: The ID of the report
            
        Returns:
            The report document or None if not found
        """
        try:
            report = mongo.db.reports.find_one({'_id': to_object_id(report_id)})
            
            if report and report.get('status') == 'completed' and report.get('dataPath'):
                # Load report data
                with open(report['dataPath'], 'r') as f:
                    report['data'] = json.load(f)
            
            return serialize_id(report) if report else None
        except Exception as e:
            print(f"Error retrieving report: {str(e)}")
            return None
    
    @staticmethod
    def get_report_file(report_id, format_type='excel'):
        """
        Get a report file in the specified format.
        
        Args:
            report_id: The ID of the report
            format_type: The format to generate ('excel' or 'pdf')
            
        Returns:
            The path to the generated file or None if report not found
        """
        try:
            # Get report document
            report = mongo.db.reports.find_one({'_id': to_object_id(report_id)})
            if not report or report.get('status') != 'completed' or not report.get('dataPath'):
                return None
            
            # Load report data
            with open(report['dataPath'], 'r') as f:
                data = json.load(f)
            
            # Convert data to DataFrame
            df = []
            
            # Generate file path
            exports_dir = os.path.join(current_app.config.get('UPLOAD_FOLDER', 'uploads'), 'reports', 'exports')
            os.makedirs(exports_dir, exist_ok=True)
            
            if format_type == 'excel':
                file_path = os.path.join(exports_dir, f"{report_id}.xlsx")
                df.to_excel(file_path, index=False)
                return file_path
            elif format_type == 'pdf':
                # For PDF generation, we'd typically use a library like reportlab
                # or export to HTML and use wkhtmltopdf, but for simplicity:
                file_path = os.path.join(exports_dir, f"{report_id}.csv")
                df.to_csv(file_path, index=False)
                return file_path
            else:
                return None
        except Exception as e:
            print(f"Error generating report file: {str(e)}")
            return None
    
    @staticmethod
    def get_report_templates():
        """
        Get all report templates.
        
        Returns:
            List of report template documents
        """
        templates = list(mongo.db.report_templates.find())
        return [serialize_id(template) for template in templates]
    
    @staticmethod
    def get_template_by_id(template_id):
        """
        Get a report template by ID.
        
        Args:
            template_id: The ID of the template
            
        Returns:
            The template document or None if not found
        """
        try:
            template = mongo.db.report_templates.find_one({'_id': to_object_id(template_id)})
            return serialize_id(template) if template else None
        except Exception:
            return None
    
    @staticmethod
    def create_template(data):
        """
        Create a new report template.
        
        Args:
            data: Dictionary containing template data
            
        Returns:
            The ID of the newly created template
        """
        template = {
            'name': data['name'],
            'description': data.get('description', ''),
            'columns': data['columns'],
            'createdAt': datetime.utcnow(),
            'updatedAt': datetime.utcnow()
        }
        
        if 'createdBy' in data:
            template['createdBy'] = data['createdBy']
        
        result = mongo.db.report_templates.insert_one(template)
        return str(result.inserted_id)
    
    @staticmethod
    def update_template(template_id, data):
        """
        Update a report template.
        
        Args:
            template_id: The ID of the template to update
            data: Dictionary containing updated template data
            
        Returns:
            True if update was successful, False otherwise
        """
        try:
            update_data = {
                'name': data['name'],
                'description': data.get('description', ''),
                'columns': data['columns'],
                'updatedAt': datetime.utcnow()
            }
            
            result = mongo.db.report_templates.update_one(
                {'_id': to_object_id(template_id)},
                {'$set': update_data}
            )
            return result.modified_count > 0
        except Exception as e:
            print(f"Error updating template: {str(e)}")
            return False
