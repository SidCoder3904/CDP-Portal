from venv import logger
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
            # print(f"Converting student_id to ObjectId: {student_id}")
            # Convert string ID to ObjectId if needed
            if isinstance(student_id, str):
                student_id = ObjectId(student_id)
                # print(f"Converted to ObjectId: {student_id}")
                
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
            
            # If updating passport image, ensure we keep the public ID
            if 'passport_image' in update_data:
                # Get current student data
                current_student = mongo.db.student.find_one({'user_id': user_id})
                if current_student and 'passport_image_public_id' in current_student:
                    # Keep the existing public ID if not being updated
                    if 'passport_image_public_id' not in update_data:
                        update_data['passport_image_public_id'] = current_student['passport_image_public_id']
            
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
        """Get education details for a student"""
        try:
            education_records = mongo.db.education.find({"student_id": ObjectId(student_id)})
            return [{
                "_id": str(edu.get("_id", "")),
                "student_id": str(edu.get("student_id", "")),
                "education_details": {
                    "institution": {
                        "current_value": edu.get("education_details", {}).get("institution", {}).get("current_value", ""),
                        "last_verified_value": edu.get("education_details", {}).get("institution", {}).get("last_verified_value")
                    },
                    "degree": {
                        "current_value": edu.get("education_details", {}).get("degree", {}).get("current_value", ""),
                        "last_verified_value": edu.get("education_details", {}).get("degree", {}).get("last_verified_value")
                    },
                    "field_of_study": {
                        "current_value": edu.get("education_details", {}).get("field_of_study", {}).get("current_value", ""),
                        "last_verified_value": edu.get("education_details", {}).get("field_of_study", {}).get("last_verified_value")
                    },
                    "start_date": {
                        "current_value": edu.get("education_details", {}).get("start_date", {}).get("current_value", ""),
                        "last_verified_value": edu.get("education_details", {}).get("start_date", {}).get("last_verified_value")
                    },
                    "end_date": {
                        "current_value": edu.get("education_details", {}).get("end_date", {}).get("current_value", ""),
                        "last_verified_value": edu.get("education_details", {}).get("end_date", {}).get("last_verified_value")
                    },
                    "gpa": {
                        "current_value": str(edu.get("education_details", {}).get("gpa", {}).get("current_value", "0.0")),
                        "last_verified_value": edu.get("education_details", {}).get("gpa", {}).get("last_verified_value")
                    },
                    "year": {
                        "current_value": edu.get("education_details", {}).get("year", {}).get("current_value", ""),
                        "last_verified_value": edu.get("education_details", {}).get("year", {}).get("last_verified_value")
                    },
                    "major": {
                        "current_value": edu.get("education_details", {}).get("major", {}).get("current_value", ""),
                        "last_verified_value": edu.get("education_details", {}).get("major", {}).get("last_verified_value")
                    },
                    "minor": {
                        "current_value": edu.get("education_details", {}).get("minor", {}).get("current_value", ""),
                        "last_verified_value": edu.get("education_details", {}).get("minor", {}).get("last_verified_value")
                    },
                    "relevant_courses": {
                        "current_value": edu.get("education_details", {}).get("relevant_courses", {}).get("current_value", ""),
                        "last_verified_value": edu.get("education_details", {}).get("relevant_courses", {}).get("last_verified_value")
                    },
                    "honors": {
                        "current_value": edu.get("education_details", {}).get("honors", {}).get("current_value", ""),
                        "last_verified_value": edu.get("education_details", {}).get("honors", {}).get("last_verified_value")
                    }
                },
                "is_verified": edu.get("is_verified", False),
                "created_at": edu.get("created_at", ""),
                "updated_at": edu.get("updated_at", "")
            } for edu in education_records]
        except Exception as e:
            print(f"Error getting education details: {str(e)}")
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
    
    @staticmethod
    def update_education_verification(education_id, status, verified_by):
        """Update verification status for an education record"""
        try:
            if isinstance(education_id, str):
                education_id = ObjectId(education_id)
            if isinstance(verified_by, str):
                verified_by = ObjectId(verified_by)

            # Get the current education record
            education = mongo.db.education.find_one({'_id': education_id})
            if not education:
                return False

            update_data = {
                "is_verified": status == "verified",
                "verified_by": verified_by,
                "verified_at": datetime.utcnow()
            }

            # If verifying, update last_verified_value for all fields
            if status == "verified":
                education_details = education.get("education_details", {})
                for field in education_details:
                    if isinstance(education_details[field], dict) and "current_value" in education_details[field]:
                        update_data[f"education_details.{field}.last_verified_value"] = education_details[field]["current_value"]

            result = mongo.db.education.update_one(
                {'_id': education_id},
                {'$set': update_data}
            )

            return result.modified_count > 0
        except Exception as e:
            print(f"Error updating education verification: {str(e)}")
            return False
    
    # Experience methods
    @staticmethod
    def get_experience_by_student_id(student_id):
        """Get experience details for a student"""
        try:
            experience = mongo.db.experience.find({"student_id": ObjectId(student_id)})
            return [{
                "_id": str(exp.get("_id", "")),
                "student_id": str(exp.get("student_id", "")),
                "experience_details": {
                    "company": {
                        "current_value": exp.get("experience_details", {}).get("company", {}).get("current_value", ""),
                        "last_verified_value": exp.get("experience_details", {}).get("company", {}).get("last_verified_value")
                    },
                    "position": {
                        "current_value": exp.get("experience_details", {}).get("position", {}).get("current_value", ""),
                        "last_verified_value": exp.get("experience_details", {}).get("position", {}).get("last_verified_value")
                    },
                    "duration": {
                        "current_value": exp.get("experience_details", {}).get("duration", {}).get("current_value", ""),
                        "last_verified_value": exp.get("experience_details", {}).get("duration", {}).get("last_verified_value")
                    },
                    "description": {
                        "current_value": exp.get("experience_details", {}).get("description", {}).get("current_value", ""),
                        "last_verified_value": exp.get("experience_details", {}).get("description", {}).get("last_verified_value")
                    },
                    "technologies": {
                        "current_value": exp.get("experience_details", {}).get("technologies", {}).get("current_value", ""),
                        "last_verified_value": exp.get("experience_details", {}).get("technologies", {}).get("last_verified_value")
                    },
                    "achievements": {
                        "current_value": exp.get("experience_details", {}).get("achievements", {}).get("current_value", ""),
                        "last_verified_value": exp.get("experience_details", {}).get("achievements", {}).get("last_verified_value")
                    },
                    "skills": {
                        "current_value": exp.get("experience_details", {}).get("skills", {}).get("current_value", ""),
                        "last_verified_value": exp.get("experience_details", {}).get("skills", {}).get("last_verified_value")
                    }
                },
                "is_verified": exp.get("is_verified", False),
                "created_at": exp.get("created_at", ""),
                "updated_at": exp.get("updated_at", "")
            } for exp in experience]
        except Exception as e:
            print(f"Error getting experience details: {str(e)}")
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
    
    @staticmethod
    def update_experience_verification(experience_id, status, verified_by):
        """Update verification status for an experience record"""
        try:
            if isinstance(experience_id, str):
                experience_id = ObjectId(experience_id)
            if isinstance(verified_by, str):
                verified_by = ObjectId(verified_by)

            # Get the current experience record
            experience = mongo.db.experience.find_one({'_id': experience_id})
            if not experience:
                return False

            update_data = {
                "is_verified": status == "verified",
                "verified_by": verified_by,
                "verified_at": datetime.utcnow()
            }

            # If verifying, update last_verified_value for all fields
            if status == "verified":
                experience_details = experience.get("experience_details", {})
                for field in experience_details:
                    if isinstance(experience_details[field], dict) and "current_value" in experience_details[field]:
                        update_data[f"experience_details.{field}.last_verified_value"] = experience_details[field]["current_value"]

            result = mongo.db.experience.update_one(
                {'_id': experience_id},
                {'$set': update_data}
            )

            return result.modified_count > 0
        except Exception as e:
            print(f"Error updating experience verification: {str(e)}")
            return False
    
    # Position methods
    @staticmethod
    def get_positions_by_student_id(student_id):
        """Get position details for a student"""
        try:
            positions = mongo.db.positions.find({"student_id": ObjectId(student_id)})
            return [{
                "_id": str(pos.get("_id", "")),
                "student_id": str(pos.get("student_id", "")),
                "position_details": {
                    "title": {
                        "current_value": pos.get("position_details", {}).get("title", {}).get("current_value", ""),
                        "last_verified_value": pos.get("position_details", {}).get("title", {}).get("last_verified_value")
                    },
                    "organization": {
                        "current_value": pos.get("position_details", {}).get("organization", {}).get("current_value", ""),
                        "last_verified_value": pos.get("position_details", {}).get("organization", {}).get("last_verified_value")
                    },
                    "duration": {
                        "current_value": pos.get("position_details", {}).get("duration", {}).get("current_value", ""),
                        "last_verified_value": pos.get("position_details", {}).get("duration", {}).get("last_verified_value")
                    },
                    "description": {
                        "current_value": pos.get("position_details", {}).get("description", {}).get("current_value", ""),
                        "last_verified_value": pos.get("position_details", {}).get("description", {}).get("last_verified_value")
                    },
                    "responsibilities": {
                        "current_value": pos.get("position_details", {}).get("responsibilities", {}).get("current_value", ""),
                        "last_verified_value": pos.get("position_details", {}).get("responsibilities", {}).get("last_verified_value")
                    },
                    "achievements": {
                        "current_value": pos.get("position_details", {}).get("achievements", {}).get("current_value", ""),
                        "last_verified_value": pos.get("position_details", {}).get("achievements", {}).get("last_verified_value")
                    }
                },
                "is_verified": pos.get("is_verified", False),
                "created_at": pos.get("created_at", ""),
                "updated_at": pos.get("updated_at", "")
            } for pos in positions]
        except Exception as e:
            print(f"Error getting position details: {str(e)}")
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
    
    @staticmethod
    def update_position_verification(position_id, status, verified_by):
        """Update verification status for a position record"""
        try:
            if isinstance(position_id, str):
                position_id = ObjectId(position_id)
            if isinstance(verified_by, str):
                verified_by = ObjectId(verified_by)

            # Get the current position record
            position = mongo.db.positions.find_one({'_id': position_id})
            if not position:
                return False

            update_data = {
                "is_verified": status == "verified",
                "verified_by": verified_by,
                "verified_at": datetime.utcnow()
            }

            # If verifying, update last_verified_value for all fields
            if status == "verified":
                position_details = position.get("position_details", {})
                for field in position_details:
                    if isinstance(position_details[field], dict) and "current_value" in position_details[field]:
                        update_data[f"position_details.{field}.last_verified_value"] = position_details[field]["current_value"]

            result = mongo.db.positions.update_one(
                {'_id': position_id},
                {'$set': update_data}
            )

            return result.modified_count > 0
        except Exception as e:
            print(f"Error updating position verification: {str(e)}")
            return False
    
    # Project methods
    @staticmethod
    def get_projects_by_student_id(student_id):
        """Get project details for a student"""
        try:
            projects = mongo.db.projects.find({"student_id": ObjectId(student_id)})
            return [{
                "_id": str(proj.get("_id", "")),
                "student_id": str(proj.get("student_id", "")),
                "project_details": {
                    "name": {
                        "current_value": proj.get("project_details", {}).get("name", {}).get("current_value", ""),
                        "last_verified_value": proj.get("project_details", {}).get("name", {}).get("last_verified_value")
                    },
                    "description": {
                        "current_value": proj.get("project_details", {}).get("description", {}).get("current_value", ""),
                        "last_verified_value": proj.get("project_details", {}).get("description", {}).get("last_verified_value")
                    },
                    "technologies": {
                        "current_value": proj.get("project_details", {}).get("technologies", {}).get("current_value", ""),
                        "last_verified_value": proj.get("project_details", {}).get("technologies", {}).get("last_verified_value")
                    },
                    "duration": {
                        "current_value": proj.get("project_details", {}).get("duration", {}).get("current_value", ""),
                        "last_verified_value": proj.get("project_details", {}).get("duration", {}).get("last_verified_value")
                    },
                    "role": {
                        "current_value": proj.get("project_details", {}).get("role", {}).get("current_value", ""),
                        "last_verified_value": proj.get("project_details", {}).get("role", {}).get("last_verified_value")
                    },
                    "team_size": {
                        "current_value": proj.get("project_details", {}).get("team_size", {}).get("current_value", ""),
                        "last_verified_value": proj.get("project_details", {}).get("team_size", {}).get("last_verified_value")
                    },
                    "github_link": {
                        "current_value": proj.get("project_details", {}).get("github_link", {}).get("current_value", ""),
                        "last_verified_value": proj.get("project_details", {}).get("github_link", {}).get("last_verified_value")
                    },
                    "demo_link": {
                        "current_value": proj.get("project_details", {}).get("demo_link", {}).get("current_value", ""),
                        "last_verified_value": proj.get("project_details", {}).get("demo_link", {}).get("last_verified_value")
                    }
                },
                "is_verified": proj.get("is_verified", False),
                "created_at": proj.get("created_at", ""),
                "updated_at": proj.get("updated_at", "")
            } for proj in projects]
        except Exception as e:
            print(f"Error getting project details: {str(e)}")
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
    
    @staticmethod
    def update_project_verification(project_id, status, verified_by):
        """Update verification status for a project record"""
        try:
            if isinstance(project_id, str):
                project_id = ObjectId(project_id)
            if isinstance(verified_by, str):
                verified_by = ObjectId(verified_by)

            # Get the current project record
            project = mongo.db.projects.find_one({'_id': project_id})
            if not project:
                return False

            update_data = {
                "is_verified": status == "verified",
                "verified_by": verified_by,
                "verified_at": datetime.utcnow()
            }

            # If verifying, update last_verified_value for all fields
            if status == "verified":
                project_details = project.get("project_details", {})
                for field in project_details:
                    if isinstance(project_details[field], dict) and "current_value" in project_details[field]:
                        update_data[f"project_details.{field}.last_verified_value"] = project_details[field]["current_value"]

            result = mongo.db.projects.update_one(
                {'_id': project_id},
                {'$set': update_data}
            )

            return result.modified_count > 0
        except Exception as e:
            print(f"Error updating project verification: {str(e)}")
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
            # print(f"\n=== Getting verification status for student {student_id} ===")
            # Convert string ID to ObjectId if needed
            if isinstance(student_id, str):
                student_id = ObjectId(student_id)
                # print(f"Converted student_id to ObjectId: {student_id}")
                
            student = mongo.db.student.find_one({'_id': student_id})
            # print(f"Raw student document: {student}")
            
            if not student:
                print("Student not found")
                return {}
            
            # Get verification status from student document
            verification = student.get('verification', {})
            # print(f"Raw verification data: {verification}")
            
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
            # print(f"Formatted verification status: {formatted_status}")
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

    @staticmethod
    def get_students_by_cycle(cycle_id, batch, eligible_programs):
        """
        Get students eligible for a specific placement cycle based on batch and programs
        
        Args:
            cycle_id: ID of the placement cycle
            batch: Batch year to filter by
            eligible_programs: List of eligible programs (e.g., ['btech', 'mtech'])
            
        Returns:
            List of formatted student documents for the cycle
        """
        try:
            # Match students with the given batch
            students = list(mongo.db.student.find({'enrollmentYear': batch}))

            logger.info(f"Students in batch {batch}: {students}")
            # Process students to match program eligibility
            eligible_students = []
            
            for student in students:
                # Check program eligibility based on email
                email = student.get('email', '')
                program_identifier = None
                
                if '@' in email:
                    program_identifier = email.split('@')[0][6].lower()
                
                # Match program identifier with eligible programs
                is_eligible = False
                student_program = ""
                
                if 'btech' in eligible_programs and program_identifier == 'b':
                    is_eligible = True
                    student_program = "B.Tech"
                elif 'mtech' in eligible_programs and program_identifier == 'm':
                    is_eligible = True
                    student_program = "M.Tech"
                elif 'phd' in eligible_programs and program_identifier == 'p':
                    is_eligible = True
                    student_program = "PhD"
                
                if not is_eligible:
                    continue
                
                # Format student for response
                formatted_student = {
                    "id": str(student.get("_id", "")),
                    "name": student.get("name", ""),
                    "rollNo": student.get("student_id", ""),
                    "branch": student.get("major", ""),
                    "program": student_program,
                    "cgpa": float(student.get("cgpa", 0)),
                    "status": student.get("status", "Registered"),
                    "jobsApplied": 0,
                    "jobsSelected": 0,
                    "jobsRejected": 0,
                    "jobsInProgress": 0
                }
                
                # Get job application statistics for this student
                student_id = str(student.get("_id", ""))
                
                # Get all jobs in this cycle
                jobs = list(mongo.db.jobs.find({"cycleId": cycle_id}))
                job_ids = [str(job["_id"]) for job in jobs]
                
                # Get student's applications for jobs in this cycle
                if job_ids:
                    applications = list(mongo.db.applications.find({
                        "studentId": student_id,
                        "jobId": {"$in": job_ids}
                    }))
                    
                    if applications:
                        formatted_student["jobsApplied"] = len(applications)
                        formatted_student["jobsSelected"] = len([a for a in applications if a.get("status") == "selected"])
                        formatted_student["jobsRejected"] = len([a for a in applications if a.get("status") == "rejected"])
                        formatted_student["jobsInProgress"] = len([a for a in applications if a.get("status") not in ["selected", "rejected"]])
                
                eligible_students.append(formatted_student)
            
            return eligible_students
        
        except Exception as e:
            print(f"Error getting students for cycle: {str(e)}")
            return []

    @staticmethod
    def get_student_eligible_cycles(student_id):
        """
        Find all placement cycles that a student is eligible for based on their enrollment year and program
        
        Args:
            student_id: ID of the student
            
        Returns:
            List of eligible placement cycles with details
        """
        try:
            # Get student details
            if isinstance(student_id, str):
                student_id = ObjectId(student_id)
            
            student = mongo.db.student.find_one({'user_id': student_id})
            if not student:
                return []
            
            enrollment_year = student.get('enrollmentYear')
            email = student.get('email', '')
            
            # Determine program type from email
            program_identifier = None
            program_type = None
            
            if '@' in email:
                program_identifier = email.split('@')[0][6].lower()
                
                if program_identifier == 'b':
                    program_type = 'btech'
                elif program_identifier == 'm':
                    program_type = 'mtech'
                elif program_identifier == 'p':
                    program_type = 'phd'
            
            if not enrollment_year or not program_type:
                return []
            
            # Find active placement cycles matching the student's batch and program
            cycle = mongo.db.placement_cycles.find_one({
                'batch': enrollment_year,
                'eligiblePrograms': program_type,
                'status': 'active'  # Only include active cycles
            })

            return f"{cycle.get('_id', '')}"

        except Exception as e:
            print(f"Error finding eligible cycles for student: {str(e)}")
            return []