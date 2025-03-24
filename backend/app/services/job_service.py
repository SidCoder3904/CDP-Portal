# app/services/job_service.py
from app import mongo
from bson.objectid import ObjectId
from datetime import datetime
from app.services.student_service import StudentService

class JobService:
    @staticmethod
    def get_job_by_id(job_id):
        """
        Get a specific job by ID.
        
        Args:
            job_id: The ID of the job
            
        Returns:
            The job document or None if not found
        """
        try:
            return mongo.db.jobs.find_one({'_id': ObjectId(job_id)})
        except Exception as e:
            print(f"Error retrieving job: {str(e)}")
            return None
    
    @staticmethod
    def get_jobs_by_cycle(cycle_id, filters=None):
        """
        Get all jobs in a specific placement cycle.
        
        Args:
            cycle_id: The ID of the placement cycle
            filters: Optional filters to apply
            
        Returns:
            List of job documents
        """
        query = {'cycleId': cycle_id}
        
        # Apply additional filters if provided
        if filters:
            if 'status' in filters:
                query['status'] = filters['status']
            if 'company' in filters:
                query['company'] = filters['company']
        
        return list(mongo.db.jobs.find(query).sort('createdAt', -1))
    
    @staticmethod
    def update_job(job_id, data):
        """
        Update a job.
        
        Args:
            job_id: The ID of the job to update
            data: Dictionary containing updated data
            
        Returns:
            True if update was successful, False otherwise
        """
        try:
            # Prevent updating certain fields
            if 'cycleId' in data:
                del data['cycleId']
            if 'createdAt' in data:
                del data['createdAt']
            
            data['updatedAt'] = datetime.utcnow()
            
            result = mongo.db.jobs.update_one(
                {'_id': ObjectId(job_id)},
                {'$set': data}
            )
            
            return result.modified_count > 0
        except Exception as e:
            print(f"Error updating job: {str(e)}")
            return False
    
    @staticmethod
    def delete_job(job_id):
        """
        Delete a job and its applications.
        
        Args:
            job_id: The ID of the job to delete
            
        Returns:
            True if deletion was successful, False otherwise
        """
        try:
            # First delete all applications for this job
            mongo.db.applications.delete_many({'jobId': job_id})
            
            # Then delete the job
            result = mongo.db.jobs.delete_one({'_id': ObjectId(job_id)})
            return result.deleted_count > 0
        except Exception as e:
            print(f"Error deleting job: {str(e)}")
            return False
    
    @staticmethod
    def search_jobs(query_text, filters=None, page=1, per_page=10):
        """
        Search jobs by text and filters.
        
        Args:
            query_text: Text to search for in company, role, and description
            filters: Optional filters to apply
            page: Page number
            per_page: Items per page
            
        Returns:
            List of matching job documents and total count
        """
        search_query = {}
        
        # Add text search if provided
        if query_text:
            text_query = {
                '$or': [
                    {'company': {'$regex': query_text, '$options': 'i'}},
                    {'role': {'$regex': query_text, '$options': 'i'}},
                    {'jobDescription': {'$regex': query_text, '$options': 'i'}}
                ]
            }
            search_query.update(text_query)
        
        # Apply additional filters if provided
        if filters:
            if 'status' in filters:
                search_query['status'] = filters['status']
            if 'cycleType' in filters:
                # Get cycle IDs of specified type
                cycles = mongo.db.placement_cycles.find({'type': filters['cycleType']})
                cycle_ids = [str(cycle['_id']) for cycle in cycles]
                search_query['cycleId'] = {'$in': cycle_ids}
            if 'eligibleBranches' in filters:
                search_query['eligibility.branches'] = {'$in': filters['eligibleBranches']}
        
        # Get total count
        total = mongo.db.jobs.count_documents(search_query)
        
        # Get paginated results
        jobs = list(mongo.db.jobs.find(search_query)
                    .sort('createdAt', -1)
                    .skip((page - 1) * per_page)
                    .limit(per_page))
        
        return jobs, total
    
    @staticmethod
    def check_student_eligibility(job_id, student_id):
        """
        Check if a student is eligible for a job.
        
        Args:
            job_id: The ID of the job
            student_id: The ID of the student
            
        Returns:
            True if student is eligible, False otherwise
        """
        try:
            # Get job and student details
            job = JobService.get_job_by_id(job_id)
            student = StudentService.get_student_by_user_id(student_id)

            print(job)
            print(student)

            
            if not job or not student:
                return False
        
            
            # Check branch eligibility
            if student.get('major') not in job.get('eligibility', {}).get('branches', []):
                return False
            
            
            # Check gender eligibility
            gender_req = job.get('eligibility', {}).get('gender').lower() 
            if gender_req and gender_req != 'all' and student.get('gender').lower() != gender_req:
                return False
            
            
            # Check CGPA requirement
            min_cgpa = float(job.get('eligibility', {}).get('cgpa', 0))
            student_cgpa = float(student.get('cgpa', 0))
            if student_cgpa < min_cgpa:
                return False
            
            # Check cycle eligibility (e.g., if student is already placed)
            cycle = mongo.db.placement_cycles.find_one({'_id': ObjectId(job.get('cycleId'))})
            if cycle and cycle.get('type') == 'placement':
                # Check if student is already placed
                placed_applications = mongo.db.applications.find({
                    'studentId': student_id,
                    'status': 'selected'
                })
                
                # If student has any selected application, they're already placed
                if placed_applications.count() > 0:
                    return False
            
            return True
            
        except Exception as e:
            print(f"Error checking eligibility: {str(e)}")
            return False
    
    @staticmethod
    def has_student_applied(job_id, student_id):
        """
        Check if a student has already applied for a job.
        
        Args:
            job_id: The ID of the job
            student_id: The ID of the student
            
        Returns:
            True if student has applied, False otherwise
        """
        try:
            application = mongo.db.applications.find_one({
                'jobId': job_id,
                'studentId': student_id
            })
            return application is not None
        except Exception as e:
            print(f"Error checking application: {str(e)}")
            return False
    
    @staticmethod
    def create_application(job_id, student_id, data=None):
        """
        Create a job application.
        
        Args:
            job_id: The ID of the job
            student_id: The ID of the student
            data: Optional additional application data
            
        Returns:
            The ID of the newly created application
        """
        try:
            # Convert string IDs to ObjectId if needed
            if isinstance(job_id, str):
                job_id = ObjectId(job_id)
            if isinstance(student_id, str):
                student_id = ObjectId(student_id)
            
            # Create base application
            application = {
                'job_id': job_id,
                'student_id': student_id,
                'status': 'applied',
                'current_stage': 'Application Submitted',
                'created_at': datetime.utcnow(),
                'updated_at': datetime.utcnow()
            }
            
            # Add additional data if provided
            if data:
                if 'resumeId' in data:
                    resume_id = data['resumeId']
                    if isinstance(resume_id, str):
                        resume_id = ObjectId(resume_id)
                    application['resume_id'] = resume_id
                if 'coverLetter' in data:
                    application['cover_letter'] = data['coverLetter']
                if 'answers' in data:
                    application['answers'] = data['answers']
            
            result = mongo.db.applications.insert_one(application)
            
            # Update job applications count
            mongo.db.jobs.update_one(
                {'_id': job_id},
                {'$inc': {'applications_count': 1}}
            )
            
            return str(result.inserted_id)
        except Exception as e:
            print(f"Error creating application: {str(e)}")
            return None
    
    @staticmethod
    def get_application_by_id(application_id):
        """
        Get an application by ID.
        
        Args:
            application_id: The ID of the application
            
        Returns:
            The application document or None if not found
        """
        try:
            return mongo.db.applications.find_one({'_id': ObjectId(application_id)})
        except Exception as e:
            print(f"Error retrieving application: {str(e)}")
            return None
    
    @staticmethod
    def get_applications_by_job(job_id, page=1, per_page=25, status=None):
        """
        Get applications for a specific job with pagination.
        
        Args:
            job_id: The ID of the job
            page: Page number
            per_page: Items per page
            status: Optional status filter
            
        Returns:
            List of application documents and total count
        """
        try:
            query = {'jobId': job_id}
            
            if status:
                query['status'] = status
            
            # Get total count
            total = mongo.db.applications.count_documents(query)
            
            # Load student data for each application
            pipeline = [
                {'$match': query},
                {'$sort': {'createdAt': -1}},
                {'$skip': (page - 1) * per_page},
                {'$limit': per_page},
                {'$lookup': {
                    'from': 'students',
                    'localField': 'studentId',
                    'foreignField': '_id',
                    'as': 'student'
                }},
                {'$unwind': '$student'},
                {'$project': {
                    '_id': 1,
                    'jobId': 1,
                    'studentId': 1,
                    'status': 1,
                    'currentStage': 1,
                    'createdAt': 1,
                    'updatedAt': 1,
                    'student': {
                        '_id': 1,
                        'name': 1,
                        'rollNumber': 1,
                        'branch': 1,
                        'cgpa': 1,
                        'email': 1
                    }
                }}
            ]
            
            applications = list(mongo.db.applications.aggregate(pipeline))
            
            return applications, total
        except Exception as e:
            print(f"Error retrieving applications: {str(e)}")
            return [], 0
    
    @staticmethod
    def get_student_applications(student_id, status=None):
        """
        Get all applications for a student.
        
        Args:
            student_id: The ID of the student
            status: Optional status filter
            
        Returns:
            List of application documents with job details
        """
        try:
            query = {'studentId': student_id}
            
            if status:
                query['status'] = status
            
            pipeline = [
                {'$match': query},
                {'$sort': {'createdAt': -1}},
                {'$lookup': {
                    'from': 'jobs',
                    'localField': 'jobId',
                    'foreignField': '_id',
                    'as': 'job'
                }},
                {'$unwind': '$job'},
                {'$lookup': {
                    'from': 'placement_cycles',
                    'localField': 'job.cycleId',
                    'foreignField': '_id',
                    'as': 'cycle'
                }},
                {'$unwind': '$cycle'},
                {'$project': {
                    '_id': 1,
                    'jobId': 1,
                    'status': 1,
                    'currentStage': 1,
                    'createdAt': 1,
                    'updatedAt': 1,
                    'job': {
                        '_id': 1,
                        'company': 1,
                        'role': 1,
                        'status': 1
                    },
                    'cycle': {
                        '_id': 1,
                        'name': 1,
                        'type': 1
                    }
                }}
            ]
            
            applications = list(mongo.db.applications.aggregate(pipeline))
            
            return applications
        except Exception as e:
            print(f"Error retrieving student applications: {str(e)}")
            return []
    
    @staticmethod
    def update_application_status(application_id, status, current_stage=None):
        """
        Update the status of an application.
        
        Args:
            application_id: The ID of the application
            status: The new status
            current_stage: The new current stage
            
        Returns:
            True if update was successful, False otherwise
        """
        try:
            update_data = {
                'status': status,
                'updatedAt': datetime.utcnow()
            }
            
            if current_stage:
                update_data['currentStage'] = current_stage
            
            result = mongo.db.applications.update_one(
                {'_id': ObjectId(application_id)},
                {'$set': update_data}
            )
            
            return result.modified_count > 0
        except Exception as e:
            print(f"Error updating application status: {str(e)}")
            return False
    
    @staticmethod
    def get_job_statistics(job_id):
        """
        Get statistics for a specific job.
        
        Args:
            job_id: The ID of the job
            
        Returns:
            Dictionary of job statistics
        """
        try:
            # Get application counts by status
            pipeline = [
                {'$match': {'jobId': job_id}},
                {'$group': {
                    '_id': '$status',
                    'count': {'$sum': 1}
                }}
            ]
            
            status_counts = {item['_id']: item['count'] 
                            for item in mongo.db.applications.aggregate(pipeline)}
            
            # Get branch distribution
            pipeline = [
                {'$match': {'jobId': job_id}},
                {'$lookup': {
                    'from': 'students',
                    'localField': 'studentId',
                    'foreignField': '_id',
                    'as': 'student'
                }},
                {'$unwind': '$student'},
                {'$group': {
                    '_id': '$student.branch',
                    'count': {'$sum': 1}
                }}
            ]
            
            branch_distribution = {item['_id']: item['count'] 
                                for item in mongo.db.applications.aggregate(pipeline)}
            
            # Get gender distribution
            pipeline = [
                {'$match': {'jobId': job_id}},
                {'$lookup': {
                    'from': 'students',
                    'localField': 'studentId',
                    'foreignField': '_id',
                    'as': 'student'
                }},
                {'$unwind': '$student'},
                {'$group': {
                    '_id': '$student.gender',
                    'count': {'$sum': 1}
                }}
            ]
            
            gender_distribution = {item['_id']: item['count'] 
                                 for item in mongo.db.applications.aggregate(pipeline)}
            
            # Get total applications
            total_applications = sum(status_counts.values())
            
            # Get job details
            job = JobService.get_job_by_id(job_id)
            
            return {
                'jobId': job_id,
                'company': job.get('company', ''),
                'role': job.get('role', ''),
                'totalApplications': total_applications,
                'statusCounts': status_counts,
                'branchDistribution': branch_distribution,
                'genderDistribution': gender_distribution
            }
        except Exception as e:
            print(f"Error retrieving job statistics: {str(e)}")
            return {}
    
    @staticmethod
    def get_student_job_status(student_id):
        """
        Get a summary of a student's job application status.
        
        Args:
            student_id: The ID of the student
            
        Returns:
            Dictionary summarizing student's application status
        """
        try:
            # Check if student is placed
            placed_app = mongo.db.applications.find_one({
                'studentId': student_id,
                'status': 'selected'
            })
            
            is_placed = placed_app is not None
            
            # Get job details if placed
            placement_details = None
            if is_placed:
                job = mongo.db.jobs.find_one({'_id': ObjectId(placed_app['jobId'])})
                if job:
                    placement_details = {
                        'company': job.get('company'),
                        'role': job.get('role'),
                        'dateOfSelection': placed_app.get('updatedAt')
                    }
            
            # Get application counts by status
            pipeline = [
                {'$match': {'studentId': student_id}},
                {'$group': {
                    '_id': '$status',
                    'count': {'$sum': 1}
                }}
            ]
            
            status_counts = {item['_id']: item['count'] 
                            for item in mongo.db.applications.aggregate(pipeline)}
            
            # Get total applications
            total_applications = sum(status_counts.values())
            
            return {
                'studentId': student_id,
                'isPlaced': is_placed,
                'placementDetails': placement_details,
                'totalApplications': total_applications,
                'statusCounts': status_counts
            }
        except Exception as e:
            print(f"Error retrieving student job status: {str(e)}")
            return {
                'studentId': student_id,
                'isPlaced': False,
                'totalApplications': 0,
                'statusCounts': {}
            }
    @staticmethod
    def get_applications_by_student(student_id):
        """
        Get all applications submitted by a student with job details.
        
        Args:
            student_id: The ID of the student
            
        Returns:
            List of application documents with job details
        """
        try:
            # Convert string ID to ObjectId if needed
            if isinstance(student_id, str):
                student_id = ObjectId(student_id)
                
            pipeline = [
                {'$match': {'studentId': student_id}},
                {'$sort': {'createdAt': -1}},
                {'$lookup': {
                    'from': 'jobs',
                    'localField': 'jobId',
                    'foreignField': '_id',
                    'as': 'job'
                }},
                {'$unwind': '$job'},
                {'$project': {
                    '_id': 1,
                    'jobId': {'$toString': '$jobId'},
                    'studentId': {'$toString': '$studentId'},
                    'status': 1,
                    'currentStage': 1,
                    'appliedAt': '$createdAt',
                    'updatedAt': 1,
                    'job': {
                        '_id': {'$toString': '$job._id'},
                        'company': '$job.company',
                        'role': '$job.role',
                        'location': '$job.location',
                        'salary': '$job.salary',
                        'jobType': '$job.jobType',
                        'logo': '$job.logo'
                    }
                }}
            ]
            
            applications = list(mongo.db.applications.aggregate(pipeline))
            return applications
        except Exception as e:
            print(f"Error retrieving student applications: {str(e)}")
            return []
