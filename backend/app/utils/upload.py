# app/utils/upload.py
import os
import uuid
from werkzeug.utils import secure_filename
from flask import current_app

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in current_app.config['ALLOWED_EXTENSIONS']

def save_file(file):
    filename = secure_filename(file.filename)
    # Generate unique filename to prevent collisions
    unique_filename = f"{uuid.uuid4()}_{filename}"
    
    # Ensure upload directory exists
    os.makedirs(current_app.config['UPLOAD_FOLDER'], exist_ok=True)
    
    file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], unique_filename)
    file.save(file_path)
    
    return file_path
