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
            if 'cycleId' in filters:
                # Get cycle IDs of specified type
                search_query['cycleId'] = filters['cycleId']
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

            
            if not job or not student:
                return False
            
            eligibility = job.get('eligibility', {})
    
            
            # Check branch eligibility
            student_branch = student.get('major', student.get('branch', ''))
            if student.get('major') not in job.get('eligibility', {}).get('branches', []):
                return False
            
            
            # Check gender eligibility
            gender_req = job.get('eligibility', {}).get('gender').lower() 
            if gender_req and gender_req != 'all' and student.get('gender').lower() != gender_req:
                return False
            
            # Check program eligibility
            # student_program = student.get('program', student.get('degree', ''))
            # if student_program not in eligibility.get('programs', []):
            #     return False
                
            
            
            # Check CGPA requirement
            try:
                student_cgpa = float(student.get('cgpa', 0))
                
                if eligibility.get('uniformCgpa', True):
                    # If uniform CGPA is required, check against the single CGPA value
                    min_cgpa = float(eligibility.get('cgpa', 0))
                    if student_cgpa < min_cgpa:
                        return False
                else:
                    # If non-uniform CGPA, check against branch-specific criteria
                    cgpa_criteria = eligibility.get('cgpaCriteria', {})
                    if student_branch in cgpa_criteria:
                        
                        branch_min_cgpa = (cgpa_criteria.get(student_branch, {}))
                        prog_min_cgpa = float(branch_min_cgpa.get('btech', 0))
                        if student_cgpa < prog_min_cgpa:
                            return False
                        
       
            except (ValueError, TypeError):
                # If there's an error converting CGPA to float, consider student ineligible
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
                'job_id': ObjectId(job_id),
                'student_id': ObjectId(student_id)
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
            student_id: The user_id of the student
            data: Optional additional application data
            
        Returns:
            The ID of the newly created application
        """
        try:
            print(f"\n=== Starting job application process ===")
            print(f"Job ID: {job_id}")
            print(f"User ID: {student_id}")
            
            # Convert string IDs to ObjectId if needed
            if isinstance(job_id, str):
                job_id = ObjectId(job_id)
                print(f"Converted job_id to ObjectId: {job_id}")
            if isinstance(student_id, str):
                student_id = ObjectId(student_id)
                print(f"Converted student_id to ObjectId: {student_id}")
            
            # Get student details to check verification status
            print("\nFetching student details...")
            student = mongo.db.student.find_one({'user_id': student_id})
            if not student:
                print("ERROR: Student not found")
                raise Exception("Student not found")
            
            # Get the student's _id from the student document
            student_db_id = student.get('_id')
            if not student_db_id:
                print("ERROR: Student _id not found in student document")
                raise Exception("Student _id not found")
                
            print(f"Found student: {student.get('name')}")
            print(f"Student _id from document: {student_db_id}")
            print(f"Student document: {student}")

            # Check if student is fully verified
            print("\nChecking verification status...")
            verification = student.get('verification', {})
            print(f"Raw verification data: {verification}")
            
            # Check basic info fields
            print("\nChecking basic info fields...")
            basic_fields = ['name', 'email', 'phone', 'date_of_birth', 'gender', 
                          'address', 'major', 'student_id', 'enrollment_year', 
                          'expected_graduation_year', 'passport_image']
            
            for field in basic_fields:
                status = verification.get(field, {}).get('status')
                print(f"Field: {field}, Status: {status}")
            
            basic_fields_verified = all(
                verification.get(field, {}).get('status') == 'verified'
                for field in basic_fields
            )
            print(f"Basic fields verified: {basic_fields_verified}")

            # Check education items for this specific student
            print("\nChecking education items...")
            print(f"Querying education with student _id: {student_db_id}")
            education_items = list(mongo.db.education.find({'student_id': student_db_id}))
            print(f"Found {len(education_items)} education items for student")
            print(f"Education items: {education_items}")
            for i, edu in enumerate(education_items):
                print(f"Education {i+1} verified: {edu.get('is_verified', False)}")
            education_verified = all(
                edu.get('is_verified', False)
                for edu in education_items
            )
            print(f"All education items verified: {education_verified}")

            # Check experience items for this specific student
            print("\nChecking experience items...")
            print(f"Querying experience with student _id: {student_db_id}")
            experience_items = list(mongo.db.experience.find({'student_id': student_db_id}))
            print(f"Found {len(experience_items)} experience items for student")
            print(f"Experience items: {experience_items}")
            for i, exp in enumerate(experience_items):
                print(f"Experience {i+1} verified: {exp.get('is_verified', False)}")
            experience_verified = all(
                exp.get('is_verified', False)
                for exp in experience_items
            )
            print(f"All experience items verified: {experience_verified}")

            # Check positions items for this specific student
            print("\nChecking positions items...")
            print(f"Querying positions with student _id: {student_db_id}")
            positions_items = list(mongo.db.positions.find({'student_id': student_db_id}))
            print(f"Found {len(positions_items)} positions items for student")
            print(f"Positions items: {positions_items}")
            for i, pos in enumerate(positions_items):
                print(f"Position {i+1} verified: {pos.get('is_verified', False)}")
            positions_verified = all(
                pos.get('is_verified', False)
                for pos in positions_items
            )
            print(f"All positions items verified: {positions_verified}")

            # Check projects items for this specific student
            print("\nChecking projects items...")
            print(f"Querying projects with student _id: {student_db_id}")
            projects_items = list(mongo.db.projects.find({'student_id': student_db_id}))
            print(f"Found {len(projects_items)} projects items for student")
            print(f"Projects items: {projects_items}")
            for i, proj in enumerate(projects_items):
                print(f"Project {i+1} verified: {proj.get('is_verified', False)}")
            projects_verified = all(
                proj.get('is_verified', False)
                for proj in projects_items
            )
            print(f"All projects items verified: {projects_verified}")

            # Final verification check
            is_fully_verified = (basic_fields_verified and education_verified and 
                               experience_verified and positions_verified and projects_verified)
            print(f"\nFinal verification status: {is_fully_verified}")

            # If any verification check fails, raise an exception
            if not is_fully_verified:
                print("ERROR: Student profile is not fully verified")
                raise Exception("Student profile is not fully verified. Please complete verification before applying.")

            print("\nCreating application...")
            # Create base application
            application = {
                'job_id': job_id,
                'student_id': student_id,  # Use the original user_id here
                'status': 'applied',
                'current_stage': 'Application Submitted',
                'created_at': datetime.utcnow(),
                'updated_at': datetime.utcnow()
            }

            # Add additional data if provided
            if data:
                print("Adding additional application data...")
                if 'resumeId' in data:
                    resume_id = data['resumeId']
                    if isinstance(resume_id, str):
                        resume_id = ObjectId(resume_id)
                    application['resume_id'] = resume_id
                    print(f"Added resume ID: {resume_id}")
                if 'coverLetter' in data:
                    application['cover_letter'] = data['coverLetter']
                    print("Added cover letter")
                if 'answers' in data:
                    application['answers'] = data['answers']
                    print("Added application answers")

            result = mongo.db.applications.insert_one(application)
            print(f"Application created with ID: {result.inserted_id}")
            
            # Update job applications count
            mongo.db.jobs.update_one(
                {'_id': job_id},
                {'$inc': {'applications_count': 1}}
            )
            print("Updated job applications count")
            
            print("=== Job application process completed successfully ===\n")
            return str(result.inserted_id)
        except Exception as e:
            print(f"\nERROR in create_application: {str(e)}")
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
            query = {'job_id': ObjectId(job_id)}
            
            if status:
                query['status'] = status
            
            # Get total count
            total = mongo.db.applications.count_documents(query)
            
            # Load student data for each application
            # Aggregation pipeline to fetch student details
            pipeline = [
                {'$match': query},
                {'$sort': {'createdAt': -1}},
                {'$skip': (page - 1) * per_page},
                {'$limit': per_page},
                {'$lookup': {
                    'from': 'student',
                    'localField': 'student_id',  # Ensure this matches applications schema
                    'foreignField': 'user_id',  # Matches student schema
                    'as': 'student'
                }},
                {'$unwind': '$student'},
                {'$project': {
                    '_id': '$student.user_id',
                    'applicationId': '$_id',
                    'name': '$student.name',
                    'email': '$student.email',
                    'phone': '$student.phone',
                    'dateOfBirth': '$student.dateOfBirth',
                    'gender': '$student.gender',
                    'address': '$student.address',
                    'major': '$student.major',
                    'studentId': '$student.studentId',
                    'enrollmentYear': '$student.enrollmentYear',
                    'expectedGraduationYear': '$student.expectedGraduationYear',
                    'passportImage': '$student.passportImage',
                    'cgpa':'$student.cgpa',
                    'status': 1,
                    'currentStage': '$current_stage'
                }}
            ]
            
            students = list(mongo.db.applications.aggregate(pipeline))
            
            return students, total
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
                {'$match': {'student_id': student_id}},
                {'$sort': {'createdAt': -1}},
                {'$lookup': {
                    'from': 'jobs',
                    'localField': 'job_id',
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
