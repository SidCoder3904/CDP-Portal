# app/services/auth_service.py
from app import mongo
from werkzeug.security import generate_password_hash, check_password_hash
from bson.objectid import ObjectId
from datetime import datetime

class AuthService:
    @staticmethod
    def authenticate_user(email, password):
        user = mongo.db.users.find_one({'email': email})
        if user and check_password_hash(user['password'], password):
            return user
        return None
    
    @staticmethod
    def get_user_by_id(user_id):
        try:
            return mongo.db.users.find_one({'_id': ObjectId(user_id)})
        except:
            return None
    
    @staticmethod
    def create_user(user_data):
        existing_user = mongo.db.users.find_one({'email': user_data['email']})
        if existing_user:
            return None
        
        user_data['password'] = generate_password_hash(user_data['password'])
        user_data['createdAt'] = datetime.utcnow()
        user_data['updatedAt'] = datetime.utcnow()
        
        result = mongo.db.users.insert_one(user_data)
        return str(result.inserted_id)
