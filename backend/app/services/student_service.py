from app import mongo
from bson.objectid import ObjectId
from datetime import datetime

class StudentService:
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
            # Convert string ID to ObjectId if needed
            if isinstance(student_id, str):
                student_id = ObjectId(student_id)
                
            return mongo.db.students.find_one({'_id': student_id})
        except Exception as e:
            print(f"Error retrieving student by ID: {str(e)}")
            return None
    
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
