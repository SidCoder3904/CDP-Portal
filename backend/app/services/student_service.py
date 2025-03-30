from app import mongo
from bson.objectid import ObjectId
from datetime import datetime

class StudentService:
    @staticmethod
    def get_student_id_by_user_id(user_id):
        """
        Get student ID by user ID.
        
        Args:
            user_id: The user ID to look up
            
        Returns:
            Student ID (ObjectId) if found, None otherwise
        """
        try:
            # Convert string ID to ObjectId if needed
            if isinstance(user_id, str):
                user_id = ObjectId(user_id)
            student = mongo.db.student.find_one({'user_id': user_id})
            return student['_id'] if student else None
            
        except Exception as e:
            print(f"Error retrieving student ID by user ID: {str(e)}")
            return None
    @staticmethod
    def get_student_by_id(student_id):
        """
        Get student details by ID.
        
        Args:
            student_id: The ID of the student (string or ObjectId)
            
        Returns:
            Student document or None if not found
        """
        try:
            print(f"Converting student_id to ObjectId: {student_id}")
            # Convert string ID to ObjectId if needed
            if isinstance(student_id, str):
                student_id = ObjectId(student_id)
                print(f"Converted to ObjectId: {student_id}")
                
            return mongo.db.student.find_one({'_id': student_id})
        except Exception as e:
            print(f"Error retrieving student by ID: {str(e)}")
            return None
    @classmethod
    def get_students_with_pagination(cls, filters=None, page=1, per_page=20):
        """
        Retrieve students with optional filtering and pagination for admin verification
        
        Args:
            filters: Dictionary of filter conditions
            page: Page number for pagination
            per_page: Number of items per page
        
        Returns:
            Tuple of (students list, total count)
        """
        try:
            query = {}
            
            # Apply filters if provided
            if filters:
                if filters.get('major') and filters['major'] != 'all':
                    query['major'] = filters['major']
                
                if 'cgpa' in filters:
                    query['cgpa'] = filters['cgpa']
                
                if filters.get('roll_number'):
                    query['student_id'] = {'$regex': filters['roll_number'], '$options': 'i'}
            
            # Calculate skip value for pagination
            skip = (page - 1) * per_page
            
            # Get total count of students matching filters
            total = mongo.db.student.count_documents(query)
            
            # Retrieve paginated students
            students = list(mongo.db.student.find(query)
                            .skip(skip)
                            .limit(per_page))
            
            return students, total
        except Exception as e:
            print(f"Error retrieving students for verification: {str(e)}")
            return [], 0
    @staticmethod
    def get_student_by_email(email):
        """
        Get student details by email.
        
        Args:
            email: The email of the student
            
        Returns:
            Student document or None if not found
        """
        try:
            return mongo.db.student.find_one({'email': email})
        except Exception as e:
            print(f"Error retrieving student by email: {str(e)}")
            return None
    
    @staticmethod
    def get_student_by_user_id(user_id):
        """
        Get student details by user ID.
        
        Args:
            user_id: The user ID associated with the student
            
        Returns:
            Student document or None if not found
        """
        try:
            # Convert string ID to ObjectId if needed
            if isinstance(user_id, str):
                user_id = ObjectId(user_id)
                
            return mongo.db.student.find_one({'user_id': user_id})
        except Exception as e:
            print(f"Error retrieving student by user ID: {str(e)}")
            return None
    
    @staticmethod
    def get_student_by_roll_number(roll_number):
        """
        Get student details by roll number.
        
        Args:
            roll_number: The roll number of the student
            
        Returns:
            Student document or None if not found
        """
        try:
            return mongo.db.student.find_one({'roll_number': roll_number})
        except Exception as e:
            print(f"Error retrieving student by roll number: {str(e)}")
            return None
    
    @staticmethod
    def create_student(student_data):
        """
        Create a new student.
        
        Args:
            student_data: Dictionary containing student data
            
        Returns:
            ID of the newly created student
        """
        try:
            # Add timestamps
            student_data['created_at'] = datetime.utcnow()
            student_data['updated_at'] = datetime.utcnow()
            
            result = mongo.db.student.insert_one(student_data)
            return str(result.inserted_id)
        except Exception as e:
            print(f"Error creating student: {str(e)}")
            return None
    
    @staticmethod
    def update_student_by_user_id(user_id, update_data):
        """
        Update a student's information by user ID.
        
        Args:
            user_id: The user ID of the student to update
            update_data: Dictionary containing fields to update
            
        Returns:
            True if update was successful, False otherwise
        """
        try:
            # Convert string ID to ObjectId if needed
            if isinstance(user_id, str):
                user_id = ObjectId(user_id)
            
            # Add updated timestamp
            update_data['updated_at'] = datetime.utcnow()
            
            result = mongo.db.student.update_one(
                {'user_id': user_id},
                {'$set': update_data}
            )
            
            return result.modified_count > 0
        except Exception as e:
            print(f"Error updating student by user ID: {str(e)}")
            return False
            
    @staticmethod
    def update_student(student_id, update_data):
        """
        Update a student's information.
        
        Args:
            student_id: The ID of the student to update
            update_data: Dictionary containing fields to update
            
        Returns:
            True if update was successful, False otherwise
        """
        try:
            # Convert string ID to ObjectId if needed
            if isinstance(student_id, str):
                student_id = ObjectId(student_id)
            
            # Add updated timestamp
            update_data['updated_at'] = datetime.utcnow()
            
            result = mongo.db.student.update_one(
                {'_id': student_id},
                {'$set': update_data}
            )
            
            return result.modified_count > 0
        except Exception as e:
            print(f"Error updating student: {str(e)}")
            return False
    
    @staticmethod
    def get_all_students(filters=None, page=1, per_page=20):
        """
        Get all students with optional filtering and pagination.
        
        Args:
            filters: Optional filters to apply
            page: Page number
            per_page: Items per page
            
        Returns:
            List of student documents and total count
        """
        try:
            query = {}
            
            # Apply filters if provided
            if filters:
                if 'branch' in filters:
                    query['branch'] = filters['branch']
                if 'gender' in filters:
                    query['gender'] = filters['gender']
                if 'min_cgpa' in filters:
                    query['cgpa'] = {'$gte': float(filters['min_cgpa'])}
                if 'batch' in filters:
                    query['batch'] = filters['batch']
            
            # Get total count
            total = mongo.db.student.count_documents(query)
            
            # Get paginated results
            students = list(mongo.db.student.find(query)
                        .sort('roll_number', 1)
                        .skip((page - 1) * per_page)
                        .limit(per_page))
            
            return students, total
        except Exception as e:
            print(f"Error retrieving students: {str(e)}")
            return [], 0
    
    @staticmethod
    def delete_student(student_id):
        """
        Delete a student.
        
        Args:
            student_id: The ID of the student to delete
            
        Returns:
            True if deletion was successful, False otherwise
        """
        try:
            # Convert string ID to ObjectId if needed
            if isinstance(student_id, str):
                student_id = ObjectId(student_id)
                
            result = mongo.db.student.delete_one({'_id': student_id})
            return result.deleted_count > 0
        except Exception as e:
            print(f"Error deleting student: {str(e)}")
            return False
    
    @staticmethod
    def get_student_placement_status(student_id):
        """
        Get a student's placement status.
        
        Args:
            student_id: The ID of the student
            
        Returns:
            Dictionary with placement status information
        """
        try:
            # Convert string ID to ObjectId if needed
            if isinstance(student_id, str):
                student_id = ObjectId(student_id)
                
            # Check if student has any selected applications
            selected_application = mongo.db.applications.find_one({
                'student_id': student_id,
                'status': 'selected'
            })
            
            if not selected_application:
                return {
                    'is_placed': False,
                    'placement_details': None
                }
            
            # Get job details
            job_id = selected_application.get('job_id')
            job = mongo.db.jobs.find_one({'_id': ObjectId(job_id)})
            
            if not job:
                return {
                    'is_placed': True,
                    'placement_details': {
                        'application_id': str(selected_application['_id']),
                        'selected_at': selected_application.get('updated_at')
                    }
                }
            
            return {
                'is_placed': True,
                'placement_details': {
                    'application_id': str(selected_application['_id']),
                    'job_id': str(job['_id']),
                    'company': job.get('company'),
                    'role': job.get('role'),
                    'package': job.get('salary'),
                    'selected_at': selected_application.get('updated_at')
                }
            }
        except Exception as e:
            print(f"Error getting student placement status: {str(e)}")
            return {'is_placed': False, 'placement_details': None}
    
    # Education methods
    @staticmethod
    def get_education_by_student_id(student_id):
        """
        Get all education records for a student.
        
        Args:
            student_id: The ID of the student
            
        Returns:
            List of education documents
        """
        try:
            # Convert string ID to ObjectId if needed
            if isinstance(student_id, str):
                student_id = ObjectId(student_id)
                
            return list(mongo.db.education.find({'student_id': student_id}))
        except Exception as e:
            print(f"Error retrieving education records: {str(e)}")
            return []
    
    @staticmethod
    def get_education_by_id(education_id):
        """
        Get education record by ID.
        
        Args:
            education_id: The ID of the education record
            
        Returns:
            Education document or None if not found
        """
        try:
            # Convert string ID to ObjectId if needed
            if isinstance(education_id, str):
                education_id = ObjectId(education_id)
                
            return mongo.db.education.find_one({'_id': education_id})
        except Exception as e:
            print(f"Error retrieving education record: {str(e)}")
            return None
    
    @staticmethod
    def add_education(education_data):
        """
        Add a new education record.
        
        Args:
            education_data: Dictionary containing education data
            
        Returns:
            ID of the newly created education record
        """
        try:
            # Add timestamps
            education_data['created_at'] = datetime.utcnow()
            education_data['updated_at'] = datetime.utcnow()
            
            result = mongo.db.education.insert_one(education_data)
            return str(result.inserted_id)
        except Exception as e:
            print(f"Error adding education record: {str(e)}")
            return None
    
    @staticmethod
    def update_education(education_id, update_data):
        """
        Update an education record.
        
        Args:
            education_id: The ID of the education record to update
            update_data: Dictionary containing fields to update
            
        Returns:
            True if update was successful, False otherwise
        """
        try:
            # Convert string ID to ObjectId if needed
            if isinstance(education_id, str):
                education_id = ObjectId(education_id)
            
            # Add updated timestamp
            update_data['updated_at'] = datetime.utcnow()
            
            result = mongo.db.education.update_one(
                {'_id': education_id},
                {'$set': update_data}
            )
            
            return result.modified_count > 0
        except Exception as e:
            print(f"Error updating education record: {str(e)}")
            return False
    
    @staticmethod
    def delete_education(education_id):
        """
        Delete an education record.
        
        Args:
            education_id: The ID of the education record to delete
            
        Returns:
            True if deletion was successful, False otherwise
        """
        try:
            # Convert string ID to ObjectId if needed
            if isinstance(education_id, str):
                education_id = ObjectId(education_id)
                
            result = mongo.db.education.delete_one({'_id': education_id})
            return result.deleted_count > 0
        except Exception as e:
            print(f"Error deleting education record: {str(e)}")
            return False
    
    # Experience methods
    @staticmethod
    def get_experience_by_student_id(student_id):
        """
        Get all experience records for a student.
        
        Args:
            student_id: The ID of the student
            
        Returns:
            List of experience documents
        """
        try:
            # Convert string ID to ObjectId if needed
            if isinstance(student_id, str):
                student_id = ObjectId(student_id)
                
            return list(mongo.db.experience.find({'student_id': student_id}))
        except Exception as e:
            print(f"Error retrieving experience records: {str(e)}")
            return []
    
    @staticmethod
    def get_experience_by_id(experience_id):
        """
        Get experience record by ID.
        
        Args:
            experience_id: The ID of the experience record
            
        Returns:
            Experience document or None if not found
        """
        try:
            # Convert string ID to ObjectId if needed
            if isinstance(experience_id, str):
                experience_id = ObjectId(experience_id)
                
            return mongo.db.experience.find_one({'_id': experience_id})
        except Exception as e:
            print(f"Error retrieving experience record: {str(e)}")
            return None
    
    @staticmethod
    def add_experience(experience_data):
        """
        Add a new experience record.
        
        Args:
            experience_data: Dictionary containing experience data
            
        Returns:
            ID of the newly created experience record
        """
        try:
            # Add timestamps
            experience_data['created_at'] = datetime.utcnow()
            experience_data['updated_at'] = datetime.utcnow()
            
            result = mongo.db.experience.insert_one(experience_data)
            return str(result.inserted_id)
        except Exception as e:
            print(f"Error adding experience record: {str(e)}")
            return None
    
    @staticmethod
    def update_experience(experience_id, update_data):
        """
        Update an experience record.
        
        Args:
            experience_id: The ID of the experience record to update
            update_data: Dictionary containing fields to update
            
        Returns:
            True if update was successful, False otherwise
        """
        try:
            # Convert string ID to ObjectId if needed
            if isinstance(experience_id, str):
                experience_id = ObjectId(experience_id)
            
            # Add updated timestamp
            update_data['updated_at'] = datetime.utcnow()
            
            result = mongo.db.experience.update_one(
                {'_id': experience_id},
                {'$set': update_data}
            )
            
            return result.modified_count > 0
        except Exception as e:
            print(f"Error updating experience record: {str(e)}")
            return False
    
    @staticmethod
    def delete_experience(experience_id):
        """
        Delete an experience record.
        
        Args:
            experience_id: The ID of the experience record to delete
            
        Returns:
            True if deletion was successful, False otherwise
        """
        try:
            # Convert string ID to ObjectId if needed
            if isinstance(experience_id, str):
                experience_id = ObjectId(experience_id)
                
            result = mongo.db.experience.delete_one({'_id': experience_id})
            return result.deleted_count > 0
        except Exception as e:
            print(f"Error deleting experience record: {str(e)}")
            return False
    
    # Position methods
    @staticmethod
    def get_positions_by_student_id(student_id):
        """
        Get all position records for a student.
        
        Args:
            student_id: The ID of the student
            
        Returns:
            List of position documents
        """
        try:
            # Convert string ID to ObjectId if needed
            if isinstance(student_id, str):
                student_id = ObjectId(student_id)
                
            return list(mongo.db.positions.find({'student_id': student_id}))
        except Exception as e:
            print(f"Error retrieving position records: {str(e)}")
            return []
    
    @staticmethod
    def get_position_by_id(position_id):
        """
        Get position record by ID.
        
        Args:
            position_id: The ID of the position record
            
        Returns:
            Position document or None if not found
        """
        try:
            # Convert string ID to ObjectId if needed
            if isinstance(position_id, str):
                position_id = ObjectId(position_id)
                
            return mongo.db.positions.find_one({'_id': position_id})
        except Exception as e:
            print(f"Error retrieving position record: {str(e)}")
            return None
    
    @staticmethod
    def add_position(position_data):
        """
        Add a new position record.
        
        Args:
            position_data: Dictionary containing position data
            
        Returns:
            ID of the newly created position record
        """
        try:
            # Add timestamps
            position_data['created_at'] = datetime.utcnow()
            position_data['updated_at'] = datetime.utcnow()
            
            result = mongo.db.positions.insert_one(position_data)
            return str(result.inserted_id)
        except Exception as e:
            print(f"Error adding position record: {str(e)}")
            return None
    
    @staticmethod
    def update_position(position_id, update_data):
        """
        Update a position record.
        
        Args:
            position_id: The ID of the position record to update
            update_data: Dictionary containing fields to update
            
        Returns:
            True if update was successful, False otherwise
        """
        try:
            # Convert string ID to ObjectId if needed
            if isinstance(position_id, str):
                position_id = ObjectId(position_id)
            
            # Add updated timestamp
            update_data['updated_at'] = datetime.utcnow()
            
            result = mongo.db.positions.update_one(
                {'_id': position_id},
                {'$set': update_data}
            )
            
            return result.modified_count > 0
        except Exception as e:
            print(f"Error updating position record: {str(e)}")
            return False
    
    @staticmethod
    def delete_position(position_id):
        """
        Delete a position record.
        
        Args:
            position_id: The ID of the position record to delete
            
        Returns:
            True if deletion was successful, False otherwise
        """
        try:
            # Convert string ID to ObjectId if needed
            if isinstance(position_id, str):
                position_id = ObjectId(position_id)
                
            result = mongo.db.positions.delete_one({'_id': position_id})
            return result.deleted_count > 0
        except Exception as e:
            print(f"Error deleting position record: {str(e)}")
            return False
    
    # Project methods
    @staticmethod
    def get_projects_by_student_id(student_id):
        """
        Get all project records for a student.
        
        Args:
            student_id: The ID of the student
            
        Returns:
            List of project documents
        """
        try:
            # Convert string ID to ObjectId if needed
            if isinstance(student_id, str):
                student_id = ObjectId(student_id)
                
            return list(mongo.db.projects.find({'student_id': student_id}))
        except Exception as e:
            print(f"Error retrieving project records: {str(e)}")
            return []
    
    @staticmethod
    def get_project_by_id(project_id):
        """
        Get project record by ID.
        
        Args:
            project_id: The ID of the project record
            
        Returns:
            Project document or None if not found
        """
        try:
            # Convert string ID to ObjectId if needed
            if isinstance(project_id, str):
                project_id = ObjectId(project_id)
                
            return mongo.db.projects.find_one({'_id': project_id})
        except Exception as e:
            print(f"Error retrieving project record: {str(e)}")
            return None
    
    @staticmethod
    def add_project(project_data):
        """
        Add a new project record.
        
        Args:
            project_data: Dictionary containing project data
            
        Returns:
            ID of the newly created project record
        """
        try:
            # Add timestamps
            project_data['created_at'] = datetime.utcnow()
            project_data['updated_at'] = datetime.utcnow()
            
            result = mongo.db.projects.insert_one(project_data)
            return str(result.inserted_id)
        except Exception as e:
            print(f"Error adding project record: {str(e)}")
            return None
    
    @staticmethod
    def update_project(project_id, update_data):
        """
        Update a project record.
        
        Args:
            project_id: The ID of the project record to update
            update_data: Dictionary containing fields to update
            
        Returns:
            True if update was successful, False otherwise
        """
        try:
            # Convert string ID to ObjectId if needed
            if isinstance(project_id, str):
                project_id = ObjectId(project_id)
            
            # Add updated timestamp
            update_data['updated_at'] = datetime.utcnow()
            
            result = mongo.db.projects.update_one(
                {'_id': project_id},
                {'$set': update_data}
            )
            
            return result.modified_count > 0
        except Exception as e:
            print(f"Error updating project record: {str(e)}")
            return False
    
    @staticmethod
    def delete_project(project_id):
        """
        Delete a project record.
        
        Args:
            project_id: The ID of the project record to delete
            
        Returns:
            True if deletion was successful, False otherwise
        """
        try:
            # Convert string ID to ObjectId if needed
            if isinstance(project_id, str):
                project_id = ObjectId(project_id)
                
            result = mongo.db.projects.delete_one({'_id': project_id})
            return result.deleted_count > 0
        except Exception as e:
            print(f"Error deleting project record: {str(e)}")
            return False
    
    # Resume methods
    @staticmethod
    def get_resumes_by_student_id(student_id):
        """
        Get all resume records for a student.
        
        Args:
            student_id: The ID of the student
            
        Returns:
            List of resume documents
        """
        try:
            # Convert string ID to ObjectId if needed
            if isinstance(student_id, str):
                student_id = ObjectId(student_id)
                
            return list(mongo.db.resumes.find({'student_id': student_id}))
        except Exception as e:
            print(f"Error retrieving resume records: {str(e)}")
            return []
    
    @staticmethod
    def get_resume_by_id(resume_id):
        """
        Get resume record by ID.
        
        Args:
            resume_id: The ID of the resume record
            
        Returns:
            Resume document or None if not found
        """
        try:
            # Convert string ID to ObjectId if needed
            if isinstance(resume_id, str):
                resume_id = ObjectId(resume_id)
                
            return mongo.db.resumes.find_one({'_id': resume_id})
        except Exception as e:
            print(f"Error retrieving resume record: {str(e)}")
            return None
    
    @staticmethod
    def get_resume_by_name(student_id, resume_name):
        """
        Get resume record by name for a specific student.
        
        Args:
            student_id: The ID of the student
            resume_name: The name of the resume
            
        Returns:
            Resume document or None if not found
        """
        try:
            # Convert string ID to ObjectId if needed
            if isinstance(student_id, str):
                student_id = ObjectId(student_id)
                
            return mongo.db.resumes.find_one({
                'student_id': student_id,
                'resume_name': resume_name
            })
        except Exception as e:
            print(f"Error retrieving resume by name: {str(e)}")
            return None
    
    @staticmethod
    def count_resumes_by_student_id(student_id):
        """
        Count the number of resumes for a student.
        
        Args:
            student_id: The ID of the student
            
        Returns:
            Number of resumes
        """
        try:
            # Convert string ID to ObjectId if needed
            if isinstance(student_id, str):
                student_id = ObjectId(student_id)
                
            return mongo.db.resumes.count_documents({'student_id': student_id})
        except Exception as e:
            print(f"Error counting resumes: {str(e)}")
            return 0
    
    @staticmethod
    def add_resume(resume_data):
        """
        Add a new resume record.
        
        Args:
            resume_data: Dictionary containing resume data
            
        Returns:
            ID of the newly created resume record
        """
        try:
            # Convert student_id to ObjectId if needed
            if isinstance(resume_data.get('student_id'), str):
                resume_data['student_id'] = ObjectId(resume_data['student_id'])
            
            # Add timestamps
            resume_data['created_at'] = datetime.utcnow()
            resume_data['updated_at'] = datetime.utcnow()
            
            result = mongo.db.resumes.insert_one(resume_data)
            return str(result.inserted_id)
        except Exception as e:
            print(f"Error adding resume record: {str(e)}")
            return None
    
    @staticmethod
    def update_resume(resume_id, update_data):
        """
        Update a resume record.
        
        Args:
            resume_id: The ID of the resume record to update
            update_data: Dictionary containing fields to update
            
        Returns:
            True if update was successful, False otherwise
        """
        try:
            # Convert string ID to ObjectId if needed
            if isinstance(resume_id, str):
                resume_id = ObjectId(resume_id)
            
            # Add updated timestamp
            update_data['updated_at'] = datetime.utcnow()
            
            result = mongo.db.resumes.update_one(
                {'_id': resume_id},
                {'$set': update_data}
            )
            
            return result.modified_count > 0
        except Exception as e:
            print(f"Error updating resume record: {str(e)}")
            return False
    
    @staticmethod
    def delete_resume(resume_id):
        """
        Delete a resume record.
        
        Args:
            resume_id: The ID of the resume record to delete
            
        Returns:
            True if deletion was successful, False otherwise
        """
        try:
            # Convert string ID to ObjectId if needed
            if isinstance(resume_id, str):
                resume_id = ObjectId(resume_id)
                
            result = mongo.db.resumes.delete_one({'_id': resume_id})
            return result.deleted_count > 0
        except Exception as e:
            print(f"Error deleting resume record: {str(e)}")
            return False
    
    @staticmethod
    def get_verification_status(student_id):
        """
        Get verification status for a student.
        
        Args:
            student_id: The ID of the student
            
        Returns:
            Dictionary with verification status for each field
        """
        try:
            print(f"\n=== Getting verification status for student {student_id} ===")
            # Convert string ID to ObjectId if needed
            if isinstance(student_id, str):
                student_id = ObjectId(student_id)
                print(f"Converted student_id to ObjectId: {student_id}")
                
            student = mongo.db.student.find_one({'_id': student_id})
            print(f"Raw student document: {student}")
            
            if not student:
                print("Student not found")
                return {}
            
            # Get verification status from student document
            verification = student.get('verification', {})
            print(f"Raw verification data: {verification}")
            
            # Format for frontend
            formatted_status = {
                'name': verification.get('name', {}).get('status', 'pending'),
                'email': verification.get('email', {}).get('status', 'pending'),
                'phone': verification.get('phone', {}).get('status', 'pending'),
                'dateOfBirth': verification.get('date_of_birth', {}).get('status', 'pending'),
                'gender': verification.get('gender', {}).get('status', 'pending'),
                'address': verification.get('address', {}).get('status', 'pending'),
                'major': verification.get('major', {}).get('status', 'pending'),
                'studentId': verification.get('student_id', {}).get('status', 'pending'),
                'enrollmentYear': verification.get('enrollment_year', {}).get('status', 'pending'),
                'expectedGraduationYear': verification.get('expected_graduation_year', {}).get('status', 'pending'),
                'passportImage': verification.get('passport_image', {}).get('status', 'pending')
            }
            print(f"Formatted verification status: {formatted_status}")
            return formatted_status
            
        except Exception as e:
            print(f"Error getting verification status: {str(e)}")
            return {}

    @staticmethod
    def update_verification_status(student_id, field, status, verified_by, comments=None):
        """
        Update the verification status of a specific field for a student
        
        Args:
            student_id: The ID of the student
            field: The field to update
            status: The new status ('verified' or 'rejected')
            verified_by: The ID of the admin who verified
            comments: Optional comments about the verification
            
        Returns:
            Updated student document or None if update failed
        """
        try:
            print(f"Updating verification status for student {student_id}")
            print(f"Field: {field}, Status: {status}, Verified by: {verified_by}")
            
            # Convert string ID to ObjectId if needed
            if isinstance(student_id, str):
                student_id = ObjectId(student_id)
                print(f"Converted student_id to ObjectId: {student_id}")
            if isinstance(verified_by, str):
                verified_by = ObjectId(verified_by)
                print(f"Converted verified_by to ObjectId: {verified_by}")

            # Update the verification status
            update_data = {
                f"verification.{field}.status": status,
                f"verification.{field}.verified_by": verified_by,
                f"verification.{field}.verified_at": datetime.utcnow()
            }

            if comments:
                update_data[f"verification.{field}.comments"] = comments

            print(f"Update data: {update_data}")

            result = mongo.db.student.update_one(
                {'_id': student_id},
                {'$set': update_data}
            )

            print(f"Update result: modified_count={result.modified_count}, matched_count={result.matched_count}")

            if result.modified_count == 0:
                print("No documents were modified")
                return None

            # Get the updated student document
            updated_student = mongo.db.student.find_one({'_id': student_id})
            print(f"Updated student document: {updated_student}")
            return updated_student

        except Exception as e:
            print(f"Error updating verification status: {str(e)}")
            return None

    @staticmethod
    def verify_all_fields(student_id, verified_by):
        """
        Verify all fields for a student
        
        Args:
            student_id: The ID of the student
            verified_by: The ID of the admin who verified
            
        Returns:
            Updated student document or None if update failed
        """
        try:
            # Convert string ID to ObjectId if needed
            if isinstance(student_id, str):
                student_id = ObjectId(student_id)
            if isinstance(verified_by, str):
                verified_by = ObjectId(verified_by)

            # Get the student document to know which fields to verify
            student = mongo.db.student.find_one({'_id': student_id})
            if not student:
                return None

            # Create update data for all fields
            update_data = {}
            fields_to_verify = [
                'name', 'email', 'phone', 'date_of_birth', 'gender', 'address',
                'major', 'student_id', 'enrollment_year', 'expected_graduation_year'
            ]

            for field in fields_to_verify:
                if field in student:
                    update_data[f"verification.{field}.status"] = "verified"
                    update_data[f"verification.{field}.verified_by"] = verified_by
                    update_data[f"verification.{field}.verified_at"] = datetime.utcnow()

            # Update all fields
            result = mongo.db.student.update_one(
                {'_id': student_id},
                {'$set': update_data}
            )

            if result.modified_count == 0:
                return None

            # Get the updated student document
            return mongo.db.student.find_one({'_id': student_id})

        except Exception as e:
            print(f"Error verifying all fields: {str(e)}")
            return None