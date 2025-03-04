# app/__init__.py
from flask import Flask
from flask_pymongo import PyMongo
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from app.config import Config
import os


mongo = PyMongo()
jwt = JWTManager()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Initialize extensions
    mongo.init_app(app)
    jwt.init_app(app)
    CORS(app)
    
    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.notices import notices_bp
    from app.routes.comments import comments_bp
    from app.routes.students import students_bp
    from app.routes.documents import documents_bp
    from app.routes.placement_cycles import placement_cycles_bp
    from app.routes.jobs import jobs_bp
    from app.routes.reports import reports_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(notices_bp, url_prefix='/api/notices')
    app.register_blueprint(comments_bp, url_prefix='/api/comments')
    app.register_blueprint(students_bp, url_prefix='/api/students')
    app.register_blueprint(documents_bp, url_prefix='/api/documents')
    app.register_blueprint(placement_cycles_bp, url_prefix='/api/placement-cycles')
    app.register_blueprint(jobs_bp, url_prefix='/api/jobs')
    app.register_blueprint(reports_bp, url_prefix='/api/reports')
    
    # Error handlers
    from app.utils.errors import register_error_handlers
    register_error_handlers(app)
    
    return app
