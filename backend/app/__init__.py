# app/__init__.py
from flask import Flask
from flask_pymongo import PyMongo
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_mail import Mail
from app.config import Config
import os


mongo = PyMongo()
mail = Mail()


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    print("Config: ", app.config)
    
    # Initialize extensions
    mongo.init_app(app)
    JWTManager(app)
    mail.init_app(app)
    
    # Configure CORS
    CORS(app, supports_credentials=True, resources={
        r"/api/*": {
            "origins": ["http://localhost:3000", "https://cdp-portal-chi.vercel.app"],
            "allow_headers": ["Content-Type", "Authorization"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "expose_headers": ["Content-Type", "Authorization"],
            "max_age": 3600
        }
    })

    # Check if MongoDB is initialized correctly
    try:
        # Attempt to access a collection to ensure connection
        mongo.db.list_collection_names()
        print("MongoDB initialized successfully.")
    except Exception as e:
        print(f"Error initializing MongoDB: {e}")
    
    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.notices import notices_bp
    from app.routes.comments import comments_bp
    from app.routes.students import students_bp
    from app.routes.documents import documents_bp
    from app.routes.placement_cycles import placement_cycles_bp
    from app.routes.jobs import jobs_bp
    from app.routes.reports import reports_bp
    from app.routes.admin import admin_bp
    from app.routes.notification_routes import notification_bp
    from app.routes.comment_routes import comment_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(notices_bp, url_prefix='/api/notices')
    app.register_blueprint(comments_bp, url_prefix='/api/comments')
    app.register_blueprint(students_bp, url_prefix='/api/students')
    app.register_blueprint(documents_bp, url_prefix='/api/documents')
    app.register_blueprint(placement_cycles_bp, url_prefix='/api/placement-cycles')
    app.register_blueprint(jobs_bp, url_prefix='/api/jobs')
    app.register_blueprint(reports_bp, url_prefix='/api/reports')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(notification_bp)
    app.register_blueprint(comment_bp)
    
    # Error handlers
    from app.utils.errors import register_error_handlers
    register_error_handlers(app)
    
    return app
