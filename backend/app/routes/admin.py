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
    - branch: Filter by branch
    - min_cgpa: Minimum CGPA
    - roll_number: Search by roll number
    - page: Page number for pagination
    - per_page: Number of items per page
    """
    # Extract query parameters
    branch = request.args.get('branch', 'all')
    min_cgpa = request.args.get('min_cgpa', 'any')
    roll_number = request.args.get('roll_number', '')
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 20))

    # Build filter dictionary
    filters = {}
    if branch and branch != 'all':
        filters['branch'] = branch
    
    if min_cgpa and min_cgpa != 'any':
        filters['cgpa'] = {'$gte': float(min_cgpa)}
    
    if roll_number:
        filters['student_id'] = {'$regex': roll_number, '$options': 'i'}

    try:
        # Get paginated students
        students, total = StudentService.get_students_with_pagination(
            filters=filters, 
            page=page, 
            per_page=per_page
        )

        # Format students for frontend
        formatted_students = [
            {
                "_id": str(student.get('_id', '')),
                "name": student.get('name', ''),
                "studentId": student.get('studentId', ''),
                "cgpa": student.get('cgpa', 0.0),
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
            "verification": verification_status
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
    """
    Update the verification status of a specific field for a student
    """
    try:
        print(f"Received verification update request for student {student_id}")
        data = request.get_json()
        print(f"Request data: {data}")
        
        field = data.get('field')
        status = data.get('status')
        comments = data.get('comments')

        if not field or not status:
            print("Missing required fields")
            return jsonify({
                "error": "Missing required fields",
                "message": "Field and status are required"
            }), 400

        if status not in ['verified', 'rejected']:
            print(f"Invalid status: {status}")
            return jsonify({
                "error": "Invalid status",
                "message": "Status must be either 'verified' or 'rejected'"
            }), 400

        # Get current user (admin) ID
        current_user = get_jwt_identity()
        admin_id = current_user.get('id')
        print(f"Admin ID: {admin_id}")

        # Update verification status
        updated_student = StudentService.update_verification_status(
            student_id=student_id,
            field=field,
            status=status,
            verified_by=admin_id,
            comments=comments
        )

        if not updated_student:
            print("Failed to update verification status")
            return jsonify({
                "error": "Failed to update verification status",
                "message": "Could not update the verification status"
            }), 500

        print("Successfully updated verification status")
        # Get verification status
        verification_status = StudentService.get_verification_status(student_id)
        print(f"New verification status: {verification_status}")

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
        print(f"Error updating verification status: {str(e)}")
        return jsonify({
            "error": "Failed to update verification status",
            "message": str(e)
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