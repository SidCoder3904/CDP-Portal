# app/routes/students.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.student_service import StudentService
from app.utils.auth import student_required
from app.utils.validators import validate_student_profile
from werkzeug.utils import secure_filename
import os

students_bp = Blueprint('students', __name__)

@students_bp.route('/me', methods=['GET'])
@jwt_required()
# @student_required
def get_my_profile():
    """Get the profile of the currently logged-in student"""
    # current_user = get_jwt_identity()
    # student_id = current_user.get('id')

    return jsonify({
  "name": "Akash Verma",
  "email": "verma@egmail.com",
  "phone": "+91 941914191",
  "dateOfBirth": "02-04-2003",
  "gender": "Male",
  "address": "330 Sector 7, Gandhi Nagar, Indore",
  "major": "Computer Science",
  "studentId": "CSB1098",
  "enrollmentYear": "2022",
  "expectedGraduationYear": "2026",
  "passportImage": "/placeholder.svg?height=200&width=200",
}), 200

    
    student = StudentService.get_student_by_id(student_id)
    if not student:
        return jsonify({"message": "Student not found"}), 404
    
    # Format the student data for the frontend
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
        "passportImage": student.get("passport_image", "/placeholder.svg?height=200&width=200")
    }
    
    return jsonify(formatted_student), 200

@students_bp.route('/me', methods=['PUT'])
@jwt_required()
@student_required
def update_my_profile():
    """Update the profile of the currently logged-in student"""
    current_user = get_jwt_identity()
    student_id = current_user.get('id')
    
    data = request.get_json()
    
    # Validate the incoming data
    errors = validate_student_profile(data)
    if errors:
        return jsonify({"errors": errors}), 400
    
    # Convert frontend field names to backend field names
    backend_data = {
        "name": data.get("name"),
        "email": data.get("email"),
        "phone": data.get("phone"),
        "date_of_birth": data.get("dateOfBirth"),
        "gender": data.get("gender"),
        "address": data.get("address"),
        "major": data.get("major"),
        "student_id": data.get("studentId"),
        "enrollment_year": data.get("enrollmentYear"),
        "expected_graduation_year": data.get("expectedGraduationYear")
    }
    
    # Remove None values
    backend_data = {k: v for k, v in backend_data.items() if v is not None}
    
    updated = StudentService.update_student(student_id, backend_data)
    if not updated:
        return jsonify({"message": "Failed to update student profile"}), 500
    
    # Get the updated student data
    updated_student = StudentService.get_student_by_id(student_id)
    
    # Format the student data for the frontend
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
        "passportImage": updated_student.get("passport_image", "/placeholder.svg?height=200&width=200")
    }
    
    return jsonify(formatted_student), 200

@students_bp.route('/me/passport-image', methods=['POST'])
@jwt_required()
@student_required
def upload_passport_image():
    """Upload a passport image for the currently logged-in student"""
    current_user = get_jwt_identity()
    student_id = current_user.get('id')
    
    if 'passportImage' not in request.files:
        return jsonify({"message": "No image file provided"}), 400
    
    file = request.files['passportImage']
    
    if file.filename == '':
        return jsonify({"message": "No image file selected"}), 400
    
    if file:
        # Secure the filename and save the file
        filename = secure_filename(f"{student_id}_passport.jpg")
        
        # Ensure the upload directory exists
        upload_dir = os.path.join(os.getcwd(), 'app', 'static', 'uploads', 'passport_images')
        os.makedirs(upload_dir, exist_ok=True)
        
        file_path = os.path.join(upload_dir, filename)
        file.save(file_path)
        
        # Generate the URL for the image
        image_url = f"/static/uploads/passport_images/{filename}"
        
        # Update the student's profile with the new image URL
        StudentService.update_student(student_id, {"passport_image": image_url})
        
        return jsonify({"imageUrl": image_url}), 200
    
    return jsonify({"message": "Failed to upload image"}), 500

@students_bp.route('/me/applications', methods=['GET'])
@jwt_required()
@student_required
def get_my_applications():
    """Get all job applications for the currently logged-in student"""
    current_user = get_jwt_identity()
    student_id = current_user.get('id')
    
    applications = StudentService.get_student_applications(student_id)
    return jsonify(applications), 200
