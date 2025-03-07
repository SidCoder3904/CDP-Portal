# app/services/auth_service.py
import random
from app import mongo
from werkzeug.security import generate_password_hash, check_password_hash
from bson.objectid import ObjectId
from datetime import datetime, timedelta


class AuthService:
    @staticmethod
    def generate_otp(user_id):
        # otp = random.randint(100000, 999999)
        otp = 123456
        # Store OTP in the database with an expiration time
        mongo.db.otps.update_one(
            {'user_id': ObjectId(user_id)},  # find by user_id
            {
                '$set': {
                    'otp': otp,
                    'expires_at': datetime.utcnow() + timedelta(minutes=5)
                }
            },
            upsert=True  # creates new document if none exists
        )
        return otp

    @staticmethod
    def verify_otp(user_id, otp):
        record = mongo.db.otps.find_one({'user_id': ObjectId(user_id), 'otp': int(otp)})
        if record and record['expires_at'] > datetime.utcnow():
            mongo.db.otps.delete_one({'_id': record['_id']})  # Remove OTP after verification
            return True
        return False


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
