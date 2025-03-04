from flask_pymongo import PyMongo
from bson.objectid import ObjectId
from datetime import datetime

# This will be initialized in app/__init__.py
mongo = PyMongo()

def initialize_db(app):
    """Initialize database with the Flask app"""
    mongo.init_app(app)
    
    # Create indexes for better query performance
    with app.app_context():
        # User indexes
        mongo.db.users.create_index("email", unique=True)
        
        # Notice indexes
        mongo.db.notices.create_index([("createdAt", -1)])
        mongo.db.notices.create_index([("type", 1)])
        
        # Comment indexes
        mongo.db.comments.create_index([("noticeId", 1)])
        
        # Student indexes
        mongo.db.students.create_index("rollNumber", unique=True)
        mongo.db.students.create_index("branch")
        
        # Document indexes
        mongo.db.documents.create_index([("studentId", 1)])
        mongo.db.documents.create_index([("type", 1)])
        
        # Placement cycle indexes
        mongo.db.placement_cycles.create_index([("startDate", -1)])
        mongo.db.placement_cycles.create_index([("type", 1)])
        mongo.db.placement_cycles.create_index([("status", 1)])
        
        # Job indexes
        mongo.db.jobs.create_index([("cycleId", 1)])
        mongo.db.jobs.create_index([("company", 1)])
        
        # Application indexes
        mongo.db.applications.create_index([("jobId", 1)])
        mongo.db.applications.create_index([("studentId", 1)])
        mongo.db.applications.create_index([("status", 1)])

def to_object_id(id_str):
    """Convert string ID to ObjectId safely"""
    try:
        return ObjectId(id_str)
    except:
        return None

def serialize_id(document):
    """Convert MongoDB ObjectId to string for JSON serialization"""
    if document and '_id' in document:
        document['id'] = str(document['_id'])
        del document['_id']
    return document

def serialize_document_list(documents):
    """Convert list of MongoDB documents for JSON serialization"""
    return [serialize_id(doc) for doc in documents]
