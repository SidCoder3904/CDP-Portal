# app/routes/students.py
from flask import Blueprint, request, jsonify, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.student_service import StudentService
from app.services.job_service import JobService
from app.utils.auth import student_required
from app.utils.validators import validate_student_profile, validate_education
# from app.utils.validators import validate_experience, validate_position, validate_project, validate_resume
from werkzeug.utils import secure_filename
import os
from bson.objectid import ObjectId
from bson.json_util import dumps, loads
import json
from datetime import datetime


students_bp = Blueprint('students', __name__)

# Helper function to convert MongoDB ObjectId to string in JSON responses
def json_response(data):
    return json.loads(dumps(data))

# Basic Profile Routes
@students_bp.route('/me', methods=['GET'])
@jwt_required()
@student_required
def get_my_profile():
    """Get the profile of the currently logged-in student"""
    current_user = get_jwt_identity()
    user_id = current_user.get('id')
    student_id = StudentService.get_student_id_by_user_id(user_id)
    
    student = StudentService.get_student_by_id(student_id)
    # print("Student:", student)
    if not student:
        return jsonify({"message": "Student not found"}), 404
    
    # Get verification status
    verification_status = StudentService.get_verification_status(student_id)
    print("Verification status:", verification_status)
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
        "passportImage": student.get("passport_image", "/placeholder.svg?height=200&width=200"),
        "verificationStatus": verification_status
    }
    
    return jsonify(formatted_student), 200

@students_bp.route('/me', methods=['PUT'])
@jwt_required()
@student_required
def update_my_profile():
    """Update the profile of the currently logged-in student"""
    current_user = get_jwt_identity()
    user_id = current_user.get('id')
    student_id = StudentService.get_student_id_by_user_id(user_id)
    
    data = request.get_json()
    # print("Received data:", data)
    # Validate the incoming data
    errors = validate_student_profile(data)
    if errors:
        print("Errors:", errors)
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
    # print("Backend data:", backend_data)
    updated = StudentService.update_student(student_id, backend_data)
    if not updated:
        return jsonify({"message": "Failed to update student profile"}), 500
    print("Updated student profile")
    # Get the updated student data
    updated_student = StudentService.get_student_by_id(student_id)
    verification_status = StudentService.get_verification_status(student_id)
    print("Verification status:", verification_status)
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
        "passportImage": updated_student.get("passport_image", "/placeholder.svg?height=200&width=200"),
        "verificationStatus": verification_status
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
        StudentService.update_student_by_user_id(student_id, {"passport_image": image_url})
        
        return jsonify({"imageUrl": image_url}), 200
    
    return jsonify({"message": "Failed to upload image"}), 500

# Education Routes
@students_bp.route('/me/education', methods=['GET'])
@jwt_required()
@student_required
def get_my_education():
    """Get all education records for the current student"""
    current_user = get_jwt_identity()
    user_id = current_user.get('id')
    student_id = StudentService.get_student_id_by_user_id(user_id)
    
    education_records = StudentService.get_education_by_student_id(student_id)
    
    # Format for frontend
    formatted_records = []
    for record in education_records:
        formatted_record = {
            "id": str(record.get("_id")),
            "degree": record.get("degree", ""),
            "institution": record.get("institution", ""),
            "year": record.get("year", ""),
            "gpa": record.get("gpa", ""),
            "major": record.get("major", ""),
            "minor": record.get("minor", ""),
            "relevantCourses": record.get("relevant_courses", ""),
            "honors": record.get("honors", ""),
            "isVerified": record.get("is_verified", {})
        }
        formatted_records.append(formatted_record)
    
    return jsonify(formatted_records), 200

@students_bp.route('/me/education', methods=['POST'])
@jwt_required()
@student_required
def add_education():
    """Add a new education record for the current student"""
    current_user = get_jwt_identity()
    user_id = current_user.get('id')
    student_id = StudentService.get_student_id_by_user_id(user_id)
    
    data = request.get_json()
    
    # Validate the incoming data
    # errors = validate_education(data)
    # if errors:
    #     return jsonify({"errors": errors}), 400
    
    # Convert frontend field names to backend field names
    backend_data = {
        "student_id": student_id,
        "degree": data.get("degree"),
        "institution": data.get("institution"),
        "year": data.get("year"),
        "gpa": data.get("gpa"),
        "major": data.get("major"),
        "minor": data.get("minor"),
        "relevant_courses": data.get("relevantCourses"),
        "honors": data.get("honors"),
        "is_verified": {
            "degree": False,
            "institution": False,
            "year": False,
            "gpa": False,
            "major": False,
            "minor": False,
            "relevant_courses": False,
            "honors": False
        }
    }
    
    # Remove None values
    backend_data = {k: v for k, v in backend_data.items() if v is not None}
    
    education_id = StudentService.add_education(backend_data)
    if not education_id:
        return jsonify({"message": "Failed to add education record"}), 500
    
    # Get the newly created education record
    education = StudentService.get_education_by_id(education_id)
    
    # Format for frontend
    formatted_education = {
        "id": str(education.get("_id")),
        "degree": education.get("degree", ""),
        "institution": education.get("institution", ""),
        "year": education.get("year", ""),
        "gpa": education.get("gpa", ""),
        "major": education.get("major", ""),
        "minor": education.get("minor", ""),
        "relevantCourses": education.get("relevant_courses", ""),
        "honors": education.get("honors", ""),
        "isVerified": education.get("is_verified", {})
    }
    
    return jsonify(formatted_education), 201

@students_bp.route('/me/education/<education_id>', methods=['PUT'])
@jwt_required()
@student_required
def update_education(education_id):
    """Update an education record for the current student"""
    current_user = get_jwt_identity()
    user_id = current_user.get('id')
    student_id = StudentService.get_student_id_by_user_id(user_id)
    data = request.get_json()
    
    # Validate the incoming data
    # errors = validate_education(data)
    # if errors:
    #     return jsonify({"errors": errors}), 400
    
    # Check if the education record belongs to the student
    education = StudentService.get_education_by_id(education_id)
    # print("Education:", education)
    if not education or str(education.get("student_id")) != str(student_id):
        return jsonify({"message": "Education record not found or access denied"}), 404
    # Convert frontend field names to backend field names
    backend_data = {
        "degree": data.get("degree"),
        "institution": data.get("institution"),
        "year": data.get("year"),
        "gpa": data.get("gpa"),
        "major": data.get("major"),
        "minor": data.get("minor"),
        "relevant_courses": data.get("relevantCourses"),
        "honors": data.get("honors")
    }
    
    # Remove None values
    backend_data = {k: v for k, v in backend_data.items() if v is not None}
    
    updated = StudentService.update_education(education_id, backend_data)
    if not updated:
        return jsonify({"message": "Failed to update education record"}), 500
    
    # Get the updated education record
    updated_education = StudentService.get_education_by_id(education_id)
    
    # Format for frontend
    formatted_education = {
        "id": str(updated_education.get("_id")),
        "degree": updated_education.get("degree", ""),
        "institution": updated_education.get("institution", ""),
        "year": updated_education.get("year", ""),
        "gpa": updated_education.get("gpa", ""),
        "major": updated_education.get("major", ""),
        "minor": updated_education.get("minor", ""),
        "relevantCourses": updated_education.get("relevant_courses", ""),
        "honors": updated_education.get("honors", ""),
        "isVerified": updated_education.get("is_verified", {})
    }
    
    return jsonify(formatted_education), 200

@students_bp.route('/me/education/<education_id>', methods=['DELETE'])
@jwt_required()
@student_required
def delete_education(education_id):
    """Delete an education record for the current student"""
    current_user = get_jwt_identity()
    user_id = current_user.get('id')
    student_id = StudentService.get_student_id_by_user_id(user_id)
    # Check if the education record belongs to the student
    education = StudentService.get_education_by_id(education_id)
    if not education or str(education.get("student_id")) != str(student_id):
        return jsonify({"message": "Education record not found or access denied"}), 404
    
    deleted = StudentService.delete_education(education_id)
    if not deleted:
        return jsonify({"message": "Failed to delete education record"}), 500
    
    return jsonify({"message": "Education record deleted successfully"}), 200

# Experience Routes
@students_bp.route('/me/experience', methods=['GET'])
@jwt_required()
@student_required
def get_my_experience():
    """Get all experience records for the current student"""
    current_user = get_jwt_identity()
    user_id = current_user.get('id')
    student_id = StudentService.get_student_id_by_user_id(user_id)
    
    experience_records = StudentService.get_experience_by_student_id(student_id)
    
    # Format for frontend
    formatted_records = []
    for record in experience_records:
        formatted_record = {
            "id": str(record.get("_id")),
            "company": record.get("company", ""),
            "position": record.get("position", ""),
            "duration": record.get("duration", ""),
            "description": record.get("description", ""),
            "technologies": record.get("technologies", ""),
            "achievements": record.get("achievements", ""),
            "skills": record.get("skills", ""),
            "isVerified": record.get("is_verified", {})
        }
        formatted_records.append(formatted_record)
    
    return jsonify(formatted_records), 200

@students_bp.route('/me/experience', methods=['POST'])
@jwt_required()
@student_required
def add_experience():
    """Add a new experience record for the current student"""
    current_user = get_jwt_identity()
    user_id = current_user.get('id')
    student_id = StudentService.get_student_id_by_user_id(user_id)
    
    data = request.get_json()
    
    # Validate the incoming data
    # errors = validate_experience(data)
    # if errors:
    #     return jsonify({"errors": errors}), 400
    
    # Convert frontend field names to backend field names
    backend_data = {
        "student_id": student_id,
        "company": data.get("company"),
        "position": data.get("position"),
        "duration": data.get("duration"),
        "description": data.get("description"),
        "technologies": data.get("technologies"),
        "achievements": data.get("achievements"),
        "skills": data.get("skills"),
        "is_verified": {
            "company": False,
            "position": False,
            "duration": False,
            "description": False,
            "technologies": False,
            "achievements": False,
            "skills": False
        }
    }
    
    # Remove None values
    backend_data = {k: v for k, v in backend_data.items() if v is not None}
    
    experience_id = StudentService.add_experience(backend_data)
    if not experience_id:
        return jsonify({"message": "Failed to add experience record"}), 500
    
    # Get the newly created experience record
    experience = StudentService.get_experience_by_id(experience_id)
    
    # Format for frontend
    formatted_experience = {
        "id": str(experience.get("_id")),
        "company": experience.get("company", ""),
        "position": experience.get("position", ""),
        "duration": experience.get("duration", ""),
        "description": experience.get("description", ""),
        "technologies": experience.get("technologies", ""),
        "achievements": experience.get("achievements", ""),
        "skills": experience.get("skills", ""),
        "isVerified": experience.get("is_verified", {})
    }
    
    return jsonify(formatted_experience), 201

@students_bp.route('/me/experience/<experience_id>', methods=['PUT'])
@jwt_required()
@student_required
def update_experience(experience_id):
    """Update an experience record for the current student"""
    current_user = get_jwt_identity()
    user_id = current_user.get('id')
    student_id = StudentService.get_student_id_by_user_id(user_id)
    
    data = request.get_json()
    
    # Validate the incoming data
    # errors = validate_experience(data)
    # if errors:
    #     return jsonify({"errors": errors}), 400
    
    # Check if the experience record belongs to the student
    experience = StudentService.get_experience_by_id(experience_id)
    if not experience or str(experience.get("student_id")) != str(student_id):
        return jsonify({"message": "Experience record not found or access denied"}), 404
    
    # Convert frontend field names to backend field names
    backend_data = {
        "company": data.get("company"),
        "position": data.get("position"),
        "duration": data.get("duration"),
        "description": data.get("description"),
        "technologies": data.get("technologies"),
        "achievements": data.get("achievements"),
        "skills": data.get("skills")
    }
    
    # Remove None values
    backend_data = {k: v for k, v in backend_data.items() if v is not None}
    
    updated = StudentService.update_experience(experience_id, backend_data)
    if not updated:
        return jsonify({"message": "Failed to update experience record"}), 500
    
    # Get the updated experience record
    updated_experience = StudentService.get_experience_by_id(experience_id)
    
    # Format for frontend
    formatted_experience = {
        "id": str(updated_experience.get("_id")),
        "company": updated_experience.get("company", ""),
        "position": updated_experience.get("position", ""),
        "duration": updated_experience.get("duration", ""),
        "description": updated_experience.get("description", ""),
        "technologies": updated_experience.get("technologies", ""),
        "achievements": updated_experience.get("achievements", ""),
        "skills": updated_experience.get("skills", ""),
        "isVerified": updated_experience.get("is_verified", {})
    }
    
    return jsonify(formatted_experience), 200

@students_bp.route('/me/experience/<experience_id>', methods=['DELETE'])
@jwt_required()
@student_required
def delete_experience(experience_id):
    """Delete an experience record for the current student"""
    current_user = get_jwt_identity()
    user_id = current_user.get('id')
    student_id = StudentService.get_student_id_by_user_id(user_id)
    
    # Check if the experience record belongs to the student
    experience = StudentService.get_experience_by_id(experience_id)
    if not experience or str(experience.get("student_id")) != str(student_id):
        return jsonify({"message": "Experience record not found or access denied"}), 404
    
    deleted = StudentService.delete_experience(experience_id)
    if not deleted:
        return jsonify({"message": "Failed to delete experience record"}), 500
    
    return jsonify({"message": "Experience record deleted successfully"}), 200

# Positions Routes
@students_bp.route('/me/positions', methods=['GET'])
@jwt_required()
@student_required
def get_my_positions():
    """Get all position records for the current student"""
    current_user = get_jwt_identity()
    user_id = current_user.get('id')
    student_id = StudentService.get_student_id_by_user_id(user_id)
    
    position_records = StudentService.get_positions_by_student_id(student_id)
    
    # Format for frontend
    formatted_records = []
    for record in position_records:
        formatted_record = {
            "id": str(record.get("_id")),
            "title": record.get("title", ""),
            "organization": record.get("organization", ""),
            "duration": record.get("duration", ""),
            "description": record.get("description", ""),
            "responsibilities": record.get("responsibilities", ""),
            "achievements": record.get("achievements", ""),
            "isVerified": record.get("is_verified", {})
        }
        formatted_records.append(formatted_record)
    
    return jsonify(formatted_records), 200

@students_bp.route('/me/positions', methods=['POST'])
@jwt_required()
@student_required
def add_position():
    """Add a new position record for the current student"""
    current_user = get_jwt_identity()
    user_id = current_user.get('id')
    student_id = StudentService.get_student_id_by_user_id(user_id)
    
    data = request.get_json()
    
    # Validate the incoming data
    # errors = validate_position(data)
    # if errors:
    #     return jsonify({"errors": errors}), 400
    
    # Convert frontend field names to backend field names
    backend_data = {
        "student_id": student_id,
        "title": data.get("title"),
        "organization": data.get("organization"),
        "duration": data.get("duration"),
        "description": data.get("description"),
        "responsibilities": data.get("responsibilities"),
        "achievements": data.get("achievements"),
        "is_verified": {
            "title": False,
            "organization": False,
            "duration": False,
            "description": False,
            "responsibilities": False,
            "achievements": False
        }
    }
    
    # Remove None values
    backend_data = {k: v for k, v in backend_data.items() if v is not None}
    
    position_id = StudentService.add_position(backend_data)
    if not position_id:
        return jsonify({"message": "Failed to add position record"}), 500
    
    # Get the newly created position record
    position = StudentService.get_position_by_id(position_id)
    
    # Format for frontend
    formatted_position = {
        "id": str(position.get("_id")),
        "title": position.get("title", ""),
        "organization": position.get("organization", ""),
        "duration": position.get("duration", ""),
        "description": position.get("description", ""),
        "responsibilities": position.get("responsibilities", ""),
        "achievements": position.get("achievements", ""),
        "isVerified": position.get("is_verified", {})
    }
    
    return jsonify(formatted_position), 201

@students_bp.route('/me/positions/<position_id>', methods=['PUT'])
@jwt_required()
@student_required
def update_position(position_id):
    """Update a position record for the current student"""
    current_user = get_jwt_identity()
    user_id = current_user.get('id')
    student_id = StudentService.get_student_id_by_user_id(user_id)
    
    data = request.get_json()
    
    # Validate the incoming data
    # errors = validate_position(data)
    # if errors:
    #     return jsonify({"errors": errors}), 400
    
    # Check if the position record belongs to the student
    position = StudentService.get_position_by_id(position_id)
    if not position or str(position.get("student_id")) != str(student_id):
        return jsonify({"message": "Position record not found or access denied"}), 404
    
    # Convert frontend field names to backend field names
    backend_data = {
        "title": data.get("title"),
        "organization": data.get("organization"),
        "duration": data.get("duration"),
        "description": data.get("description"),
        "responsibilities": data.get("responsibilities"),
        "achievements": data.get("achievements")
    }
    
    # Remove None values
    backend_data = {k: v for k, v in backend_data.items() if v is not None}
    
    updated = StudentService.update_position(position_id, backend_data)
    if not updated:
        return jsonify({"message": "Failed to update position record"}), 500
    
    # Get the updated position record
    updated_position = StudentService.get_position_by_id(position_id)
    
    # Format for frontend
    formatted_position = {
        "id": str(updated_position.get("_id")),
        "title": updated_position.get("title", ""),
        "organization": updated_position.get("organization", ""),
        "duration": updated_position.get("duration", ""),
        "description": updated_position.get("description", ""),
        "responsibilities": updated_position.get("responsibilities", ""),
        "achievements": updated_position.get("achievements", ""),
        "isVerified": updated_position.get("is_verified", {})
    }
    
    return jsonify(formatted_position), 200

@students_bp.route('/me/positions/<position_id>', methods=['DELETE'])
@jwt_required()
@student_required
def delete_position(position_id):
    """Delete a position record for the current student"""
    current_user = get_jwt_identity()
    user_id = current_user.get('id')
    student_id = StudentService.get_student_id_by_user_id(user_id)
    
    # Check if the position record belongs to the student
    position = StudentService.get_position_by_id(position_id)
    if not position or str(position.get("student_id")) != str(student_id):
        return jsonify({"message": "Position record not found or access denied"}), 404
    
    deleted = StudentService.delete_position(position_id)
    if not deleted:
        return jsonify({"message": "Failed to delete position record"}), 500
    
    return jsonify({"message": "Position record deleted successfully"}), 200

# Projects Routes
@students_bp.route('/me/projects', methods=['GET'])
@jwt_required()
@student_required
def get_my_projects():
    """Get all project records for the current student"""
    current_user = get_jwt_identity()
    user_id = current_user.get('id')
    student_id = StudentService.get_student_id_by_user_id(user_id)
    
    project_records = StudentService.get_projects_by_student_id(student_id)
    
    # Format for frontend
    formatted_records = []
    for record in project_records:
        formatted_record = {
            "id": str(record.get("_id")),
            "name": record.get("name", ""),
            "description": record.get("description", ""),
            "technologies": record.get("technologies", ""),
            "duration": record.get("duration", ""),
            "role": record.get("role", ""),
            "teamSize": record.get("team_size", ""),
            "githubLink": record.get("github_link", ""),
            "demoLink": record.get("demo_link", ""),
            "isVerified": record.get("is_verified", {})
        }
        formatted_records.append(formatted_record)
    
    return jsonify(formatted_records), 200

@students_bp.route('/me/projects', methods=['POST'])
@jwt_required()
@student_required
def add_project():
    """Add a new project record for the current student"""
    current_user = get_jwt_identity()
    user_id = current_user.get('id')
    student_id = StudentService.get_student_id_by_user_id(user_id)
    
    data = request.get_json()
    
    # Validate the incoming data
    # errors = validate_project(data)
    # if errors:
    #     return jsonify({"errors": errors}), 400
    
    # Convert frontend field names to backend field names
    backend_data = {
        "student_id": student_id,
        "name": data.get("name"),
        "description": data.get("description"),
        "technologies": data.get("technologies"),
        "duration": data.get("duration"),
        "role": data.get("role"),
        "team_size": data.get("teamSize"),
        "github_link": data.get("githubLink"),
        "demo_link": data.get("demoLink"),
        "is_verified": {
            "name": False,
            "description": False,
            "technologies": False,
            "duration": False,
            "role": False,
            "team_size": False,
            "github_link": False,
            "demo_link": False
        }
    }
    
    # Remove None values
    backend_data = {k: v for k, v in backend_data.items() if v is not None}
    
    project_id = StudentService.add_project(backend_data)
    if not project_id:
        return jsonify({"message": "Failed to add project record"}), 500
    
    # Get the newly created project record
    project = StudentService.get_project_by_id(project_id)
    
    # Format for frontend
    formatted_project = {
        "id": str(project.get("_id")),
        "name": project.get("name", ""),
        "description": project.get("description", ""),
        "technologies": project.get("technologies", ""),
        "duration": project.get("duration", ""),
        "role": project.get("role", ""),
        "teamSize": project.get("team_size", ""),
        "githubLink": project.get("github_link", ""),
        "demoLink": project.get("demo_link", ""),
        "isVerified": project.get("is_verified", {})
    }
    
    return jsonify(formatted_project), 201

@students_bp.route('/me/projects/<project_id>', methods=['PUT'])
@jwt_required()
@student_required
def update_project(project_id):
    """Update a project record for the current student"""
    current_user = get_jwt_identity()
    user_id = current_user.get('id')
    student_id = StudentService.get_student_id_by_user_id(user_id)
    
    data = request.get_json()
    
    # Validate the incoming data
    # errors = validate_project(data)
    # if errors:
    #     return jsonify({"errors": errors}), 400
    
    # Check if the project record belongs to the student
    project = StudentService.get_project_by_id(project_id)
    if not project or str(project.get("student_id")) != str(student_id):
        return jsonify({"message": "Project record not found or access denied"}), 404
    
    # Convert frontend field names to backend field names
    backend_data = {
        "name": data.get("name"),
        "description": data.get("description"),
        "technologies": data.get("technologies"),
        "duration": data.get("duration"),
        "role": data.get("role"),
        "team_size": data.get("teamSize"),
        "github_link": data.get("githubLink"),
        "demo_link": data.get("demoLink")
    }
    
    # Remove None values
    backend_data = {k: v for k, v in backend_data.items() if v is not None}
    
    updated = StudentService.update_project(project_id, backend_data)
    if not updated:
        return jsonify({"message": "Failed to update project record"}), 500
    
    # Get the updated project record
    updated_project = StudentService.get_project_by_id(project_id)
    
    # Format for frontend
    formatted_project = {
        "id": str(updated_project.get("_id")),
        "name": updated_project.get("name", ""),
        "description": updated_project.get("description", ""),
        "technologies": updated_project.get("technologies", ""),
        "duration": updated_project.get("duration", ""),
        "role": updated_project.get("role", ""),
        "teamSize": updated_project.get("team_size", ""),
        "githubLink": updated_project.get("github_link", ""),
        "demoLink": updated_project.get("demo_link", ""),
        "isVerified": updated_project.get("is_verified", {})
    }
    
    return jsonify(formatted_project), 200

@students_bp.route('/me/projects/<project_id>', methods=['DELETE'])
@jwt_required()
@student_required
def delete_project(project_id):
    """Delete a project record for the current student"""
    current_user = get_jwt_identity()
    user_id = current_user.get('id')
    student_id = StudentService.get_student_id_by_user_id(user_id)
    
    # Check if the project record belongs to the student
    project = StudentService.get_project_by_id(project_id)
    if not project or str(project.get("student_id")) != str(student_id):
        return jsonify({"message": "Project record not found or access denied"}), 404
    
    deleted = StudentService.delete_project(project_id)
    if not deleted:
        return jsonify({"message": "Failed to delete project record"}), 500
    
    return jsonify({"message": "Project record deleted successfully"}), 200

# Resume Routes
@students_bp.route('/me/resumes', methods=['GET'])
@jwt_required()
@student_required
def get_my_resumes():
    """Get all resumes for the current student"""
    current_user = get_jwt_identity()
    user_id = current_user.get('id')
    student_id = StudentService.get_student_id_by_user_id(user_id)
    
    resumes = StudentService.get_resumes_by_student_id(student_id)
    
    # Format for frontend
    formatted_resumes = []
    for resume in resumes:
        formatted_resume = {
            "id": str(resume.get("_id")),
            "resumeName": resume.get("resume_name", ""),
            "jobProfile": resume.get("job_profile", ""),
            "fileName": resume.get("file_name", ""),
            "uploadDate": resume.get("upload_date", ""),
            "fileSize": resume.get("file_size", ""),
            "fileUrl": resume.get("file_url", "")
        }
        formatted_resumes.append(formatted_resume)
    
    return jsonify(formatted_resumes), 200

@students_bp.route('/me/resumes/<resume_id>', methods=['GET'])
@jwt_required()
@student_required
def get_resume_by_id(resume_id):
    """Get a specific resume by ID"""
    current_user = get_jwt_identity()
    user_id = current_user.get('id')
    student_id = StudentService.get_student_id_by_user_id(user_id)
    
    resume = StudentService.get_resume_by_id(resume_id)
    
    if not resume or str(resume.get("student_id")) != str(student_id):
        return jsonify({"message": "Resume not found or access denied"}), 404
    
    # Format for frontend
    formatted_resume = {
        "id": str(resume.get("_id")),
        "resumeName": resume.get("resume_name", ""),
        "jobProfile": resume.get("job_profile", ""),
        "fileName": resume.get("file_name", ""),
        "uploadDate": resume.get("upload_date", ""),
        "fileSize": resume.get("file_size", ""),
        "fileUrl": resume.get("file_url", "")
    }
    
    return jsonify(formatted_resume), 200

@students_bp.route('/me/resumes', methods=['POST'])
@jwt_required()
@student_required
def upload_resume():
    """Upload a new resume for the current student"""
    current_user = get_jwt_identity()
    user_id = current_user.get('id')
    student_id = StudentService.get_student_id_by_user_id(user_id)
    
    # Check if user already has 3 resumes
    existing_resumes_count = StudentService.count_resumes_by_student_id(student_id)
    if existing_resumes_count >= 3:
        return jsonify({"message": "Maximum limit of 3 resumes reached. Please delete a resume before adding a new one."}), 400
    
    if 'resume' not in request.files:
        return jsonify({"message": "No file part"}), 400
    
    resume_name = request.form.get('resumeName', 'Default Resume')
    job_profile = request.form.get('jobProfile', 'General')
    
    # Check if a resume with this name already exists for the user
    existing_resume = StudentService.get_resume_by_name(student_id, resume_name)
    if existing_resume:
        return jsonify({"message": f"A resume with the name '{resume_name}' already exists. Please choose a different name."}), 400
    
    file = request.files['resume']
    
    if file.filename == '':
        return jsonify({"message": "No selected file"}), 400
    
    if file:
        # Secure the filename and save the file
        filename = secure_filename(f"{student_id}_{resume_name}_{file.filename}")
        
        # Ensure the upload directory exists
        upload_dir = os.path.join(os.getcwd(), 'app', 'static', 'uploads', 'resumes')
        os.makedirs(upload_dir, exist_ok=True)
        
        file_path = os.path.join(upload_dir, filename)
        file.save(file_path)
        
        # Get file size in MB
        file_size = f"{os.path.getsize(file_path) / (1024 * 1024):.2f} MB"
        
        # Create new resume record
        resume_data = {
            "student_id": student_id,
            "resume_name": resume_name,
            "job_profile": job_profile,
            "file_name": file.filename,
            "upload_date": datetime.utcnow().strftime('%Y-%m-%d'),
            "file_size": file_size,
            "file_url": f"/static/uploads/resumes/{filename}"
        }
        
        resume_id = StudentService.add_resume(resume_data)
        if not resume_id:
            return jsonify({"message": "Failed to upload resume"}), 500
        
        # Get the newly created resume
        resume = StudentService.get_resume_by_id(resume_id)
        
        # Format for frontend
        formatted_resume = {
            "id": str(resume.get("_id")),
            "resumeName": resume.get("resume_name", ""),
            "jobProfile": resume.get("job_profile", ""),
            "fileName": resume.get("file_name", ""),
            "uploadDate": resume.get("upload_date", ""),
            "fileSize": resume.get("file_size", ""),
            "fileUrl": resume.get("file_url", "")
        }
        
        return jsonify(formatted_resume), 201
    
    return jsonify({"message": "Failed to upload resume"}), 400

@students_bp.route('/me/resumes/<resume_id>', methods=['PUT'])
@jwt_required()
@student_required
def update_resume(resume_id):
    """Update resume details (name and job profile)"""
    current_user = get_jwt_identity()
    user_id = current_user.get('id')
    student_id = StudentService.get_student_id_by_user_id(user_id)
    
    data = request.get_json()
    
    # Validate the incoming data
    # errors = validate_resume(data)
    # if errors:
    #     return jsonify({"errors": errors}), 400
    
    resume = StudentService.get_resume_by_id(resume_id)
    
    if not resume or str(resume.get("student_id")) != str(student_id):
        return jsonify({"message": "Resume not found or access denied"}), 404
    
    # Check if the new name already exists for another resume
    if 'resumeName' in data and data['resumeName'] != resume.get("resume_name"):
        existing_resume = StudentService.get_resume_by_name(student_id, data['resumeName'])
        if existing_resume and str(existing_resume.get("_id")) != resume_id:
            return jsonify({"message": f"A resume with the name '{data['resumeName']}' already exists. Please choose a different name."}), 400
    
    # Convert frontend field names to backend field names
    backend_data = {}
    if 'resumeName' in data:
        backend_data["resume_name"] = data["resumeName"]
    if 'jobProfile' in data:
        backend_data["job_profile"] = data["jobProfile"]
    
    updated = StudentService.update_resume(resume_id, backend_data)
    if not updated:
        return jsonify({"message": "Failed to update resume"}), 500
    
    # Get the updated resume
    updated_resume = StudentService.get_resume_by_id(resume_id)
    
    # Format for frontend
    formatted_resume = {
        "id": str(updated_resume.get("_id")),
        "resumeName": updated_resume.get("resume_name", ""),
        "jobProfile": updated_resume.get("job_profile", ""),
        "fileName": updated_resume.get("file_name", ""),
        "uploadDate": updated_resume.get("upload_date", ""),
        "fileSize": updated_resume.get("file_size", ""),
        "fileUrl": updated_resume.get("file_url", "")
    }
    
    return jsonify(formatted_resume), 200

@students_bp.route('/me/resumes/<resume_id>', methods=['DELETE'])
@jwt_required()
@student_required
def delete_resume(resume_id):
    """Delete a resume"""
    current_user = get_jwt_identity()
    user_id = current_user.get('id')
    student_id = StudentService.get_student_id_by_user_id(user_id)
    
    resume = StudentService.get_resume_by_id(resume_id)
    
    if not resume or str(resume.get("student_id")) != str(student_id):
        return jsonify({"message": "Resume not found or access denied"}), 404
    
    # Delete the file from the filesystem
    if resume.get("file_url"):
        file_path = os.path.join(os.getcwd(), 'app', 'static', resume.get("file_url").lstrip('/static/'))
        if os.path.exists(file_path):
            os.remove(file_path)
    
    deleted = StudentService.delete_resume(resume_id)
    if not deleted:
        return jsonify({"message": "Failed to delete resume"}), 500
    
    return jsonify({"message": "Resume deleted successfully"}), 200

@students_bp.route('/download-resume/<resume_id>', methods=['GET'])
@jwt_required()
def download_resume(resume_id):
    """Download a resume"""
    current_user = get_jwt_identity()
    user_id = current_user.get('id')
    student_id = StudentService.get_student_id_by_user_id(user_id)
    
    resume = StudentService.get_resume_by_id(resume_id)
    
    if not resume:
        return jsonify({"message": "Resume not found"}), 404
    
    # Check if the resume belongs to the student or if the user is an admin
    if str(resume.get("student_id")) != str(student_id) and current_user.get('role') != 'admin':
        return jsonify({"message": "Access denied"}), 403
    
    # Extract the actual filename from the URL
    file_url = resume.get("file_url", "")
    if not file_url:
        return jsonify({"message": "File not found"}), 404
    
    file_path = os.path.join(os.getcwd(), 'app', 'static', file_url.lstrip('/static/'))
    
    if not os.path.exists(file_path):
        return jsonify({"message": "File not found"}), 404
    
    return send_file(file_path, as_attachment=True, download_name=resume.get("file_name"))

@students_bp.route('/me/applications', methods=['GET'])
@jwt_required()
@student_required
def get_my_applications():
    """Get all applications submitted by the current student"""
    current_user = get_jwt_identity()
    user_id = current_user.get('id')
    student_id = StudentService.get_student_id_by_user_id(user_id)
    
    applications = JobService.get_applications_by_student(student_id)
    
    # Convert ObjectId to string for JSON serialization
    return json_response(applications), 200