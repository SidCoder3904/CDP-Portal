# app/routes/admin.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
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