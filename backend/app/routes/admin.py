# app/routes/admin.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.utils.auth import admin_required
from app.services.student_service import StudentService

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/verification', methods=['GET'])
@jwt_required()
@admin_required
def get_students():
    """
    Get students with optional filtering for admin verification
    Query Parameters:
    - branch: Filter by branch (major field in DB)
    - min_cgpa: Minimum CGPA
    - roll_number: Search by roll number (student_id field in DB)
    - page: Page number for pagination
    - per_page: Number of items per page
    """
    # Extract query parameters
    branch = request.args.get('branch', 'all')
    min_cgpa = request.args.get('min_cgpa', 'any')
    roll_number = request.args.get('roll_number', '')
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 20))

    print(f"[DEBUG] Received filter parameters: branch={branch}, min_cgpa={min_cgpa}, roll_number={roll_number}")

    # Build filter dictionary
    filters = {}
    if branch and branch != 'all':
        # Use lowercase branch codes to match DB format
        filters['major'] = branch.lower()
        print(f"[DEBUG] Added major filter: {filters['major']}")
    
    if min_cgpa and min_cgpa != 'any':
        try:
            # Convert both the filter value and database value to float for comparison
            min_cgpa_float = float(min_cgpa)
            # Use $expr to convert string CGPA to number and compare
            filters['$expr'] = {
                '$gte': [
                    {'$toDouble': {'$ifNull': ['$cgpa', '0']}},  # Convert string CGPA to double, default to 0 if null
                    min_cgpa_float
                ]
            }
            print(f"[DEBUG] Added CGPA filter: {min_cgpa_float}")
        except ValueError:
            print(f"[DEBUG] Invalid CGPA value: {min_cgpa}")
    
    if roll_number:
        # Use student_id field for roll number search with case-insensitive regex
        filters['student_id'] = {'$regex': f'^{roll_number}', '$options': 'i'}
        print(f"[DEBUG] Added roll number filter: {roll_number}")

    print(f"[DEBUG] Final filters: {filters}")

    try:
        # Get paginated students
        students, total = StudentService.get_students_with_pagination(
            filters=filters, 
            page=page, 
            per_page=per_page
        )

        print(f"[DEBUG] Found {len(students)} students matching filters")
        if students:
            print(f"[DEBUG] Sample student data: major={students[0].get('major')}, cgpa={students[0].get('cgpa')}, student_id={students[0].get('student_id')}")

        # Format students for frontend
        formatted_students = [
            {
                "_id": str(student.get('_id', '')),
                "name": student.get('name', ''),
                "studentId": student.get('student_id', ''),
                "cgpa": float(student.get('cgpa', 0.0)),  # Convert string CGPA to float for frontend
                "major": student.get('major', ''),
                "isVerified": student.get('is_verified', False)
            } for student in students
        ]

        return jsonify({
            "students": formatted_students,
            "total": total
        }), 200

    except Exception as e:
        print(f"Error retrieving students: {str(e)}")
        return jsonify({
            "error": "Failed to retrieve students",
            "message": str(e)
        }), 500

@admin_bp.route('/verification/<student_id>', methods=['GET'])
@jwt_required()
@admin_required
def get_student_details(student_id):
    """
    Get detailed information about a single student for verification
    """
    try:
        print(f"Fetching student details for ID: {student_id}")
        student = StudentService.get_student_by_id(student_id)
        print(f"Student data: {student}")
        
        if not student:
            print(f"Student not found with ID: {student_id}")
            return jsonify({
                "error": "Student not found",
                "message": "The requested student could not be found"
            }), 404

        # Get verification status
        verification_status = StudentService.get_verification_status(student_id)
        print(f"Verification status: {verification_status}")

        # Get the passport image URL from Cloudinary if it exists
        passport_image = student.get("passport_image")
        if passport_image and not passport_image.startswith("http"):
            # If it's not a Cloudinary URL, use the placeholder
            passport_image = "/placeholder.svg?height=200&width=200"

        # Get education, positions, projects, and experience data
        education = StudentService.get_education_by_student_id(student_id)
        positions = StudentService.get_positions_by_student_id(student_id)
        projects = StudentService.get_projects_by_student_id(student_id)
        experience = StudentService.get_experience_by_student_id(student_id)

        # Get the passport image URL from Cloudinary if it exists
        passport_image = student.get("passport_image")
        if passport_image and not passport_image.startswith("http"):
            # If it's not a Cloudinary URL, use the placeholder
            passport_image = "/placeholder.svg?height=200&width=200"

        # Format student data for frontend
        formatted_student = {
            "_id": str(student.get("_id", "")),
            "name": student.get("name", ""),
            "email": student.get("email", ""),
            "phone": student.get("phone", ""),
            "dateOfBirth": student.get("date_of_birth", ""),
            "gender": student.get("gender", ""),
            "address": student.get("address", ""),
            "major": student.get("major", ""),
            "studentId": student.get("student_id", ""),
            "enrollmentYear": student.get("enrollment_year", ""),
            "expectedGraduationYear": student.get("expected_graduation_year", ""),
            "passportImage": passport_image,
            "passportImage": passport_image,
            "cgpa": float(student.get("cgpa", 0.0)),
            "branch": student.get("branch", ""),
            "verification": verification_status,
            "education": education,
            "positions": positions,
            "projects": projects,
            "experience": experience
        }

        return jsonify(formatted_student), 200

    except Exception as e:
        print(f"Error retrieving student details: {str(e)}")
        return jsonify({
            "error": "Failed to retrieve student details",
            "message": str(e)
        }), 500

@admin_bp.route('/verification/<student_id>/verify', methods=['POST'])
@jwt_required()
@admin_required
def update_verification_status(student_id):
    try:
        data = request.get_json()
        print(f"[Backend] Received verification request for student {student_id}")
        print(f"[Backend] Request data: {data}")
        
        field = data.get('field')
        status = data.get('status')
        comments = data.get('comments')
        
        if not field or not status:
            print("[Backend] Missing required fields in request")
            return jsonify({
                "error": "Field and status are required"
            }), 400
            
        if status not in ['verified', 'rejected']:
            print("[Backend] Invalid status value")
            return jsonify({
                "error": "Status must be either verified or rejected"
            }), 400
            
        current_user_id = get_jwt_identity()
        print(f"[Backend] Current admin user ID: {current_user_id}")

        # Handle verification of education, experience, projects, and positions
        if field.startswith('education.'):
            try:
                index = int(field.split('.')[1])
                education = StudentService.get_education_by_student_id(student_id)
                if 0 <= index < len(education):
                    education_id = education[index]['_id']
                    success = StudentService.update_education_verification(education_id, status, current_user_id)
                    if not success:
                        return jsonify({"error": "Failed to update education verification"}), 500
            except (ValueError, IndexError) as e:
                return jsonify({"error": f"Invalid education index: {str(e)}"}), 400

        elif field.startswith('experience.'):
            try:
                index = int(field.split('.')[1])
                experience = StudentService.get_experience_by_student_id(student_id)
                if 0 <= index < len(experience):
                    experience_id = experience[index]['_id']
                    success = StudentService.update_experience_verification(experience_id, status, current_user_id)
                    if not success:
                        return jsonify({"error": "Failed to update experience verification"}), 500
            except (ValueError, IndexError) as e:
                return jsonify({"error": f"Invalid experience index: {str(e)}"}), 400

        elif field.startswith('projects.'):
            try:
                index = int(field.split('.')[1])
                projects = StudentService.get_projects_by_student_id(student_id)
                if 0 <= index < len(projects):
                    project_id = projects[index]['_id']
                    success = StudentService.update_project_verification(project_id, status, current_user_id)
                    if not success:
                        return jsonify({"error": "Failed to update project verification"}), 500
            except (ValueError, IndexError) as e:
                return jsonify({"error": f"Invalid project index: {str(e)}"}), 400

        elif field.startswith('positions.'):
            try:
                index = int(field.split('.')[1])
                positions = StudentService.get_positions_by_student_id(student_id)
                if 0 <= index < len(positions):
                    position_id = positions[index]['_id']
                    success = StudentService.update_position_verification(position_id, status, current_user_id)
                    if not success:
                        return jsonify({"error": "Failed to update position verification"}), 500
            except (ValueError, IndexError) as e:
                return jsonify({"error": f"Invalid position index: {str(e)}"}), 400

        else:
            # Handle basic student fields verification
            result = StudentService.update_verification_status(
                student_id=student_id,
                field=field,
                status=status,
                verified_by=current_user_id,
                comments=comments
            )
            
            if not result:
                print("[Backend] Failed to update verification status")
                return jsonify({
                    "error": "Failed to update verification status"
                }), 500

        # Get updated student details
        student = StudentService.get_student_by_id(student_id)
        if not student:
            return jsonify({"error": "Student not found"}), 404

        # Get verification status
        verification_status = StudentService.get_verification_status(student_id)

        # Get education, positions, projects, and experience data
        education = StudentService.get_education_by_student_id(student_id)
        positions = StudentService.get_positions_by_student_id(student_id)
        projects = StudentService.get_projects_by_student_id(student_id)
        experience = StudentService.get_experience_by_student_id(student_id)

        # Format student data for frontend
        formatted_student = {
            "_id": str(student.get("_id", "")),
            "name": student.get("name", ""),
            "email": student.get("email", ""),
            "phone": student.get("phone", ""),
            "dateOfBirth": student.get("date_of_birth", ""),
            "gender": student.get("gender", ""),
            "address": student.get("address", ""),
            "major": student.get("major", ""),
            "studentId": student.get("student_id", ""),
            "enrollmentYear": student.get("enrollment_year", ""),
            "expectedGraduationYear": student.get("expected_graduation_year", ""),
            "passportImage": student.get("passport_image", "/placeholder.svg?height=200&width=200"),
            "cgpa": float(student.get("cgpa", 0.0)),
            "branch": student.get("branch", ""),
            "verification": verification_status,
            "education": education,
            "positions": positions,
            "projects": projects,
            "experience": experience
        }
            
        print(f"[Backend] Successfully updated verification status for field {field}")
        return jsonify(formatted_student)
        
    except Exception as e:
        print(f"[Backend] Error in update_verification_status: {str(e)}")
        return jsonify({
            "error": str(e)
        }), 500

@admin_bp.route('/verification/<student_id>/verify-all', methods=['POST'])
@jwt_required()
@admin_required
def verify_all_fields(student_id):
    """
    Verify all fields for a student
    """
    try:
        # Get current user (admin) ID
        current_user = get_jwt_identity()
        admin_id = current_user.get('id')

        # Update all fields to verified
        updated_student = StudentService.verify_all_fields(student_id, admin_id)

        if not updated_student:
            return jsonify({
                "error": "Failed to verify all fields",
                "message": "Could not update the verification status"
            }), 500

        # Get verification status
        verification_status = StudentService.get_verification_status(student_id)

        # Format student data for frontend
        formatted_student = {
            "_id": str(updated_student.get("_id", "")),
            "name": updated_student.get("name", ""),
            "email": updated_student.get("email", ""),
            "phone": updated_student.get("phone", ""),
            "dateOfBirth": updated_student.get("date_of_birth", ""),
            "gender": updated_student.get("gender", ""),
            "address": updated_student.get("address", ""),
            "major": updated_student.get("major", ""),
            "studentId": updated_student.get("student_id", ""),
            "enrollmentYear": updated_student.get("enrollment_year", ""),
            "expectedGraduationYear": updated_student.get("expected_graduation_year", ""),
            "passportImage": updated_student.get("passport_image", "/placeholder.svg?height=200&width=200"),
            "cgpa": float(updated_student.get("cgpa", 0.0)),
            "branch": updated_student.get("branch", ""),
            "verification": verification_status
        }

        return jsonify(formatted_student), 200

    except Exception as e:
        print(f"Error verifying all fields: {str(e)}")
        return jsonify({
            "error": "Failed to verify all fields",
            "message": str(e)
        }), 500