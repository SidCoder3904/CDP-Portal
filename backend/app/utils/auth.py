# app/utils/auth.py
from functools import wraps
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from flask import jsonify

def admin_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        current_user = get_jwt_identity()
        if current_user.get('role') != 'admin':
            return jsonify({"message": "Admin privileges required"}), 403
        return fn(*args, **kwargs)
    return wrapper

def student_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        current_user = get_jwt_identity()
        if current_user.get('role') != 'student':
            return jsonify({"message": "Student privileges required"}), 403
        return fn(*args, **kwargs)
    return wrapper

