# app/routes/auth.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from app.services.auth_service import AuthService
from app.utils.validators import validate_login

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/request-otp', methods=['POST'])
def request_otp():
    print("Request OTP")
    data = request.get_json()
    user = AuthService.authenticate_user(data.get('email'), data.get('password'))
    if not user:
        return jsonify({"message": "Invalid credentials"}), 401
    
    otp = AuthService.generate_otp(user['_id'])

    # Return user_id along with the OTP sent message
    return jsonify({
        "message": "OTP sent",
        "user_id": str(user['_id'])  # Provide user_id for subsequent OTP login
    }), 200


@auth_bp.route('/login-with-otp', methods=['POST'])
def login_with_otp():
    data = request.get_json()
    user_id = data.get('user_id')
    otp = data.get('otp')
    print("User ID: ", user_id)
    print("OTP: ", otp)

    if not AuthService.verify_otp(user_id, otp):
        return jsonify({"message": "Invalid or expired OTP"}), 401

    user = AuthService.get_user_by_id(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404

    access_token = create_access_token(identity={
        'id': str(user['_id']),
        'email': user['email'],
        'role': user['role']
    })
    refresh_token = create_refresh_token(identity=str(user['_id']))

    return jsonify({
        'access_token': access_token,
        'refresh_token': refresh_token,
        'user': {
            'id': str(user['_id']),
            'email': user['email'],
            # 'name': user['name'],
            'role': user['role']
        }
    }), 200

# @auth_bp.route('/login', methods=['POST'])
# def login():
#     data = request.get_json()
    
#     # Validate input
#     errors = validate_login(data)
#     if errors:
#         return jsonify({"errors": errors}), 400
    
#     # Authenticate user
#     user = AuthService.authenticate_user(data.get('email'), data.get('password'))
#     if not user:
#         return jsonify({"message": "Invalid credentials"}), 401
    
#     # Generate tokens
#     access_token = create_access_token(identity={
#         'id': str(user['_id']),
#         'email': user['email'],
#         'role': user['role']
#     })
#     refresh_token = create_refresh_token(identity=str(user['_id']))
    
#     return jsonify({
#         'access_token': access_token,
#         'refresh_token': refresh_token,
#         'user': {
#             'id': str(user['_id']),
#             'email': user['email'],
#             'name': user['name'],
#             'role': user['role']
#         }
#     }), 200

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    # In a stateless JWT setup, client-side logout is sufficient
    # Server-side could implement token blacklisting for additional security
    return jsonify({"message": "Successfully logged out"}), 200

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    current_user_id = get_jwt_identity()
    user = AuthService.get_user_by_id(current_user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404
    
    return jsonify({
        'id': str(user['_id']),
        'email': user['email'],
        'name': user['name'],
        'role': user['role']
    }), 200

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    current_user_id = get_jwt_identity()
    user = AuthService.get_user_by_id(current_user_id)
    
    access_token = create_access_token(identity={
        'id': str(user['_id']),
        'email': user['email'],
        'role': user['role']
    })
    
    return jsonify({'access_token': access_token}), 200
