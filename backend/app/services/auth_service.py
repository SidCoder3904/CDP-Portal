# app/services/auth_service.py
import random
from app import mongo, mail
from werkzeug.security import generate_password_hash, check_password_hash
from bson.objectid import ObjectId
from datetime import datetime, timedelta
from app.services.email_service import EmailService
from flask import current_app
from flask_mail import Message


class AuthService:
    @staticmethod
    def generate_otp(user_id):
        # Generate a 6-digit OTP
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
        
        # Get user email
        user = mongo.db.users.find_one({'_id': ObjectId(user_id)})
        if not user:
            raise Exception("User not found")
            
        # Send OTP via email
        try:
            msg = Message(
                subject="Your Login OTP",
                sender=current_app.config.get('MAIL_DEFAULT_SENDER'),
                recipients=[user['email']],
                body=f"""
                Your OTP for login is: {otp}
                
                This OTP will expire in 5 minutes.
                
                If you did not request this OTP, please ignore this email.
                """
            )
            mail.send(msg)
        except Exception as e:
            print(f"Error sending OTP email: {str(e)}")
            raise Exception("Failed to send OTP email")
            
        return otp

    @staticmethod
    def verify_otp(user_id, otp):
        record = mongo.db.otps.find_one({'user_id': ObjectId(user_id), 'otp': int(otp)})
        if record and record['expires_at'] > datetime.utcnow():
            mongo.db.otps.delete_one({'_id': record['_id']})  # Remove OTP after verification
            return True
        return False

    @staticmethod
    def get_user_by_email(email):
        """Get user by email without password verification"""
        try:
            return mongo.db.users.find_one({'email': email})
        except Exception as e:
            print(f"Error getting user by email: {str(e)}")
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
