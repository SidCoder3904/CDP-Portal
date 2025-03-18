import logging
import cloudinary
import cloudinary.uploader
from dotenv import load_dotenv
import os
from werkzeug.utils import secure_filename

# Set up logging
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Cloudinary configuration
cloudinary.config(
    cloud_name="dszmntl6x",
    api_key="232819685446349",
    api_secret="4H7wqHwFXwJrqgxtQkp5JbxPTG0",
)

def upload_file(file):
    try:
        # Secure the filename
        filename = secure_filename(file.filename)
        
        # Upload the file as raw
        result = cloudinary.uploader.upload(
            file,
            resource_type="raw",  # Set resource type to raw for PDF files
            folder="notices",     # Optional: organize files in a folder
            public_id=filename,   # Use the original filename as public_id
            format="pdf",         # Explicitly set format to PDF
            resource_options={
                "content_type": "application/pdf",
                "delivery_type": "upload"
            }
        )
        
        # Get the secure URL with proper content type
        file_url = result.get('secure_url')
        if file_url:
            # Ensure the URL has the correct content type
            file_url = file_url.replace('/upload/', '/upload/fl_attachment/')
            logger.info(f"File uploaded successfully. URL: {file_url}")
        
        return file_url
        
    except Exception as e:
        logger.error(f"Error uploading file to Cloudinary: {str(e)}", exc_info=True)
        return None

def delete_file(public_id):
    try:
        # For raw files, we need to include the file extension in the public_id
        # and specify resource_type as "raw"
        result = cloudinary.uploader.destroy(
            public_id,
            resource_type="raw",
            invalidate=True
        )
        logger.info(f"Cloudinary delete result: {result}")
        return result.get('result') == 'ok'
    except Exception as e:
        logger.error(f"Error deleting from Cloudinary: {str(e)}", exc_info=True)
        return False