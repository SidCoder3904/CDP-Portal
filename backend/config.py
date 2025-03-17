import os
from datetime import timedelta

class Config:
    # Flask configuration
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-key')
    
    # MongoDB configuration
    MONGO_URI = os.environ.get('MONGO_URI', 'mongodb+srv://singlasamarth28:uxEfpEoOLoRYxgNI@cluster.t79va.mongodb.net/placement_portal')
    
    # JWT configuration
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'jwt-secret-key')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)

