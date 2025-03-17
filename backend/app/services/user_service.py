from app import mongo
from bson import ObjectId

def get_user_by_id(user_id):
    """Get a user by ID"""
    try:
        return mongo.db.users.find_one({"_id": ObjectId(user_id)})
    except:
        return None

def get_student_by_id(student_id):
    """Get a student by ID"""
    try:
        return mongo.db.students.find_one({"_id": ObjectId(student_id)})
    except:
        return None

def is_admin(user_id):
    """Check if a user is an admin"""
    try:
        user = mongo.db.users.find_one({"_id": ObjectId(user_id)})
        if not user:
            return False
            
        # Assuming admin users are not in the Student collection
        student = mongo.db.students.find_one({"email": user.get("email")})
        return student is None
    except:
        return False

