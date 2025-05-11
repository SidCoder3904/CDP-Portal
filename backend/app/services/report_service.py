from app.services.database import to_object_id, serialize_id
from app import mongo
from bson.objectid import ObjectId
from datetime import datetime
import pandas as pd
import os
import uuid
from flask import current_app
import json
import logging

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
            },
            {
                "id": "job_applicants",
                "name": "Job Applicants",
                "description": "List of applicants for a specific job with resume links"
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
            elif report_type == 'job_applicants':
                data = ReportService._generate_job_applicants(filters)
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
            df = pd.DataFrame(data)
            
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
    
    @staticmethod
    def delete_template(template_id):
        """
        Delete a report template.
        
        Args:
            template_id: The ID of the template to delete
            
        Returns:
            True if deletion was successful, False otherwise
        """
        try:
            result = mongo.db.report_templates.delete_one({'_id': to_object_id(template_id)})
            return result.deleted_count > 0
        except Exception as e:
            print(f"Error deleting template: {str(e)}")
            return False
            
    @staticmethod
    def _generate_placement_summary(filters):
        """
        Generate a placement summary report.
        
        Args:
            filters: Dictionary containing filter criteria
            
        Returns:
            List of report data items
        """
        try:
            cycle_id = filters.get('cycleId')
            if not cycle_id:
                return []
            
            # Get all jobs from the cycle
            job_query = {'cycleId': cycle_id}
            
            # Apply additional filters
            if 'status' in filters and filters['status']:
                job_query['status'] = filters['status']
                
            jobs = list(mongo.db.jobs.find(job_query))
            job_ids = [str(job['_id']) for job in jobs]
            
            # Get all applications for these jobs
            applications = []
            if job_ids:
                # Try multiple field names for jobId in applications collection
                for field_name in ['jobId', 'job_id', 'job']:
                    app_query = {field_name: {'$in': job_ids}}
                    applications = list(mongo.db.applications.find(app_query))
                    if applications:
                        print(f"Found applications using field '{field_name}'")
                        break
            
            # Get unique student IDs from applications
            student_ids = []
            for app in applications:
                # Try multiple field names for studentId
                for field_name in ['studentId', 'student_id', 'student', 'userId', 'user_id']:
                    if field_name in app:
                        student_ids.append(app[field_name])
                        break

            student_ids = list(set(str(sid) for sid in student_ids if sid))
            
            # Get student details
            students = {}
            if student_ids:
                for student_id in student_ids:
                    try:
                        # Try different ways to look up students
                        student = None
                        for collection_name in ['students', 'student']:
                            collection = getattr(mongo.db, collection_name, None)
                            if not collection:
                                continue
                                
                            # Try with ObjectId
                            try:
                                student = collection.find_one({'_id': to_object_id(student_id)})
                                if student:
                                    break
                            except:
                                pass
                                
                            # Try with string ID in various fields
                            for id_field in ['_id', 'id', 'studentId', 'student_id', 'userId', 'user_id']:
                                try:
                                    student = collection.find_one({id_field: student_id})
                                    if student:
                                        break
                                except:
                                    pass
                                    
                        if student:
                            students[student_id] = student
                    except Exception as e:
                        print(f"Error finding student {student_id}: {e}")
            
            # Create summary data
            summary_data = []
            
            for app in applications:
                # Extract job_id and student_id from app using various field names
                job_id = None
                for job_field in ['jobId', 'job_id', 'job']:
                    if job_field in app:
                        job_id = str(app[job_field])
                        break
                        
                student_id = None
                for student_field in ['studentId', 'student_id', 'student', 'userId', 'user_id']:
                    if student_field in app:
                        student_id = str(app[student_field])
                        break
                
                if not job_id or not student_id:
                    continue
                    
                # Find corresponding job and student
                job = next((j for j in jobs if str(j['_id']) == job_id), None)
                student = students.get(student_id)
                
                if job and student:
                    # Extract student fields with fallbacks
                    student_major = None
                    for field in ['major', 'branch', 'department']:
                        if field in student and student[field]:
                            student_major = student[field]
                            break
                    
                    # Apply branch filter if specified
                    if 'branches' in filters and filters['branches'] and student_major not in filters['branches']:
                        continue
                        
                    # Apply company filter if specified
                    if 'companies' in filters and filters['companies'] and job.get('company') not in filters['companies']:
                        continue
                        
                    # Apply package range filter if specified
                    package_value = job.get('package', '0')
                    if isinstance(package_value, str):
                        package = float(package_value.replace('LPA', '').strip())
                    else:
                        package = float(package_value)
                        
                    if 'minPackage' in filters and filters['minPackage'] and package < float(filters['minPackage']):
                        continue
                    if 'maxPackage' in filters and filters['maxPackage'] and package > float(filters['maxPackage']):
                        continue
                    
                    # Get application status with fallbacks
                    app_status = None
                    for status_field in ['status', 'applicationStatus', 'app_status']:
                        if status_field in app and app[status_field]:
                            app_status = app[status_field]
                            break
                    
                    # Get current stage with fallbacks
                    current_stage = None
                    for stage_field in ['currentStage', 'current_stage', 'stage']:
                        if stage_field in app and app[stage_field]:
                            current_stage = app[stage_field]
                            break
                    
                    # Get created date with fallbacks
                    created_date = ''
                    for date_field in ['createdAt', 'created_at', 'dateCreated', 'date_created', 'appliedDate']:
                        if date_field in app:
                            date_value = app[date_field]
                            if isinstance(date_value, datetime):
                                created_date = date_value.strftime('%Y-%m-%d')
                                break
                            elif isinstance(date_value, str):
                                created_date = date_value
                                break
                    
                    # Get student ID with fallbacks
                    display_student_id = student.get('studentId') or student.get('student_id') or student.get('roll_number') or student_id
                    
                    summary_data.append({
                        'studentId': display_student_id,
                        'studentName': student.get('name', ''),
                        'email': student.get('email', ''),
                        'major': student_major or 'Unknown',
                        'company': job.get('company', ''),
                        'role': job.get('role', ''),
                        'package': job.get('package', ''),
                        'location': job.get('location', ''),
                        'status': app_status or 'Unknown',
                        'currentStage': current_stage or 'Unknown',
                        'appliedDate': created_date
                    })
            
            return summary_data
            
        except Exception as e:
            print(f"Error generating placement summary: {str(e)}")
            import traceback
            print(traceback.format_exc())
            return []
    
    @staticmethod
    def _generate_student_placement_status(filters):
        """
        Generate a student placement status report.
        
        Args:
            filters: Dictionary containing filter criteria
            
        Returns:
            List of report data items
        """
        try:
            cycle_id = filters.get('cycleId')
            if not cycle_id:
                return []
            
            # Get all students
            student_query = {}
            
            # Try to identify which collection and fields to use for students
            student_collections_to_try = ['students', 'student']
            branch_fields_to_try = ['major', 'branch', 'department']
            
            # Find the correct collection and branch field
            students = []
            collection_name = None
            branch_field = None
            
            for coll_name in student_collections_to_try:
                collection = getattr(mongo.db, coll_name, None)
                if not collection:
                    continue
                    
                # Check which branch field is available
                for field in branch_fields_to_try:
                    # Try to find one document with this field
                    sample = collection.find_one({field: {"$exists": True}})
                    if sample:
                        collection_name = coll_name
                        branch_field = field
                        break
                        
                if collection_name and branch_field:
                    break
                
            if not collection_name or not branch_field:
                print(f"Could not determine student collection or branch field")
                return []
            
            print(f"Using collection '{collection_name}' with branch field '{branch_field}'")
            collection = getattr(mongo.db, collection_name)
            
            # Apply branch filter if specified
            if 'branches' in filters and filters['branches']:
                student_query[branch_field] = {'$in': filters['branches']}
                
            students = list(collection.find(student_query))
            student_ids = [str(student['_id']) for student in students]
            
            # Get all jobs from the cycle
            job_query = {'cycleId': cycle_id}
            
            # Apply company filter if specified
            if 'companies' in filters and filters['companies']:
                job_query['company'] = {'$in': filters['companies']}
                
            # Apply package range filter if specified
            if 'minPackage' in filters and filters['minPackage']:
                try:
                    min_package = float(filters['minPackage'])
                    job_query['$where'] = f"function() {{ return parseFloat(this.package.replace('LPA', '').trim()) >= {min_package}; }}"
                except:
                    pass
                
            if 'maxPackage' in filters and filters['maxPackage']:
                try:
                    max_package = float(filters['maxPackage'])
                    if '$where' in job_query:
                        job_query['$where'] = f"function() {{ return parseFloat(this.package.replace('LPA', '').trim()) >= {min_package} && parseFloat(this.package.replace('LPA', '').trim()) <= {max_package}; }}"
                    else:
                        job_query['$where'] = f"function() {{ return parseFloat(this.package.replace('LPA', '').trim()) <= {max_package}; }}"
                except:
                    pass
            
            jobs = list(mongo.db.jobs.find(job_query))
            job_ids = [str(job['_id']) for job in jobs]
            
            # Get all applications
            applications = []
            
            # Try different field names for applications
            job_field_name = None
            student_field_name = None
            
            if job_ids and student_ids:
                # First, find which field names are used in the applications collection
                for job_field in ['jobId', 'job_id', 'job']:
                    for student_field in ['studentId', 'student_id', 'student', 'userId', 'user_id']:
                        # Test query with these field names
                        test_query = {
                            job_field: {'$in': job_ids[:1]},
                            student_field: {'$in': student_ids[:1]}
                        }
                        
                        test_results = list(mongo.db.applications.find(test_query, {'_id': 1}).limit(1))
                        if test_results:
                            job_field_name = job_field
                            student_field_name = student_field
                            print(f"Found applications using fields '{job_field}' and '{student_field}'")
                            break
                            
                    if job_field_name and student_field_name:
                        break
                
                if job_field_name and student_field_name:
                    # Now build the full query
                    app_query = {
                        job_field_name: {'$in': job_ids},
                        student_field_name: {'$in': student_ids}
                    }
                    
                    # Apply status filter if specified
                    if 'status' in filters and filters['status']:
                        app_query['status'] = {'$in': filters['status']}
                        
                    applications = list(mongo.db.applications.find(app_query))
                    print(f"Found {len(applications)} applications")
                else:
                    print("Could not determine application field names")
            
            # Create status data
            status_data = []
            
            # Map for quick lookups
            student_map = {str(student['_id']): student for student in students}
            job_map = {str(job['_id']): job for job in jobs}
            
            # Group applications by student
            student_applications = {}
            for app in applications:
                student_id = None
                # Extract student ID using the field name we found
                if student_field_name:
                    student_id = str(app.get(student_field_name))
                else:
                    # Try multiple fields if not found earlier
                    for field in ['studentId', 'student_id', 'student', 'userId', 'user_id']:
                        if field in app:
                            student_id = str(app[field])
                            break
                            
                if student_id not in student_applications:
                    student_applications[student_id] = []
                    
                student_applications[student_id].append(app)
            
            # Generate report data
            for student_id, apps in student_applications.items():
                student = student_map.get(student_id)
                if not student:
                    continue
                
                # Count application statuses
                total_apps = len(apps)
                pending_apps = 0
                rejected_apps = 0
                selected_apps = 0
                
                for app in apps:
                    status = app.get('status', '').lower()
                    if status in ['applied', 'pending', 'shortlisted', 'in process', 'in progress']:
                        pending_apps += 1
                    elif status in ['rejected', 'not selected']:
                        rejected_apps += 1
                    elif status in ['selected', 'offered', 'placed', 'accepted']:
                        selected_apps += 1
                
                # Get best offer if any
                best_offer = None
                highest_package = 0
                
                for app in apps:
                    if app.get('status', '').lower() in ['selected', 'offered', 'placed', 'accepted']:
                        job_id = None
                        # Extract job ID using field name we found earlier
                        if job_field_name:
                            job_id = str(app.get(job_field_name))
                        else:
                            # Try multiple fields if not found earlier
                            for field in ['jobId', 'job_id', 'job']:
                                if field in app:
                                    job_id = str(app[field])
                                    break
                                    
                        if job_id and job_id in job_map:
                            job = job_map[job_id]
                            try:
                                package_str = job.get('package', '0')
                                if isinstance(package_str, str):
                                    package = float(package_str.replace('LPA', '').strip())
                                else:
                                    package = float(package_str)
                                    
                                if package > highest_package:
                                    highest_package = package
                                    best_offer = job
                            except Exception as e:
                                print(f"Error parsing package: {e}")
                
                placement_status = 'Unplaced'
                if selected_apps > 0:
                    placement_status = 'Placed'
                elif total_apps == 0:
                    placement_status = 'Not Applied'
                elif pending_apps > 0:
                    placement_status = 'In Process'
                
                # Skip records based on status filter
                if 'status' in filters and filters['status'] and placement_status not in filters['status']:
                    continue
                
                # Get student's major/branch
                student_major = None
                for field in branch_fields_to_try:
                    if field in student and student[field]:
                        student_major = student[field]
                        break
                
                # Get student ID and other fields with fallbacks
                display_student_id = student.get('studentId') or student.get('student_id') or student.get('roll_number') or student_id
                
                status_data.append({
                    'studentId': display_student_id,
                    'studentName': student.get('name', ''),
                    'email': student.get('email', ''),
                    'major': student_major or 'Unknown',
                    'gender': student.get('gender', ''),
                    'totalApplications': total_apps,
                    'pendingApplications': pending_apps,
                    'rejectedApplications': rejected_apps,
                    'selectedApplications': selected_apps,
                    'placementStatus': placement_status,
                    'bestOfferCompany': best_offer.get('company', '') if best_offer else '',
                    'bestOfferRole': best_offer.get('role', '') if best_offer else '',
                    'bestOfferPackage': best_offer.get('package', '') if best_offer else ''
                })
            
            return status_data
            
        except Exception as e:
            print(f"Error generating student placement status: {str(e)}")
            import traceback
            print(traceback.format_exc())
            return []
    
    @staticmethod
    def _generate_company_wise_recruitment(filters):
        """
        Generate a company-wise recruitment report.
        
        Args:
            filters: Dictionary containing filter criteria
            
        Returns:
            List of report data items
        """
        try:
            cycle_id = filters.get('cycleId')
            if not cycle_id:
                return []
            
            # Get all jobs from the cycle
            job_query = {'cycleId': cycle_id}
            
            # Apply company filter if specified
            if 'companies' in filters and filters['companies']:
                job_query['company'] = {'$in': filters['companies']}
                
            jobs = list(mongo.db.jobs.find(job_query))
            job_ids = [str(job['_id']) for job in jobs]
            
            # Get all applications for these jobs
            applications = []
            if job_ids:
                applications = list(mongo.db.applications.find({'jobId': {'$in': job_ids}}))
            
            # Group by company
            company_data = {}
            
            for job in jobs:
                company = job.get('company')
                if company not in company_data:
                    company_data[company] = {
                        'company': company,
                        'jobsPosted': 0,
                        'totalApplications': 0,
                        'selected': 0,
                        'rejected': 0,
                        'inProcess': 0,
                        'roles': set(),
                        'highestPackage': 0,
                        'lowestPackage': float('inf'),
                        'totalPackage': 0,
                        'packageCount': 0
                    }
                
                company_data[company]['jobsPosted'] += 1
                company_data[company]['roles'].add(job.get('role', ''))
                
                # Process package information
                try:
                    package = float(job.get('package', '0').replace('LPA', '').strip())
                    if package > 0:
                        company_data[company]['highestPackage'] = max(company_data[company]['highestPackage'], package)
                        company_data[company]['lowestPackage'] = min(company_data[company]['lowestPackage'], package)
                        company_data[company]['totalPackage'] += package
                        company_data[company]['packageCount'] += 1
                except:
                    pass
            
            # Process applications
            for app in applications:
                job_id = app.get('jobId')
                job = next((j for j in jobs if str(j['_id']) == job_id), None)
                
                if job:
                    company = job.get('company')
                    if company in company_data:
                        company_data[company]['totalApplications'] += 1
                        
                        status = app.get('status', '')
                        if status == 'selected':
                            company_data[company]['selected'] += 1
                        elif status == 'rejected':
                            company_data[company]['rejected'] += 1
                        else:
                            company_data[company]['inProcess'] += 1
            
            # Format final data
            report_data = []
            for company, data in company_data.items():
                # Calculate average package
                avg_package = 0
                if data['packageCount'] > 0:
                    avg_package = data['totalPackage'] / data['packageCount']
                
                # Handle case where no packages were found
                if data['lowestPackage'] == float('inf'):
                    data['lowestPackage'] = 0
                
                report_data.append({
                    'company': company,
                    'jobsPosted': data['jobsPosted'],
                    'rolesOffered': ', '.join(data['roles']),
                    'totalApplications': data['totalApplications'],
                    'selectedCandidates': data['selected'],
                    'rejectedCandidates': data['rejected'],
                    'inProcessCandidates': data['inProcess'],
                    'highestPackage': f"{data['highestPackage']} LPA",
                    'lowestPackage': f"{data['lowestPackage']} LPA",
                    'averagePackage': f"{avg_package:.2f} LPA",
                    'selectionRate': f"{(data['selected'] / data['totalApplications'] * 100):.2f}%" if data['totalApplications'] > 0 else "0%"
                })
            
            # Sort by selected candidates count (descending)
            report_data.sort(key=lambda x: x['selectedCandidates'], reverse=True)
            return report_data
            
        except Exception as e:
            print(f"Error generating company-wise recruitment: {str(e)}")
            return []
    
    @staticmethod
    def _generate_branch_wise_statistics(filters):
        """
        Generate a branch-wise statistics report.
        
        Args:
            filters: Dictionary containing filter criteria
            
        Returns:
            List of report data items
        """
        try:
            cycle_id = filters.get('cycleId')
            if not cycle_id:
                return []
            
            # Get all jobs from the cycle
            job_query = {'cycleId': cycle_id}
            
            # Apply company filter if specified
            if 'companies' in filters and filters['companies']:
                job_query['company'] = {'$in': filters['companies']}
                
            jobs = list(mongo.db.jobs.find(job_query))
            job_ids = [str(job['_id']) for job in jobs]
            
            # Get all applications for these jobs
            applications = []
            if job_ids:
                # Try multiple field names for jobId in applications collection
                for field_name in ['jobId', 'job_id', 'job']:
                    app_query = {field_name: {'$in': job_ids}}
                    applications = list(mongo.db.applications.find(app_query))
                    if applications:
                        print(f"Found {len(applications)} applications using field '{field_name}'")
                        break
            
            # Get student IDs from applications
            student_ids = []
            for app in applications:
                # Try multiple field names for studentId
                for field_name in ['studentId', 'student_id', 'student', 'userId', 'user_id']:
                    if field_name in app:
                        student_ids.append(str(app[field_name]))
                        break
            
            # Identify student collection and branch field
            student_collections_to_try = ['students', 'student']
            branch_fields_to_try = ['major', 'branch', 'department']
            
            collection_name = None
            branch_field = None
            
            for coll_name in student_collections_to_try:
                collection = getattr(mongo.db, coll_name, None)
                if not collection:
                    continue
                    
                # Check which branch field is available
                for field in branch_fields_to_try:
                    # Try to find one document with this field
                    sample = collection.find_one({field: {"$exists": True}})
                    if sample:
                        collection_name = coll_name
                        branch_field = field
                        break
                        
                if collection_name and branch_field:
                    break
                
            if not collection_name or not branch_field:
                print(f"Could not determine student collection or branch field")
                return []
            
            print(f"Using collection '{collection_name}' with branch field '{branch_field}'")
            collection = getattr(mongo.db, collection_name)
            
            # Get student details
            students = {}
            for student_id in student_ids:
                try:
                    # Try with ObjectId
                    try:
                        student = collection.find_one({'_id': to_object_id(student_id)})
                        if student:
                            students[student_id] = student
                            continue
                    except:
                        pass
                        
                    # Try with string ID in various fields
                    for id_field in ['_id', 'id', 'studentId', 'student_id', 'userId', 'user_id']:
                        try:
                            student = collection.find_one({id_field: student_id})
                            if student:
                                students[student_id] = student
                                break
                        except:
                            pass
                except Exception as e:
                    print(f"Error finding student {student_id}: {e}")
            
            # Group by branch
            branch_data = {}
            
            for app in applications:
                # Extract fields from application
                student_id = None
                for student_field in ['studentId', 'student_id', 'student', 'userId', 'user_id']:
                    if student_field in app:
                        student_id = str(app[student_field])
                        break
                    
                job_id = None
                for job_field in ['jobId', 'job_id', 'job']:
                    if job_field in app:
                        job_id = str(app[job_field])
                        break
                
                if not student_id or not job_id:
                    continue
                    
                student = students.get(student_id)
                
                if not student:
                    continue
                
                # Determine branch
                branch = 'Unknown'
                for field in branch_fields_to_try:
                    if field in student and student[field]:
                        branch = student[field]
                        break
                
                # Apply branch filter if specified
                if 'branches' in filters and filters['branches'] and branch not in filters['branches']:
                    continue
                
                if branch not in branch_data:
                    branch_data[branch] = {
                        'branch': branch,
                        'totalStudents': 0,
                        'studentsApplied': set(),
                        'studentsSelected': set(),
                        'totalApplications': 0,
                        'selectedApplications': 0,
                        'highestPackage': 0,
                        'totalPackage': 0,
                        'packageCount': 0
                    }
                
                job = next((j for j in jobs if str(j['_id']) == job_id), None)
                
                if not job:
                    continue
                
                # Process application data
                branch_data[branch]['totalApplications'] += 1
                branch_data[branch]['studentsApplied'].add(student_id)
                
                # Check application status (support multiple status formats)
                status = app.get('status', '').lower()
                if status in ['selected', 'offered', 'placed', 'accepted']:
                    branch_data[branch]['selectedApplications'] += 1
                    branch_data[branch]['studentsSelected'].add(student_id)
                    
                    # Process package information
                    try:
                        package_str = job.get('package', '0')
                        if isinstance(package_str, str):
                            package = float(package_str.replace('LPA', '').strip())
                        else:
                            package = float(package_str)
                            
                        if package > 0:
                            branch_data[branch]['highestPackage'] = max(branch_data[branch]['highestPackage'], package)
                            branch_data[branch]['totalPackage'] += package
                            branch_data[branch]['packageCount'] += 1
                    except Exception as e:
                        print(f"Error parsing package: {e}")
            
            # Get total students by branch from the database
            branch_counts = {}
            try:
                for branch in branch_data.keys():
                    count = collection.count_documents({branch_field: branch})
                    branch_counts[branch] = count
            except Exception as e:
                print(f"Error counting students by branch: {str(e)}")
            
            # Format final data
            report_data = []
            for branch, data in branch_data.items():
                # Get total student count for this branch
                data['totalStudents'] = branch_counts.get(branch, 0)
                
                # Calculate average package
                avg_package = 0
                if data['packageCount'] > 0:
                    avg_package = data['totalPackage'] / data['packageCount']
                
                report_data.append({
                    'branch': branch,
                    'totalStudents': data['totalStudents'],
                    'studentsApplied': len(data['studentsApplied']),
                    'studentsPlaced': len(data['studentsSelected']),
                    'totalApplications': data['totalApplications'],
                    'successfulApplications': data['selectedApplications'],
                    'highestPackage': f"{data['highestPackage']} LPA",
                    'averagePackage': f"{avg_package:.2f} LPA",
                    'placementPercentage': f"{(len(data['studentsSelected']) / data['totalStudents'] * 100):.2f}%" if data['totalStudents'] > 0 else "0%",
                    'applicationSuccessRate': f"{(data['selectedApplications'] / data['totalApplications'] * 100):.2f}%" if data['totalApplications'] > 0 else "0%"
                })
            
            # Sort by placement percentage (descending)
            report_data.sort(key=lambda x: float(x['placementPercentage'].replace('%', '')) if '%' in x['placementPercentage'] else 0, reverse=True)
            return report_data
            
        except Exception as e:
            print(f"Error generating branch-wise statistics: {str(e)}")
            import traceback
            print(traceback.format_exc())
            return []
    
    @staticmethod
    def _generate_ctc_analysis(filters):
        """
        Generate a CTC (package) analysis report.
        
        Args:
            filters: Dictionary containing filter criteria
            
        Returns:
            List of report data items
        """
        try:
            cycle_id = filters.get('cycleId')
            if not cycle_id:
                return []
            
            # Get all jobs from the cycle
            job_query = {'cycleId': cycle_id}
            
            # Apply company filter if specified
            if 'companies' in filters and filters['companies']:
                job_query['company'] = {'$in': filters['companies']}
                
            # Apply package range filter
            # We'll handle package filtering in memory since we need to parse strings
            
            jobs = list(mongo.db.jobs.find(job_query))
            
            # Filter jobs based on package if specified
            filtered_jobs = []
            min_package = None
            max_package = None
            
            if 'minPackage' in filters and filters['minPackage']:
                try:
                    min_package = float(filters['minPackage'])
                except:
                    pass
                    
            if 'maxPackage' in filters and filters['maxPackage']:
                try:
                    max_package = float(filters['maxPackage'])
                except:
                    pass
            
            for job in jobs:
                try:
                    package_str = job.get('package', '0')
                    if isinstance(package_str, str):
                        package = float(package_str.replace('LPA', '').strip())
                    else:
                        package = float(package_str)
                        
                    # Apply package filters
                    if min_package is not None and package < min_package:
                        continue
                    if max_package is not None and package > max_package:
                        continue
                        
                    filtered_jobs.append(job)
                except:
                    # If we can't parse the package, include the job anyway
                    filtered_jobs.append(job)
            
            jobs = filtered_jobs
            job_ids = [str(job['_id']) for job in jobs]
            
            print(f"Found {len(jobs)} jobs after filtering")
            
            # Get all successful applications for these jobs
            applications = []
            if job_ids:
                # Try multiple field names for jobId in applications collection
                for job_field in ['jobId', 'job_id', 'job']:
                    # First try with 'selected' status
                    for status_value in ['selected', 'placed', 'offered', 'accepted']:
                        app_query = {
                            job_field: {'$in': job_ids},
                            'status': status_value
                        }
                        apps = list(mongo.db.applications.find(app_query))
                        if apps:
                            print(f"Found {len(apps)} applications with status '{status_value}' using field '{job_field}'")
                            applications.extend(apps)
            
            # If no applications found, try without status filter
            if not applications:
                for job_field in ['jobId', 'job_id', 'job']:
                    app_query = {job_field: {'$in': job_ids}}
                    apps = list(mongo.db.applications.find(app_query))
                    if apps:
                        print(f"Found {len(apps)} applications (any status) using field '{job_field}'")
                        # Filter for selected applications manually
                        selected_apps = [
                            app for app in apps 
                            if app.get('status', '').lower() in ['selected', 'placed', 'offered', 'accepted']
                        ]
                        if selected_apps:
                            print(f"Filtered to {len(selected_apps)} selected applications")
                            applications.extend(selected_apps)
            
            print(f"Total applications after filtering: {len(applications)}")
            
            # Identify student collection and branch field
            student_collections_to_try = ['students', 'student']
            branch_fields_to_try = ['major', 'branch', 'department']
            
            collection_name = None
            branch_field = None
            
            for coll_name in student_collections_to_try:
                collection = getattr(mongo.db, coll_name, None)
                if not collection:
                    continue
                    
                # Check which branch field is available
                for field in branch_fields_to_try:
                    # Try to find one document with this field
                    sample = collection.find_one({field: {"$exists": True}})
                    if sample:
                        collection_name = coll_name
                        branch_field = field
                        break
                        
                if collection_name and branch_field:
                    break
                
            if not collection_name or not branch_field:
                print(f"Could not determine student collection or branch field")
                return []
            
            print(f"Using collection '{collection_name}' with branch field '{branch_field}'")
            collection = getattr(mongo.db, collection_name)
            
            # Get student IDs from applications
            student_ids = []
            for app in applications:
                # Try multiple field names for studentId
                for field_name in ['studentId', 'student_id', 'student', 'userId', 'user_id']:
                    if field_name in app:
                        student_ids.append(str(app[field_name]))
                        break
            
            # Get student details
            students = {}
            for student_id in student_ids:
                try:
                    # Try with ObjectId
                    try:
                        student = collection.find_one({'_id': to_object_id(student_id)})
                        if student:
                            students[student_id] = student
                            continue
                    except:
                        pass
                        
                    # Try with string ID in various fields
                    for id_field in ['_id', 'id', 'studentId', 'student_id', 'userId', 'user_id']:
                        try:
                            student = collection.find_one({id_field: student_id})
                            if student:
                                students[student_id] = student
                                break
                        except:
                            pass
                except Exception as e:
                    print(f"Error finding student {student_id}: {e}")
            
            # Create package ranges
            ranges = [
                {'min': 0, 'max': 5, 'label': '0-5 LPA', 'count': 0, 'students': []},
                {'min': 5, 'max': 10, 'label': '5-10 LPA', 'count': 0, 'students': []},
                {'min': 10, 'max': 15, 'label': '10-15 LPA', 'count': 0, 'students': []},
                {'min': 15, 'max': 20, 'label': '15-20 LPA', 'count': 0, 'students': []},
                {'min': 20, 'max': 30, 'label': '20-30 LPA', 'count': 0, 'students': []},
                {'min': 30, 'max': float('inf'), 'label': '30+ LPA', 'count': 0, 'students': []}
            ]
            
            # Process job offers
            for app in applications:
                # Extract fields from application
                student_id = None
                for student_field in ['studentId', 'student_id', 'student', 'userId', 'user_id']:
                    if student_field in app:
                        student_id = str(app[student_field])
                        break
                    
                job_id = None
                for job_field in ['jobId', 'job_id', 'job']:
                    if job_field in app:
                        job_id = str(app[job_field])
                        break
                
                if not student_id or not job_id:
                    continue
                    
                student = students.get(student_id)
                
                if not student:
                    print(f"No student found for ID {student_id}")
                    continue
                
                # Determine branch
                branch = 'Unknown'
                for field in branch_fields_to_try:
                    if field in student and student[field]:
                        branch = student[field]
                        break
                
                # Apply branch filter if specified
                if 'branches' in filters and filters['branches'] and branch not in filters['branches']:
                    continue
                
                job = next((j for j in jobs if str(j['_id']) == job_id), None)
                
                if not job:
                    print(f"No job found for ID {job_id}")
                    continue
                
                # Process package information
                try:
                    package_str = job.get('package', '0')
                    if isinstance(package_str, str):
                        package = float(package_str.replace('LPA', '').strip())
                    else:
                        package = float(package_str)
                    
                    # Find appropriate range
                    for range_info in ranges:
                        if range_info['min'] <= package < range_info['max']:
                            range_info['count'] += 1
                            
                            # Get student ID and name with fallbacks
                            display_student_id = student.get('studentId') or student.get('student_id') or student.get('roll_number') or student_id
                            student_name = student.get('name', 'Unknown')
                            
                            range_info['students'].append({
                                'studentId': display_student_id,
                                'studentName': student_name,
                                'branch': branch,
                                'company': job.get('company', ''),
                                'role': job.get('role', ''),
                                'package': package_str if isinstance(package_str, str) else f"{package_str} LPA"
                            })
                            break
                except Exception as e:
                    print(f"Error processing package for job {job_id}: {e}")
            
            # Format final data
            report_data = []
            
            # Add range-based summary
            for range_info in ranges:
                if range_info['count'] > 0:
                    report_data.append({
                        'packageRange': range_info['label'],
                        'count': range_info['count'],
                        'percentage': f"{(range_info['count'] / len(applications) * 100):.2f}%" if applications else "0%"
                    })
            
            # Add individual student records for detailed view
            for range_info in ranges:
                for student in range_info['students']:
                    report_data.append({
                        'packageRange': range_info['label'],
                        'studentId': student['studentId'],
                        'studentName': student['studentName'],
                        'branch': student['branch'],
                        'company': student['company'],
                        'role': student['role'],
                        'package': student['package']
                    })
            
            return report_data
            
        except Exception as e:
            print(f"Error generating CTC analysis: {str(e)}")
            import traceback
            print(traceback.format_exc())
            return []
    
    @staticmethod
    def _generate_job_applicants(filters):
        """
        Generate a report of job applicants with resume links.
        """
        try:
            logger = current_app.logger
            logger.info(f"JOB APPLICANTS REPORT - Starting generation with filters: {filters}")
            job_id = filters.get('jobId')
            if not job_id:
                logger.warning("JOB APPLICANTS REPORT - No jobId provided in filters")
                return []
            
            logger.info(f"JOB APPLICANTS REPORT - Processing job ID: {job_id}")
            
            # Build query to get applications for this job
            try:
                object_job_id = to_object_id(job_id)
                app_query = {'job_id': object_job_id}
                logger.info(f"JOB APPLICANTS REPORT - Successfully converted job_id to ObjectId")
            except Exception as e:
                logger.error(f"JOB APPLICANTS REPORT - Failed to convert job_id to ObjectId: {e}")
                app_query = {'job_id': job_id}  # Try with string version
            
            # Apply student filter if specified
            if 'studentIds' in filters and filters['studentIds']:
                logger.info(f"JOB APPLICANTS REPORT - Filtering by student IDs: {filters['studentIds']}")
                try:
                    student_ids = [to_object_id(id) for id in filters['studentIds']]
                    app_query['student_id'] = {'$in': student_ids}
                except Exception as e:
                    logger.error(f"JOB APPLICANTS REPORT - Error converting student IDs: {e}")
            
            # Apply status filter if specified
            if 'status' in filters and filters['status']:
                logger.info(f"JOB APPLICANTS REPORT - Filtering by status: {filters['status']}")
                app_query['status'] = filters['status']
            
            # Get applications
            logger.info(f"JOB APPLICANTS REPORT - Query for applications: {app_query}")
            applications = list(mongo.db.applications.find(app_query))
            logger.info(f"JOB APPLICANTS REPORT - Found {len(applications)} applications")
            
            # Check collection names and document count
            collection_names = mongo.db.list_collection_names()
            logger.info(f"JOB APPLICANTS REPORT - Available collections: {collection_names}")
            logger.info(f"JOB APPLICANTS REPORT - Applications count: {mongo.db.applications.count_documents({})}")
            
            # If no applications found, dump a sample application to see structure
            if mongo.db.applications.count_documents({}) > 0:
                sample_app = mongo.db.applications.find_one({})
                logger.info(f"JOB APPLICANTS REPORT - Sample application structure: {sample_app}")
                logger.info(f"JOB APPLICANTS REPORT - Sample application fields: {list(sample_app.keys())}")
            
            # Try different field names if nothing found
            if not applications:
                logger.warning("JOB APPLICANTS REPORT - No applications found, trying alternate field names")
                alt_queries = [
                    {'jobId': object_job_id},
                    {'jobId': job_id},
                    {'job': object_job_id},
                    {'job': job_id}
                ]
                
                for idx, query in enumerate(alt_queries):
                    logger.info(f"JOB APPLICANTS REPORT - Trying alternate query {idx+1}: {query}")
                    alt_applications = list(mongo.db.applications.find(query))
                    if alt_applications:
                        logger.info(f"JOB APPLICANTS REPORT - Found {len(alt_applications)} applications with alternate query {idx+1}")
                        applications = alt_applications
                        break
            
            # If still no applications found, check a sample job ID
            if not applications and mongo.db.jobs.count_documents({}) > 0:
                sample_job = mongo.db.jobs.find_one({})
                if sample_job:
                    sample_job_id = sample_job.get('_id')
                    logger.info(f"JOB APPLICANTS REPORT - Sample job ID for testing: {sample_job_id}")
                    test_applications = list(mongo.db.applications.find({'job_id': sample_job_id}))
                    logger.info(f"JOB APPLICANTS REPORT - Applications for sample job: {len(test_applications)}")
                    
                    # Check if any applications exist at all
                    all_applications = list(mongo.db.applications.find({}))
                    logger.info(f"JOB APPLICANTS REPORT - Total applications in DB: {len(all_applications)}")
                    if all_applications:
                        sample_app = all_applications[0]
                        logger.info(f"JOB APPLICANTS REPORT - Sample application: {sample_app}")
                        logger.info(f"JOB APPLICANTS REPORT - Application job_id field name and type: {sample_app.get('job_id')} {type(sample_app.get('job_id'))}")
            
            # Get job details
            try:
                job = mongo.db.jobs.find_one({'_id': object_job_id})
                if not job:
                    logger.warning(f"JOB APPLICANTS REPORT - Job not found with ObjectId: {object_job_id}")
                    job = mongo.db.jobs.find_one({'_id': job_id})  # Try string ID
                    
                if not job:
                    # Try different field names
                    logger.warning("JOB APPLICANTS REPORT - Job not found with standard queries, trying alternative fields")
                    alt_queries = [
                        {'id': job_id},
                        {'jobId': job_id}
                    ]
                    
                    for idx, query in enumerate(alt_queries):
                        logger.info(f"JOB APPLICANTS REPORT - Trying alternate job query {idx+1}: {query}")
                        alt_job = mongo.db.jobs.find_one(query)
                        if alt_job:
                            logger.info(f"JOB APPLICANTS REPORT - Found job with alternate query {idx+1}")
                            job = alt_job
                            break
                
                if job:
                    logger.info(f"JOB APPLICANTS REPORT - Job found: {job.get('role', 'Unknown')} at {job.get('company', 'Unknown')}")
                else:
                    logger.error(f"JOB APPLICANTS REPORT - Job still not found after all queries, job count: {mongo.db.jobs.count_documents({})}")
                    # Log a sample job from database
                    sample_job = mongo.db.jobs.find_one({})
                    if sample_job:
                        logger.info(f"JOB APPLICANTS REPORT - Sample job structure: {sample_job}")
                        logger.info(f"JOB APPLICANTS REPORT - Sample job fields: {list(sample_job.keys())}")
                    return []
            except Exception as e:
                logger.error(f"JOB APPLICANTS REPORT - Error fetching job: {e}")
                return []
            
            # Get unique student IDs
            if not applications:
                logger.warning("JOB APPLICANTS REPORT - No applications to process")
                return []
            
            student_ids = []
            for app in applications:
                try:
                    student_id = app.get('student_id')
                    if student_id:
                        student_ids.append(student_id)
                    else:
                        # Check for alternative field names
                        for field in ['studentId', 'student', 'userId', 'user_id']:
                            if field in app:
                                logger.info(f"JOB APPLICANTS REPORT - Found student ID in field '{field}': {app[field]}")
                                student_ids.append(app[field])
                                break
                        else:
                            logger.warning(f"JOB APPLICANTS REPORT - No student ID field found in application: {app}")
                except Exception as e:
                    logger.error(f"JOB APPLICANTS REPORT - Error extracting student ID: {e}")
            
            student_ids = list(set([str(sid) for sid in student_ids if sid]))
            logger.info(f"JOB APPLICANTS REPORT - Found {len(student_ids)} unique student IDs")
            
            # Get student details
            students = {}
            for student_id in student_ids:
                try:
                    object_id = to_object_id(student_id)
                    
                    # Try different field combinations
                    queries = [
                        {'user_id': object_id},
                    ]
                    
                    for idx, query in enumerate(queries):
                        student = mongo.db.student.find_one(query)
                        if student:
                            logger.info(f"JOB APPLICANTS REPORT - Found student with query {idx+1}: {student.get('name', 'Unknown')}")
                            students[student_id] = student
                            break
                    else:
                        logger.warning(f"JOB APPLICANTS REPORT - No student found for ID: {student_id}")
                except Exception as e:
                    logger.error(f"JOB APPLICANTS REPORT - Error finding student {student_id}: {e}")
            
            logger.info(f"JOB APPLICANTS REPORT - Found {len(students)} students out of {len(student_ids)} IDs")
            
            # Build report data
            report_data = []
            
            for app in applications:
                try:
                    # Extract student_id from application using various field names
                    student_id = None
                    for field in ['student_id', 'studentId', 'student', 'userId', 'user_id']:
                        if field in app:
                            student_id = str(app[field])
                            break
                    
                    if not student_id:
                        logger.warning(f"JOB APPLICANTS REPORT - No student ID found in application: {app}")
                        continue
                    
                    logger.info(f"JOB APPLICANTS REPORT - Processing application for student ID: {student_id}")
                    
                    student = students.get(student_id)
                    if not student:
                        logger.warning(f"JOB APPLICANTS REPORT - No student data found for ID: {student_id}")
                        continue
                    
                    # Try to find a resume
                    resume_link = ""
                    resume_name = ""
                    try:
                        # Try various queries to find resume
                        resume_queries = [
                            {'student_id': student_id},
                            {'user_id': student_id},
                            {'student_id': to_object_id(student_id)},
                            {'user_id': to_object_id(student_id)}
                        ]
                        
                        for query in resume_queries:
                            resumes = list(mongo.db.resumes.find(query))
                            if resumes:
                                # Sort by upload date if available
                                sorted_resumes = sorted(
                                    resumes,
                                    key=lambda r: r.get('created_at', datetime.min),
                                    reverse=True
                                )
                                latest_resume = sorted_resumes[0]
                                resume_link = latest_resume.get('file_url', '')
                                resume_name = latest_resume.get('resume_name', '')
                                logger.info(f"JOB APPLICANTS REPORT - Found resume: {resume_name}")
                                break
                        else:
                            logger.warning(f"JOB APPLICANTS REPORT - No resume found for student: {student_id}")
                    except Exception as e:
                        logger.error(f"JOB APPLICANTS REPORT - Error finding resume: {e}")
                    
                    # Add the data for this student
                    student_data = {
                        'applicationId': str(app.get('_id', '')),
                        'studentId': student.get('student_id', ''),
                        'studentName': student.get('name', ''),
                        'email': student.get('email', ''),
                        'phone': student.get('phone', ''),
                        'major': student.get('major', ''),
                        'program': student.get('program', ''),
                        'cgpa': student.get('cgpa', ''),
                        'status': app.get('status', ''),
                        'currentStage': app.get('current_stage', ''),
                        'appliedOn': app.get('created_at', '').strftime('%Y-%m-%d') if isinstance(app.get('created_at'), datetime) else '',
                        'jobRole': job.get('role', ''),
                        'company': job.get('company', ''),
                        'resumeLink': resume_link,
                        'resumeName': resume_name
                    }
                    report_data.append(student_data)
                    logger.info(f"JOB APPLICANTS REPORT - Added data for student: {student_data['studentName']}")
                except Exception as e:
                    logger.error(f"JOB APPLICANTS REPORT - Error processing application: {e}")
            
            logger.info(f"JOB APPLICANTS REPORT - Completed with {len(report_data)} records")
            return report_data
            
        except Exception as e:
            current_app.logger.error(f"JOB APPLICANTS REPORT - CRITICAL ERROR: {str(e)}")
            import traceback
            current_app.logger.error(traceback.format_exc())
            return []
