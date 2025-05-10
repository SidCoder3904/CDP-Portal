# app/routes/students.py
from flask import Blueprint, current_app, request, jsonify, send_file
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
from app.utils.cloudinary_config import upload_file, delete_file, generate_public_id, upload_profile_picture
from app.services.document_service import DocumentService


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
    if not student:
        return jsonify({"message": "Student not found"}), 404
    
    # Get verification status
    verification_status = StudentService.get_verification_status(student_id)
    print("Verification status:", verification_status)
    # Get the passport image URL from Cloudinary if it exists
    passport_image = student.get("passport_image")
    if passport_image and not passport_image.startswith("http"):
        # If it's not a Cloudinary URL, use the placeholder
        passport_image = "/placeholder.svg?height=200&width=200"
    
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
        "passportImage": passport_image,
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
    
    # Handle verification status updates
    verification_updates = {}
    if data.get("verificationStatus"):
        verification_status = data.get("verificationStatus")
        print("Verification status from frontend:", verification_status)
        
        # Map frontend field names to backend field names for verification
        field_mapping = {
            "name": "name",
            "email": "email",
            "phone": "phone",
            "dateOfBirth": "date_of_birth",
            "gender": "gender",
            "address": "address",
            "major": "major",
            "studentId": "student_id",
            "enrollmentYear": "enrollment_year",
            "expectedGraduationYear": "expected_graduation_year",
            "passportImage": "passport_image"
        }
        
        # For each field in verification status, update verification
        for frontend_field, status in verification_status.items():
            if frontend_field in field_mapping:
                backend_field = field_mapping[frontend_field]
                verification_updates[f"verification.{backend_field}.status"] = status
    
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
    
    # Merge verification updates with other updates
    backend_data.update(verification_updates)
    
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
    user_id = current_user.get('id')
    
    if 'passportImage' not in request.files:
        return jsonify({"message": "No image file provided"}), 400
    
    file = request.files['passportImage']
    
    if file.filename == '':
        return jsonify({"message": "No image file selected"}), 400
    
    if file:
        try:
            # Get the current student to check for existing passport image
            student = StudentService.get_student_by_id(user_id)
            previous_public_id = student.get('passport_image_public_id') if student else None
            
            # Upload to Cloudinary
            upload_result = upload_profile_picture(
                file=file,
                user_id=str(user_id),
                delete_previous=True,
                previous_public_id=previous_public_id
            )
            
            # Update the student's profile with the new image URL and public ID
            StudentService.update_student_by_user_id(user_id, {
                "passport_image": upload_result['view_url'],
                "passport_image_public_id": upload_result['public_id']
            })
            
            return jsonify({"imageUrl": upload_result['view_url']}), 200
            
        except Exception as e:
            print(f"Passport image upload error: {str(e)}")
            return jsonify({"message": f"Failed to upload image: {str(e)}"}), 500
    
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
            "education_details": {
                "degree": {
                    "current_value": record.get("education_details", {}).get("degree", {}).get("current_value", ""),
                    "last_verified_value": record.get("education_details", {}).get("degree", {}).get("last_verified_value", "")
                },
                "institution": {
                    "current_value": record.get("education_details", {}).get("institution", {}).get("current_value", ""),
                    "last_verified_value": record.get("education_details", {}).get("institution", {}).get("last_verified_value", "")
                },
                "year": {
                    "current_value": record.get("education_details", {}).get("year", {}).get("current_value", ""),
                    "last_verified_value": record.get("education_details", {}).get("year", {}).get("last_verified_value", "")
                },
                "gpa": {
                    "current_value": record.get("education_details", {}).get("gpa", {}).get("current_value", ""),
                    "last_verified_value": record.get("education_details", {}).get("gpa", {}).get("last_verified_value", "")
                },
                "major": {
                    "current_value": record.get("education_details", {}).get("major", {}).get("current_value", ""),
                    "last_verified_value": record.get("education_details", {}).get("major", {}).get("last_verified_value", "")
                },
                "minor": {
                    "current_value": record.get("education_details", {}).get("minor", {}).get("current_value", ""),
                    "last_verified_value": record.get("education_details", {}).get("minor", {}).get("last_verified_value", "")
                },
                "relevant_courses": {
                    "current_value": record.get("education_details", {}).get("relevant_courses", {}).get("current_value", ""),
                    "last_verified_value": record.get("education_details", {}).get("relevant_courses", {}).get("last_verified_value", "")
                },
                "honors": {
                    "current_value": record.get("education_details", {}).get("honors", {}).get("current_value", ""),
                    "last_verified_value": record.get("education_details", {}).get("honors", {}).get("last_verified_value", "")
                }
            },
            "is_verified": record.get("is_verified", False),
            "last_verified": record.get("last_verified", None),
            "remark": record.get("remark", None)
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
    # print("Received data:", data)
    # Validate the incoming data
    # errors = validate_education(data)
    # if errors:
    #     return jsonify({"errors": errors}), 400
    
    # Convert frontend field names to backend field names
    backend_data = {
        "student_id": student_id,
        "education_details": {
            "degree": {
                "current_value": data.get("education_details").get("degree").get("current_value"),
                "last_verified_value": None
            },
            "institution": {
                "current_value": data.get("education_details").get("institution").get("current_value"),
                "last_verified_value": None
            },
            "year": {
                "current_value": data.get("education_details").get("year").get("current_value"),
                "last_verified_value": None
            },
            "gpa": {
                "current_value": data.get("education_details").get("gpa").get("current_value"),
                "last_verified_value": None
            },
            "major": {
                "current_value": data.get("education_details").get("major").get("current_value"),
                "last_verified_value": None
            },
            "minor": {
                "current_value": data.get("education_details").get("minor").get("current_value"),
                "last_verified_value": None
            },
            "relevant_courses": {
                "current_value": data.get("education_details").get("relevant_courses").get("current_value"),
                "last_verified_value": None
            },
            "honors": {
                "current_value": data.get("education_details").get("honors").get("current_value"),
                "last_verified_value": None
            }
        },
        "is_verified": False,
        "last_verified": None,
        "remark": None,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    print("Backend data:", backend_data)
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
        "education_details": {
            "degree": {
                "current_value": education.get("education_details", {}).get("degree", {}).get("current_value", ""),
                "last_verified_value": education.get("education_details", {}).get("degree", {}).get("last_verified_value", "")
            },
            "institution": {
                "current_value": education.get("education_details", {}).get("institution", {}).get("current_value", ""),
                "last_verified_value": education.get("education_details", {}).get("institution", {}).get("last_verified_value", "")
            },
            "year": {
                "current_value": education.get("education_details", {}).get("year", {}).get("current_value", ""),
                "last_verified_value": education.get("education_details", {}).get("year", {}).get("last_verified_value", "")
            },
            "gpa": {
                "current_value": education.get("education_details", {}).get("gpa", {}).get("current_value", ""),
                "last_verified_value": education.get("education_details", {}).get("gpa", {}).get("last_verified_value", "")
            },
            "major": {
                "current_value": education.get("education_details", {}).get("major", {}).get("current_value", ""),
                "last_verified_value": education.get("education_details", {}).get("major", {}).get("last_verified_value", "")
            },
            "minor": {
                "current_value": education.get("education_details", {}).get("minor", {}).get("current_value", ""),
                "last_verified_value": education.get("education_details", {}).get("minor", {}).get("last_verified_value", "")
            },
            "relevant_courses": {
                "current_value": education.get("education_details", {}).get("relevant_courses", {}).get("current_value", ""),
                "last_verified_value": education.get("education_details", {}).get("relevant_courses", {}).get("last_verified_value", "")
            },
            "honors": {
                "current_value": education.get("education_details", {}).get("honors", {}).get("current_value", ""),
                "last_verified_value": education.get("education_details", {}).get("honors", {}).get("last_verified_value", "")
            }
        },
        "is_verified": education.get("is_verified", False),
        "last_verified": education.get("last_verified", None),
        "remark": education.get("remark", None)
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
    
    # Check if content has changed and was previously verified
    content_changed = False
    if education.get("is_verified"):
        # Check if any values have changed
        if (data.get("education_details").get("degree").get("current_value") != 
            education.get("education_details", {}).get("degree", {}).get("current_value")) or \
           (data.get("education_details").get("institution").get("current_value") != 
            education.get("education_details", {}).get("institution", {}).get("current_value")) or \
           (data.get("education_details").get("year").get("current_value") != 
            education.get("education_details", {}).get("year", {}).get("current_value")) or \
           (data.get("education_details").get("gpa").get("current_value") != 
            education.get("education_details", {}).get("gpa", {}).get("current_value")) or \
           (data.get("education_details").get("major").get("current_value") != 
            education.get("education_details", {}).get("major", {}).get("current_value", "")) or \
           (data.get("education_details").get("minor").get("current_value") != 
            education.get("education_details", {}).get("minor", {}).get("current_value", "")) or \
           (data.get("education_details").get("relevant_courses").get("current_value") != 
            education.get("education_details", {}).get("relevant_courses", {}).get("current_value", "")) or \
           (data.get("education_details").get("honors").get("current_value") != 
            education.get("education_details", {}).get("honors", {}).get("current_value", "")):
            content_changed = True
    
    # Convert frontend field names to backend field names
    backend_data = {
        "education_details": {
            "degree": {
                "current_value": data.get("education_details").get("degree").get("current_value"),
                "last_verified_value": education.get("education_details", {}).get("degree", {}).get("last_verified_value", None)
            },
            "institution": {
                "current_value": data.get("education_details").get("institution").get("current_value"),
                "last_verified_value": education.get("education_details", {}).get("institution", {}).get("last_verified_value", None)
            },
            "year": {
                "current_value": data.get("education_details").get("year").get("current_value"),
                "last_verified_value": education.get("education_details", {}).get("year", {}).get("last_verified_value", None)
            },
            "gpa": {
                "current_value": data.get("education_details").get("gpa").get("current_value"),
                "last_verified_value": education.get("education_details", {}).get("gpa", {}).get("last_verified_value", None)
            },
            "major": {
                "current_value": data.get("education_details").get("major").get("current_value"),
                "last_verified_value": education.get("education_details", {}).get("major", {}).get("last_verified_value", None)
            },
            "minor": {
                "current_value": data.get("education_details").get("minor").get("current_value"),
                "last_verified_value": education.get("education_details", {}).get("minor", {}).get("last_verified_value", None)
            },
            "relevant_courses": {
                "current_value": data.get("education_details").get("relevant_courses").get("current_value"),
                "last_verified_value": education.get("education_details", {}).get("relevant_courses", {}).get("last_verified_value", None)
            },
            "honors": {
                "current_value": data.get("education_details").get("honors").get("current_value"),
                "last_verified_value": education.get("education_details", {}).get("honors", {}).get("last_verified_value", None)
            }
        },
        "updated_at": datetime.utcnow()
    }
    
    # If content changed and was previously verified, set to unverified
    if content_changed:
        backend_data["is_verified"] = False
        backend_data["last_verified"] = None
    
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
        "education_details": {
            "degree": {
                "current_value": updated_education.get("education_details", {}).get("degree", {}).get("current_value", ""),
                "last_verified_value": updated_education.get("education_details", {}).get("degree", {}).get("last_verified_value", "")
            },
            "institution": {
                "current_value": updated_education.get("education_details", {}).get("institution", {}).get("current_value", ""),
                "last_verified_value": updated_education.get("education_details", {}).get("institution", {}).get("last_verified_value", "")
            },
            "year": {
                "current_value": updated_education.get("education_details", {}).get("year", {}).get("current_value", ""),
                "last_verified_value": updated_education.get("education_details", {}).get("year", {}).get("last_verified_value", "")
            },
            "gpa": {
                "current_value": updated_education.get("education_details", {}).get("gpa", {}).get("current_value", ""),
                "last_verified_value": updated_education.get("education_details", {}).get("gpa", {}).get("last_verified_value", "")
            },
            "major": {
                "current_value": updated_education.get("education_details", {}).get("major", {}).get("current_value", ""),
                "last_verified_value": updated_education.get("education_details", {}).get("major", {}).get("last_verified_value", "")
            },
            "minor": {
                "current_value": updated_education.get("education_details", {}).get("minor", {}).get("current_value", ""),
                "last_verified_value": updated_education.get("education_details", {}).get("minor", {}).get("last_verified_value", "")
            },
            "relevant_courses": {
                "current_value": updated_education.get("education_details", {}).get("relevant_courses", {}).get("current_value", ""),
                "last_verified_value": updated_education.get("education_details", {}).get("relevant_courses", {}).get("last_verified_value", "")
            },
            "honors": {
                "current_value": updated_education.get("education_details", {}).get("honors", {}).get("current_value", ""),
                "last_verified_value": updated_education.get("education_details", {}).get("honors", {}).get("last_verified_value", "")
            }
        },
        "is_verified": updated_education.get("is_verified", False),
        "last_verified": updated_education.get("last_verified", None),
        "remark": updated_education.get("remark", None)
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
            "experience_details": {
                "company": {
                    "current_value": record.get("experience_details", {}).get("company", {}).get("current_value", ""),
                    "last_verified_value": record.get("experience_details", {}).get("company", {}).get("last_verified_value", "")
                },
                "position": {
                    "current_value": record.get("experience_details", {}).get("position", {}).get("current_value", ""),
                    "last_verified_value": record.get("experience_details", {}).get("position", {}).get("last_verified_value", "")
                },
                "duration": {
                    "current_value": record.get("experience_details", {}).get("duration", {}).get("current_value", ""),
                    "last_verified_value": record.get("experience_details", {}).get("duration", {}).get("last_verified_value", "")
                },
                "description": {
                    "current_value": record.get("experience_details", {}).get("description", {}).get("current_value", ""),
                    "last_verified_value": record.get("experience_details", {}).get("description", {}).get("last_verified_value", "")
                },
                "technologies": {
                    "current_value": record.get("experience_details", {}).get("technologies", {}).get("current_value", ""),
                    "last_verified_value": record.get("experience_details", {}).get("technologies", {}).get("last_verified_value", "")
                },
                "achievements": {
                    "current_value": record.get("experience_details", {}).get("achievements", {}).get("current_value", ""),
                    "last_verified_value": record.get("experience_details", {}).get("achievements", {}).get("last_verified_value", "")
                },
                "skills": {
                    "current_value": record.get("experience_details", {}).get("skills", {}).get("current_value", ""),
                    "last_verified_value": record.get("experience_details", {}).get("skills", {}).get("last_verified_value", "")
                }
            },
            "is_verified": record.get("is_verified", False),
            "last_verified": record.get("last_verified", None),
            "remark": record.get("remark", None)
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
        "experience_details": {
            "company": {
                "current_value": data.get("experience_details").get("company").get("current_value"),
                "last_verified_value": None
            },
            "position": {
                "current_value": data.get("experience_details").get("position").get("current_value"),
                "last_verified_value": None
            },
            "duration": {
                "current_value": data.get("experience_details").get("duration").get("current_value"),
                "last_verified_value": None
            },
            "description": {
                "current_value": data.get("experience_details").get("description").get("current_value"),
                "last_verified_value": None
            },
            "technologies": {
                "current_value": data.get("experience_details").get("technologies").get("current_value"),
                "last_verified_value": None
            },
            "achievements": {
                "current_value": data.get("experience_details").get("achievements").get("current_value"),
                "last_verified_value": None
            },
            "skills": {
                "current_value": data.get("experience_details").get("skills").get("current_value"),
                "last_verified_value": None
            }
        },
        "is_verified": False,
        "last_verified": None,
        "remark": None,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
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
        "experience_details": {
            "company": {
                "current_value": experience.get("experience_details", {}).get("company", {}).get("current_value", ""),
                "last_verified_value": experience.get("experience_details", {}).get("company", {}).get("last_verified_value", "")
            },
            "position": {
                "current_value": experience.get("experience_details", {}).get("position", {}).get("current_value", ""),
                "last_verified_value": experience.get("experience_details", {}).get("position", {}).get("last_verified_value", "")
            },
            "duration": {
                "current_value": experience.get("experience_details", {}).get("duration", {}).get("current_value", ""),
                "last_verified_value": experience.get("experience_details", {}).get("duration", {}).get("last_verified_value", "")
            },
            "description": {
                "current_value": experience.get("experience_details", {}).get("description", {}).get("current_value", ""),
                "last_verified_value": experience.get("experience_details", {}).get("description", {}).get("last_verified_value", "")
            },
            "technologies": {
                "current_value": experience.get("experience_details", {}).get("technologies", {}).get("current_value", ""),
                "last_verified_value": experience.get("experience_details", {}).get("technologies", {}).get("last_verified_value", "")
            },
            "achievements": {
                "current_value": experience.get("experience_details", {}).get("achievements", {}).get("current_value", ""),
                "last_verified_value": experience.get("experience_details", {}).get("achievements", {}).get("last_verified_value", "")
            },
            "skills": {
                "current_value": experience.get("experience_details", {}).get("skills", {}).get("current_value", ""),
                "last_verified_value": experience.get("experience_details", {}).get("skills", {}).get("last_verified_value", "")
            }
        },
        "is_verified": experience.get("is_verified", False),
        "last_verified": experience.get("last_verified", None),
        "remark": experience.get("remark", None)
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
    
    # Check if content has changed and was previously verified
    content_changed = False
    if experience.get("is_verified"):
        # Check if any values have changed
        if (data.get("experience_details").get("company").get("current_value") != 
            experience.get("experience_details", {}).get("company", {}).get("current_value")) or \
           (data.get("experience_details").get("position").get("current_value") != 
            experience.get("experience_details", {}).get("position", {}).get("current_value")) or \
           (data.get("experience_details").get("duration").get("current_value") != 
            experience.get("experience_details", {}).get("duration", {}).get("current_value")) or \
           (data.get("experience_details").get("description").get("current_value") != 
            experience.get("experience_details", {}).get("description", {}).get("current_value")) or \
           (data.get("experience_details").get("technologies").get("current_value") != 
            experience.get("experience_details", {}).get("technologies", {}).get("current_value")) or \
           (data.get("experience_details").get("achievements").get("current_value") != 
            experience.get("experience_details", {}).get("achievements", {}).get("current_value")) or \
           (data.get("experience_details").get("skills").get("current_value") != 
            experience.get("experience_details", {}).get("skills", {}).get("current_value")):
            content_changed = True
    
    # Convert frontend field names to backend field names
    backend_data = {
        "experience_details": {
            "company": {
                "current_value": data.get("experience_details").get("company").get("current_value"),
                "last_verified_value": experience.get("experience_details", {}).get("company", {}).get("last_verified_value", None)
            },
            "position": {
                "current_value": data.get("experience_details").get("position").get("current_value"),
                "last_verified_value": experience.get("experience_details", {}).get("position", {}).get("last_verified_value", None)
            },
            "duration": {
                "current_value": data.get("experience_details").get("duration").get("current_value"),
                "last_verified_value": experience.get("experience_details", {}).get("duration", {}).get("last_verified_value", None)
            },
            "description": {
                "current_value": data.get("experience_details").get("description").get("current_value"),
                "last_verified_value": experience.get("experience_details", {}).get("description", {}).get("last_verified_value", None)
            },
            "technologies": {
                "current_value": data.get("experience_details").get("technologies").get("current_value"),
                "last_verified_value": experience.get("experience_details", {}).get("technologies", {}).get("last_verified_value", None)
            },
            "achievements": {
                "current_value": data.get("experience_details").get("achievements").get("current_value"),
                "last_verified_value": experience.get("experience_details", {}).get("achievements", {}).get("last_verified_value", None)
            },
            "skills": {
                "current_value": data.get("experience_details").get("skills").get("current_value"),
                "last_verified_value": experience.get("experience_details", {}).get("skills", {}).get("last_verified_value", None)
            }
        },
        "updated_at": datetime.utcnow()
    }
    
    # If content changed and was previously verified, set to unverified
    if content_changed:
        backend_data["is_verified"] = False
        backend_data["last_verified"] = None
    
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
        "experience_details": {
            "company": {
                "current_value": updated_experience.get("experience_details", {}).get("company", {}).get("current_value", ""),
                "last_verified_value": updated_experience.get("experience_details", {}).get("company", {}).get("last_verified_value", "")
            },
            "position": {
                "current_value": updated_experience.get("experience_details", {}).get("position", {}).get("current_value", ""),
                "last_verified_value": updated_experience.get("experience_details", {}).get("position", {}).get("last_verified_value", "")
            },
            "duration": {
                "current_value": updated_experience.get("experience_details", {}).get("duration", {}).get("current_value", ""),
                "last_verified_value": updated_experience.get("experience_details", {}).get("duration", {}).get("last_verified_value", "")
            },
            "description": {
                "current_value": updated_experience.get("experience_details", {}).get("description", {}).get("current_value", ""),
                "last_verified_value": updated_experience.get("experience_details", {}).get("description", {}).get("last_verified_value", "")
            },
            "technologies": {
                "current_value": updated_experience.get("experience_details", {}).get("technologies", {}).get("current_value", ""),
                "last_verified_value": updated_experience.get("experience_details", {}).get("technologies", {}).get("last_verified_value", "")
            },
            "achievements": {
                "current_value": updated_experience.get("experience_details", {}).get("achievements", {}).get("current_value", ""),
                "last_verified_value": updated_experience.get("experience_details", {}).get("achievements", {}).get("last_verified_value", "")
            },
            "skills": {
                "current_value": updated_experience.get("experience_details", {}).get("skills", {}).get("current_value", ""),
                "last_verified_value": updated_experience.get("experience_details", {}).get("skills", {}).get("last_verified_value", "")
            }
        },
        "is_verified": updated_experience.get("is_verified", False),
        "last_verified": updated_experience.get("last_verified", None),
        "remark": updated_experience.get("remark", None)
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
            "position_details": {
                "title": {
                    "current_value": record.get("position_details", {}).get("title", {}).get("current_value", ""),
                    "last_verified_value": record.get("position_details", {}).get("title", {}).get("last_verified_value", "")
                },
                "organization": {
                    "current_value": record.get("position_details", {}).get("organization", {}).get("current_value", ""),
                    "last_verified_value": record.get("position_details", {}).get("organization", {}).get("last_verified_value", "")
                },
                "duration": {
                    "current_value": record.get("position_details", {}).get("duration", {}).get("current_value", ""),
                    "last_verified_value": record.get("position_details", {}).get("duration", {}).get("last_verified_value", "")
                },
                "description": {
                    "current_value": record.get("position_details", {}).get("description", {}).get("current_value", ""),
                    "last_verified_value": record.get("position_details", {}).get("description", {}).get("last_verified_value", "")
                },
                "responsibilities": {
                    "current_value": record.get("position_details", {}).get("responsibilities", {}).get("current_value", ""),
                    "last_verified_value": record.get("position_details", {}).get("responsibilities", {}).get("last_verified_value", "")
                },
                "achievements": {
                    "current_value": record.get("position_details", {}).get("achievements", {}).get("current_value", ""),
                    "last_verified_value": record.get("position_details", {}).get("achievements", {}).get("last_verified_value", "")
                }
            },
            "is_verified": record.get("is_verified", False),
            "last_verified": record.get("last_verified", None),
            "remark": record.get("remark", None)
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
        "position_details": {
            "title": {
                "current_value": data.get("position_details").get("title").get("current_value"),
                "last_verified_value": None
            },
            "organization": {
                "current_value": data.get("position_details").get("organization").get("current_value"),
                "last_verified_value": None
            },
            "duration": {
                "current_value": data.get("position_details").get("duration").get("current_value"),
                "last_verified_value": None
            },
            "description": {
                "current_value": data.get("position_details").get("description").get("current_value"),
                "last_verified_value": None
            },
            "responsibilities": {
                "current_value": data.get("position_details").get("responsibilities").get("current_value"),
                "last_verified_value": None
            },
            "achievements": {
                "current_value": data.get("position_details").get("achievements").get("current_value"),
                "last_verified_value": None
            }
        },
        "is_verified": False,
        "last_verified": None,
        "remark": None,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
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
        "position_details": {
            "title": {
                "current_value": position.get("position_details", {}).get("title", {}).get("current_value", ""),
                "last_verified_value": position.get("position_details", {}).get("title", {}).get("last_verified_value", "")
            },
            "organization": {
                "current_value": position.get("position_details", {}).get("organization", {}).get("current_value", ""),
                "last_verified_value": position.get("position_details", {}).get("organization", {}).get("last_verified_value", "")
            },
            "duration": {
                "current_value": position.get("position_details", {}).get("duration", {}).get("current_value", ""),
                "last_verified_value": position.get("position_details", {}).get("duration", {}).get("last_verified_value", "")
            },
            "description": {
                "current_value": position.get("position_details", {}).get("description", {}).get("current_value", ""),
                "last_verified_value": position.get("position_details", {}).get("description", {}).get("last_verified_value", "")
            },
            "responsibilities": {
                "current_value": position.get("position_details", {}).get("responsibilities", {}).get("current_value", ""),
                "last_verified_value": position.get("position_details", {}).get("responsibilities", {}).get("last_verified_value", "")
            },
            "achievements": {
                "current_value": position.get("position_details", {}).get("achievements", {}).get("current_value", ""),
                "last_verified_value": position.get("position_details", {}).get("achievements", {}).get("last_verified_value", "")
            }
        },
        "is_verified": position.get("is_verified", False),
        "last_verified": position.get("last_verified", None),
        "remark": position.get("remark", None)
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
    
    # Check if content has changed and was previously verified
    content_changed = False
    if position.get("is_verified"):
        # Check if any values have changed
        if (data.get("position_details").get("title").get("current_value") != 
            position.get("position_details", {}).get("title", {}).get("current_value")) or \
           (data.get("position_details").get("organization").get("current_value") != 
            position.get("position_details", {}).get("organization", {}).get("current_value")) or \
           (data.get("position_details").get("duration").get("current_value") != 
            position.get("position_details", {}).get("duration", {}).get("current_value")) or \
           (data.get("position_details").get("description").get("current_value") != 
            position.get("position_details", {}).get("description", {}).get("current_value")) or \
           (data.get("position_details").get("responsibilities").get("current_value") != 
            position.get("position_details", {}).get("responsibilities", {}).get("current_value")) or \
           (data.get("position_details").get("achievements").get("current_value") != 
            position.get("position_details", {}).get("achievements", {}).get("current_value")):
            content_changed = True
    
    # Convert frontend field names to backend field names
    backend_data = {
        "position_details": {
            "title": {
                "current_value": data.get("position_details").get("title").get("current_value"),
                "last_verified_value": position.get("position_details", {}).get("title", {}).get("last_verified_value", None)
            },
            "organization": {
                "current_value": data.get("position_details").get("organization").get("current_value"),
                "last_verified_value": position.get("position_details", {}).get("organization", {}).get("last_verified_value", None)
            },
            "duration": {
                "current_value": data.get("position_details").get("duration").get("current_value"),
                "last_verified_value": position.get("position_details", {}).get("duration", {}).get("last_verified_value", None)
            },
            "description": {
                "current_value": data.get("position_details").get("description").get("current_value"),
                "last_verified_value": position.get("position_details", {}).get("description", {}).get("last_verified_value", None)
            },
            "responsibilities": {
                "current_value": data.get("position_details").get("responsibilities").get("current_value"),
                "last_verified_value": position.get("position_details", {}).get("responsibilities", {}).get("last_verified_value", None)
            },
            "achievements": {
                "current_value": data.get("position_details").get("achievements").get("current_value"),
                "last_verified_value": position.get("position_details", {}).get("achievements", {}).get("last_verified_value", None)
            }
        },
        "updated_at": datetime.utcnow()
    }
    
    # If content changed and was previously verified, set to unverified
    if content_changed:
        backend_data["is_verified"] = False
        backend_data["last_verified"] = None
    
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
        "position_details": {
            "title": {
                "current_value": updated_position.get("position_details", {}).get("title", {}).get("current_value", ""),
                "last_verified_value": updated_position.get("position_details", {}).get("title", {}).get("last_verified_value", "")
            },
            "organization": {
                "current_value": updated_position.get("position_details", {}).get("organization", {}).get("current_value", ""),
                "last_verified_value": updated_position.get("position_details", {}).get("organization", {}).get("last_verified_value", "")
            },
            "duration": {
                "current_value": updated_position.get("position_details", {}).get("duration", {}).get("current_value", ""),
                "last_verified_value": updated_position.get("position_details", {}).get("duration", {}).get("last_verified_value", "")
            },
            "description": {
                "current_value": updated_position.get("position_details", {}).get("description", {}).get("current_value", ""),
                "last_verified_value": updated_position.get("position_details", {}).get("description", {}).get("last_verified_value", "")
            },
            "responsibilities": {
                "current_value": updated_position.get("position_details", {}).get("responsibilities", {}).get("current_value", ""),
                "last_verified_value": updated_position.get("position_details", {}).get("responsibilities", {}).get("last_verified_value", "")
            },
            "achievements": {
                "current_value": updated_position.get("position_details", {}).get("achievements", {}).get("current_value", ""),
                "last_verified_value": updated_position.get("position_details", {}).get("achievements", {}).get("last_verified_value", "")
            }
        },
        "is_verified": updated_position.get("is_verified", False),
        "last_verified": updated_position.get("last_verified", None),
        "remark": updated_position.get("remark", None)
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
            "project_details": {
                "name": {
                    "current_value": record.get("project_details", {}).get("name", {}).get("current_value", ""),
                    "last_verified_value": record.get("project_details", {}).get("name", {}).get("last_verified_value", "")
                },
                "description": {
                    "current_value": record.get("project_details", {}).get("description", {}).get("current_value", ""),
                    "last_verified_value": record.get("project_details", {}).get("description", {}).get("last_verified_value", "")
                },
                "technologies": {
                    "current_value": record.get("project_details", {}).get("technologies", {}).get("current_value", ""),
                    "last_verified_value": record.get("project_details", {}).get("technologies", {}).get("last_verified_value", "")
                },
                "duration": {
                    "current_value": record.get("project_details", {}).get("duration", {}).get("current_value", ""),
                    "last_verified_value": record.get("project_details", {}).get("duration", {}).get("last_verified_value", "")
                },
                "role": {
                    "current_value": record.get("project_details", {}).get("role", {}).get("current_value", ""),
                    "last_verified_value": record.get("project_details", {}).get("role", {}).get("last_verified_value", "")
                },
                "teamSize": {
                    "current_value": record.get("project_details", {}).get("team_size", {}).get("current_value", ""),
                    "last_verified_value": record.get("project_details", {}).get("team_size", {}).get("last_verified_value", "")
                },
                "githubLink": {
                    "current_value": record.get("project_details", {}).get("github_link", {}).get("current_value", ""),
                    "last_verified_value": record.get("project_details", {}).get("github_link", {}).get("last_verified_value", "")
                },
                "demoLink": {
                    "current_value": record.get("project_details", {}).get("demo_link", {}).get("current_value", ""),
                    "last_verified_value": record.get("project_details", {}).get("demo_link", {}).get("last_verified_value", "")
                }
            },
            "is_verified": record.get("is_verified", False),
            "last_verified": record.get("last_verified", None),
            "remark": record.get("remark", None)
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
    print(data)
    # Validate the incoming data
    # errors = validate_project(data)
    # if errors:
    #     return jsonify({"errors": errors}), 400
    
    # Convert frontend field names to backend field names
    backend_data = {
        "student_id": student_id,
        "project_details": {
            "name": {
                "current_value": data.get("project_details").get("name").get("current_value"),
                "last_verified_value": None
            },
            "description": {
                "current_value": data.get("project_details").get("description").get("current_value"),
                "last_verified_value": None
            },
            "technologies": {
                "current_value": data.get("project_details").get("technologies").get("current_value"),
                "last_verified_value": None
            },
            "duration": {
                "current_value": data.get("project_details").get("duration").get("current_value"),
                "last_verified_value": None
            },
            "role": {
                "current_value": data.get("project_details").get("role").get("current_value"),
                "last_verified_value": None
            },
            "team_size": {
                "current_value": data.get("project_details").get("teamSize").get("current_value"),
                "last_verified_value": None
            },
            "github_link": {
                "current_value": data.get("project_details").get("githubLink").get("current_value"),
                "last_verified_value": None
            },
            "demo_link": {
                "current_value": data.get("project_details").get("demoLink").get("current_value"),
                "last_verified_value": None
            }
        },
        "is_verified": False,
        "last_verified": None,
        "remark": None,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
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
        "project_details": {
            "name": {
                "current_value": project.get("project_details", {}).get("name", {}).get("current_value", ""),
                "last_verified_value": project.get("project_details", {}).get("name", {}).get("last_verified_value", "")
            },
            "description": {
                "current_value": project.get("project_details", {}).get("description", {}).get("current_value", ""),
                "last_verified_value": project.get("project_details", {}).get("description", {}).get("last_verified_value", "")
            },
            "technologies": {
                "current_value": project.get("project_details", {}).get("technologies", {}).get("current_value", ""),
                "last_verified_value": project.get("project_details", {}).get("technologies", {}).get("last_verified_value", "")
            },
            "duration": {
                "current_value": project.get("project_details", {}).get("duration", {}).get("current_value", ""),
                "last_verified_value": project.get("project_details", {}).get("duration", {}).get("last_verified_value", "")
            },
            "role": {
                "current_value": project.get("project_details", {}).get("role", {}).get("current_value", ""),
                "last_verified_value": project.get("project_details", {}).get("role", {}).get("last_verified_value", "")
            },
            "teamSize": {
                "current_value": project.get("project_details", {}).get("team_size", {}).get("current_value", ""),
                "last_verified_value": project.get("project_details", {}).get("team_size", {}).get("last_verified_value", "")
            },
            "githubLink": {
                "current_value": project.get("project_details", {}).get("github_link", {}).get("current_value", ""),
                "last_verified_value": project.get("project_details", {}).get("github_link", {}).get("last_verified_value", "")
            },
            "demoLink": {
                "current_value": project.get("project_details", {}).get("demo_link", {}).get("current_value", ""),
                "last_verified_value": project.get("project_details", {}).get("demo_link", {}).get("last_verified_value", "")
            }
        },
        "is_verified": project.get("is_verified", False),
        "last_verified": project.get("last_verified", None),
        "remark": project.get("remark", None)
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
    
    # Check if the project record belongs to the student
    project = StudentService.get_project_by_id(project_id)
    if not project or str(project.get("student_id")) != str(student_id):
        return jsonify({"message": "Project record not found or access denied"}), 404
    
    # Check if content has changed and was previously verified
    content_changed = False
    if project.get("is_verified"):
        # Check if any values have changed
        if (data.get("project_details").get("name").get("current_value") != 
            project.get("project_details", {}).get("name", {}).get("current_value")) or \
           (data.get("project_details").get("description").get("current_value") != 
            project.get("project_details", {}).get("description", {}).get("current_value")) or \
           (data.get("project_details").get("technologies").get("current_value") != 
            project.get("project_details", {}).get("technologies", {}).get("current_value")) or \
           (data.get("project_details").get("duration").get("current_value") != 
            project.get("project_details", {}).get("duration", {}).get("current_value")) or \
           (data.get("project_details").get("role").get("current_value") != 
            project.get("project_details", {}).get("role", {}).get("current_value")) or \
           (data.get("project_details").get("teamSize").get("current_value") != 
            project.get("project_details", {}).get("team_size", {}).get("current_value")) or \
           (data.get("project_details").get("githubLink").get("current_value") != 
            project.get("project_details", {}).get("github_link", {}).get("current_value")) or \
           (data.get("project_details").get("demoLink").get("current_value") != 
            project.get("project_details", {}).get("demo_link", {}).get("current_value")):
            content_changed = True
    
    # Convert frontend field names to backend field names
    backend_data = {
        "project_details": {
            "name": {
                "current_value": data.get("project_details").get("name").get("current_value"),
                "last_verified_value": project.get("project_details", {}).get("name", {}).get("last_verified_value", None)
            },
            "description": {
                "current_value": data.get("project_details").get("description").get("current_value"),
                "last_verified_value": project.get("project_details", {}).get("description", {}).get("last_verified_value", None)
            },
            "technologies": {
                "current_value": data.get("project_details").get("technologies").get("current_value"),
                "last_verified_value": project.get("project_details", {}).get("technologies", {}).get("last_verified_value", None)
            },
            "duration": {
                "current_value": data.get("project_details").get("duration").get("current_value"),
                "last_verified_value": project.get("project_details", {}).get("duration", {}).get("last_verified_value", None)
            },
            "role": {
                "current_value": data.get("project_details").get("role").get("current_value"),
                "last_verified_value": project.get("project_details", {}).get("role", {}).get("last_verified_value", None)
            },
            "team_size": {
                "current_value": data.get("project_details").get("teamSize").get("current_value"),
                "last_verified_value": project.get("project_details", {}).get("team_size", {}).get("last_verified_value", None)
            },
            "github_link": {
                "current_value": data.get("project_details").get("githubLink").get("current_value"),
                "last_verified_value": project.get("project_details", {}).get("github_link", {}).get("last_verified_value", None)
            },
            "demo_link": {
                "current_value": data.get("project_details").get("demoLink").get("current_value"),
                "last_verified_value": project.get("project_details", {}).get("demo_link", {}).get("last_verified_value", None)
            }
        },
        "updated_at": datetime.utcnow()
    }
    
    # If content changed and was previously verified, set to unverified
    if content_changed:
        backend_data["is_verified"] = False
        backend_data["last_verified"] = None
    
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
        "project_details": {
            "name": {
                "current_value": updated_project.get("project_details", {}).get("name", {}).get("current_value", ""),
                "last_verified_value": updated_project.get("project_details", {}).get("name", {}).get("last_verified_value", "")
            },
            "description": {
                "current_value": updated_project.get("project_details", {}).get("description", {}).get("current_value", ""),
                "last_verified_value": updated_project.get("project_details", {}).get("description", {}).get("last_verified_value", "")
            },
            "technologies": {
                "current_value": updated_project.get("project_details", {}).get("technologies", {}).get("current_value", ""),
                "last_verified_value": updated_project.get("project_details", {}).get("technologies", {}).get("last_verified_value", "")
            },
            "duration": {
                "current_value": updated_project.get("project_details", {}).get("duration", {}).get("current_value", ""),
                "last_verified_value": updated_project.get("project_details", {}).get("duration", {}).get("last_verified_value", "")
            },
            "role": {
                "current_value": updated_project.get("project_details", {}).get("role", {}).get("current_value", ""),
                "last_verified_value": updated_project.get("project_details", {}).get("role", {}).get("last_verified_value", "")
            },
            "teamSize": {
                "current_value": updated_project.get("project_details", {}).get("team_size", {}).get("current_value", ""),
                "last_verified_value": updated_project.get("project_details", {}).get("team_size", {}).get("last_verified_value", "")
            },
            "githubLink": {
                "current_value": updated_project.get("project_details", {}).get("github_link", {}).get("current_value", ""),
                "last_verified_value": updated_project.get("project_details", {}).get("github_link", {}).get("last_verified_value", "")
            },
            "demoLink": {
                "current_value": updated_project.get("project_details", {}).get("demo_link", {}).get("current_value", ""),
                "last_verified_value": updated_project.get("project_details", {}).get("demo_link", {}).get("last_verified_value", "")
            }
        },
        "is_verified": updated_project.get("is_verified", False),
        "last_verified": updated_project.get("last_verified", None),
        "remark": updated_project.get("remark", None)
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
@students_bp.route('/me/resumes', methods=['GET', 'POST'])
@jwt_required()
@student_required
def handle_resumes():
    if request.method == 'GET':
        current_user = get_jwt_identity()
        student_id = current_user.get('id')
        resumes = StudentService.get_resumes_by_student_id(student_id)
        
        # Format resumes for frontend
        formatted_resumes = []
        for resume in resumes:
            formatted_resume = {
                "_id": str(resume.get("_id")),
                "resume_name": resume.get("resume_name", ""),
                "file_name": resume.get("file_name", ""),
                "upload_date": resume.get("upload_date", ""),
                "file_size": resume.get("file_size", ""),
                "file_url": resume.get("file_url", ""),
                "public_id": resume.get("public_id", ""),
                "student_id": str(resume.get("student_id")),
                "created_at": resume.get("created_at").strftime('%Y-%m-%d %H:%M:%S') if resume.get("created_at") else "",
                "updated_at": resume.get("updated_at").strftime('%Y-%m-%d %H:%M:%S') if resume.get("updated_at") else ""
            }
            formatted_resumes.append(formatted_resume)
            
        return jsonify(formatted_resumes), 200
        
    elif request.method == 'POST':
        try:
            current_user = get_jwt_identity()
            student_id = current_user.get('id')
            
            # Check resume limit
            existing_resumes_count = StudentService.count_resumes_by_student_id(student_id)
            if existing_resumes_count >= 3:
                return jsonify({"message": "Maximum limit of 3 resumes reached"}), 400
            
            if 'resume' not in request.files:
                return jsonify({"message": "No file provided"}), 400
                
            file = request.files['resume']
            if file.filename == '':
                return jsonify({"message": "No file selected"}), 400

            # Validate file type
            if not file.filename.lower().endswith('.pdf'):
                return jsonify({"message": "Only PDF files are allowed"}), 400

            # Get or generate resume name
            resume_name = request.form.get('resumeName') or os.path.splitext(file.filename)[0]
            
            # Read and validate file
            file_content = file.read()
            file.seek(0)
            
            # Validate file size (5MB limit)
            if len(file_content) > 5 * 1024 * 1024:
                return jsonify({"message": "File size exceeds 5MB limit"}), 400

            # Generate public ID and upload to Cloudinary
            public_id = generate_public_id("resume", str(student_id))
            upload_result = upload_file(
                file=file,
                folder="resumes",
                resource_type="raw",
                allowed_formats=[".pdf"],
                public_id=public_id
            )
            
            resume_data = {
                "student_id": student_id,
                "resume_name": resume_name,
                "file_name": secure_filename(file.filename),
                "upload_date": datetime.utcnow().strftime('%Y-%m-%d'),
                "file_size": f"{len(file_content) / (1024 * 1024):.2f} MB",
                "file_url": upload_result['secure_url'],
                "public_id": public_id
            }
            
            resume_id = StudentService.add_resume(resume_data)
            resume = StudentService.get_resume_by_id(resume_id)
            
            # Format resume for frontend
            formatted_resume = {
                "_id": str(resume.get("_id")),
                "resume_name": resume.get("resume_name", ""),
                "file_name": resume.get("file_name", ""),
                "upload_date": resume.get("upload_date", ""),
                "file_size": resume.get("file_size", ""),
                "file_url": resume.get("file_url", ""),
                "public_id": resume.get("public_id", ""),
                "student_id": str(resume.get("student_id")),
                "created_at": resume.get("created_at").strftime('%Y-%m-%d %H:%M:%S') if resume.get("created_at") else "",
                "updated_at": resume.get("updated_at").strftime('%Y-%m-%d %H:%M:%S') if resume.get("updated_at") else ""
            }
            
            return jsonify(formatted_resume), 201
            
        except Exception as e:
            print(f"Resume upload error: {str(e)}")
            return jsonify({"message": f"Failed to upload resume: {str(e)}"}), 500

@students_bp.route('/me/resumes/<resume_id>', methods=['PUT', 'DELETE'])
@jwt_required()
@student_required
def handle_resume(resume_id):
    current_user = get_jwt_identity()
    user_id = current_user.get('id')
    
    # Verify resume belongs to student
    resume = StudentService.get_resume_by_id(resume_id)
    if not resume or str(resume['student_id']) != str(user_id):
        return jsonify({"message": "Resume not found"}), 404

    if request.method == 'PUT':
        try:
            data = {}
            
            # Handle name update
            if 'resumeName' in request.form:
                data['resume_name'] = request.form['resumeName']
            
            # Handle file update
            if 'resume' in request.files:
                file = request.files['resume']
                if file.filename != '':
                    # Validate file type
                    if not file.filename.lower().endswith('.pdf'):
                        return jsonify({"message": "Only PDF files are allowed"}), 400
                        
                    # Read and validate file
                    file_content = file.read()
                    file.seek(0)
                    
                    # Validate file size
                    if len(file_content) > 5 * 1024 * 1024:
                        return jsonify({"message": "File size exceeds 5MB limit"}), 400

                    # Generate new public ID and upload to Cloudinary
                    new_public_id = generate_public_id("resume", str(user_id))
                    upload_result = upload_file(
                        file=file,
                        folder="resumes",
                        resource_type="raw",
                        allowed_formats=[".pdf"],
                        public_id=new_public_id
                    )
                    
                    # Delete old file if it exists
                    if 'public_id' in resume:
                        delete_file(resume['public_id'])
                    
                    data.update({
                        "file_name": secure_filename(file.filename),
                        "file_size": f"{len(file_content) / (1024 * 1024):.2f} MB",
                        "file_url": upload_result['secure_url'],
                        "public_id": new_public_id
                    })
            
            if data:
                StudentService.update_resume(resume_id, data)
                updated_resume = StudentService.get_resume_by_id(resume_id)
                return jsonify(updated_resume), 200
            return jsonify({"message": "No updates provided"}), 400
            
        except Exception as e:
            return jsonify({"message": f"Failed to update resume: {str(e)}"}), 500
            
    elif request.method == 'DELETE':
        try:
            # Delete from Cloudinary
            if 'public_id' in resume:
                delete_file(resume['public_id'])
            
            StudentService.delete_resume(resume_id)
            return jsonify({"message": "Resume deleted successfully"}), 200
        except Exception as e:
            return jsonify({"message": f"Failed to delete resume: {str(e)}"}), 500

@students_bp.route('/download-resume/<resume_id>', methods=['GET'])
@jwt_required()
def download_resume(resume_id):
    """Download a resume"""
    current_user = get_jwt_identity()
    user_id = current_user.get('id')
    
    resume = StudentService.get_resume_by_id(resume_id)
    
    if not resume:
        return jsonify({"message": "Resume not found"}), 404
    
    # Check if the resume belongs to the student or if the user is an admin
    if str(resume.get("student_id")) != str(user_id) and current_user.get('role') != 'admin':
        return jsonify({"message": "Access denied"}), 403
    
    # Get the file URL from the resume document
    file_url = resume.get("file_url", "")
    if not file_url:
        return jsonify({"message": "File not found"}), 404
    
    # Use the download URL with fl_attachment parameter
    download_url = file_url.replace('/upload/', '/upload/fl_attachment/')
    
    return jsonify({
        "file_url": download_url,
        "file_name": resume.get("file_name", "resume.pdf")
    }), 200

@students_bp.route('/view-resume/<resume_id>', methods=['GET'])
@jwt_required()
def view_resume(resume_id):
    """View a resume in the browser"""
    current_user = get_jwt_identity()
    user_id = current_user.get('id')
    
    resume = StudentService.get_resume_by_id(resume_id)
    
    if not resume:
        return jsonify({"message": "Resume not found"}), 404
    
    # Check if the resume belongs to the student or if the user is an admin
    if str(resume.get("student_id")) != str(user_id) and current_user.get('role') != 'admin':
        return jsonify({"message": "Access denied"}), 403
    
    # Get the file URL from the resume document
    file_url = resume.get("file_url", "")
    if not file_url:
        return jsonify({"message": "File not found"}), 404
    
    # Use the view URL with fl_attachment:false parameter
    view_url = file_url.replace('/upload/', '/upload/fl_attachment:false/')
    
    return jsonify({
        "file_url": view_url,
        "file_name": resume.get("file_name", "resume.pdf")
    }), 200

@students_bp.route('/me/applications', methods=['GET'])
@jwt_required()
@student_required
def get_my_applications():
    """Get all applications submitted by the current student"""
    current_user = get_jwt_identity()
    user_id = current_user.get('id')
    # student_id = StudentService.get_student_id_by_user_id(user_id)
    
    applications = JobService.get_applications_by_student(user_id)
    
    # Convert ObjectId to string for JSON serialization
    return json_response(applications), 200

@students_bp.route('/me/documents', methods=['GET'])
@jwt_required()
@student_required
def get_my_documents():
    """Get documents for the current student, with optional type filter"""
    current_user = get_jwt_identity()
    user_id = current_user.get('id')
    document_type = request.args.get('type')
    
    # Handle resume type documents
    if document_type == 'resume':
        resumes = DocumentService.get_resumes_by_student_id(user_id)
        logger = current_app.logger
        logger.info(f"Resumes: {resumes}")
        formatted_resumes = []
        
        for resume in resumes:
            formatted_resume = DocumentService.format_resume_for_frontend(resume)
            formatted_resumes.append(formatted_resume)
        
        return jsonify(formatted_resumes), 200
    
    # Handle other document types using the DocumentService
    else:
        documents = DocumentService.get_documents_by_student(user_id, document_type)
        
        # Format the documents for the frontend
        formatted_documents = []
        for doc in documents:
            formatted_doc = {
                "_id": doc.get("_id"),
                "name": doc.get("name", ""),
                "fileUrl": doc.get("fileUrl", ""),
                "createdAt": doc.get("createdAt").isoformat() if doc.get("createdAt") else "",
                "verified": doc.get("verified", False)
            }
            formatted_documents.append(formatted_doc) 
        
        return jsonify(formatted_documents), 200