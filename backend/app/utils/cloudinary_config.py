import logging
import cloudinary
import cloudinary.uploader
from dotenv import load_dotenv
import os
from werkzeug.utils import secure_filename
from datetime import datetime
from typing import Optional, Dict, Any

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

def upload_file(file: Any, folder: str = 'resumes', resource_type: str = 'raw', allowed_formats: list = None, public_id: str = None) -> Dict[str, Any]:
    """
    Upload a resume file to Cloudinary
    
    Args:
        file: The file to upload
        folder: The folder to upload to (default: 'resumes')
        resource_type: The type of resource (default: 'raw')
        allowed_formats: List of allowed file formats (default: None)
        public_id: Custom public ID for the file (default: None)
    
    Returns:
        Dict containing the upload result with URLs and metadata
    """
    try:
        # Validate file
        if not file:
            raise ValueError("No file provided")

        # Get file extension
        filename = secure_filename(file.filename)
        file_ext = os.path.splitext(filename)[1].lower()

        # Validate file format
        if allowed_formats and file_ext not in allowed_formats:
            raise ValueError(f"File format not allowed. Allowed formats: {', '.join(allowed_formats)}")
        elif not allowed_formats and file_ext != '.pdf':
            raise ValueError("Only PDF files are allowed")

        upload_params = {
            "folder": folder,
            "resource_type": resource_type,
            "format": "pdf",  # Force PDF format
            "resource_options": {
                "content_type": "application/pdf",
                "delivery_type": "upload"
            }
        }

        # Add public_id if provided
        if public_id:
            upload_params["public_id"] = public_id
            
        result = cloudinary.uploader.upload(file, **upload_params)
        
        # Get the secure URL with proper content type
        file_url = result.get('secure_url')
        if not file_url:
            raise ValueError("Failed to get file URL from Cloudinary")
            
        # For downloading, use the fl_attachment parameter
        download_url = file_url.replace('/upload/', '/upload/fl_attachment/')
        logger.info(f"Resume uploaded successfully. URL: {download_url}")
        
        # Add the download URL to the result
        result['download_url'] = download_url
            
        return result
    except Exception as e:
        logger.error(f"Cloudinary upload error: {str(e)}")
        raise Exception(f"Failed to upload resume to Cloudinary: {str(e)}")

def upload_notice(file: Any) -> str:
    """
    Upload a notice PDF to Cloudinary
    
    Args:
        file: The PDF file to upload
    
    Returns:
        str: The URL of the uploaded notice
    """
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

def delete_file(public_id: str) -> bool:
    """
    Delete a file from Cloudinary
    
    Args:
        public_id: The public ID of the file to delete
        
    Returns:
        bool: True if deletion was successful, False otherwise
    """
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
        logger.error(f"Error deleting from Cloudinary: {str(e)}")
        return False

def generate_public_id(prefix: str, identifier: str) -> str:
    """
    Generate a unique public ID for a file
    
    Args:
        prefix: The prefix for the public ID (e.g., 'resume', 'profile')
        identifier: A unique identifier (e.g., user ID)
        
    Returns:
        A unique public ID
    """
    timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
    return f"{prefix}_{identifier}_{timestamp}"

def get_file_url(public_id: str, resource_type: str = "auto") -> str:
    """
    Get the URL for a file in Cloudinary
    
    Args:
        public_id: The public ID of the file
        resource_type: Type of resource (auto, image, video, raw)
    
    Returns:
        URL of the file
    """
    try:
        return cloudinary.utils.cloudinary_url(public_id, resource_type=resource_type)[0]
    except Exception as e:
        raise Exception(f"Failed to get file URL from Cloudinary: {str(e)}")

def upload_profile_picture(
    file: Any,
    user_id: str,
    delete_previous: bool = True,
    previous_public_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Upload a profile picture to Cloudinary
    
    Args:
        file: The image file to upload
        user_id: The ID of the user
        delete_previous: Whether to delete the previous profile picture
        previous_public_id: The public ID of the previous profile picture to delete
    
    Returns:
        Dict containing upload result with URLs
    """
    try:
        # Validate file
        if not file:
            raise ValueError("No file provided")

        # Get file extension
        filename = secure_filename(file.filename)
        file_ext = os.path.splitext(filename)[1].lower()

        # Validate file format
        allowed_formats = ['.jpg', '.jpeg', '.png']
        if file_ext not in allowed_formats:
            raise ValueError(f"File format not allowed. Allowed formats: {', '.join(allowed_formats)}")

        # Delete previous profile picture if requested
        if delete_previous and previous_public_id:
            delete_file(previous_public_id)

        # Generate unique public ID
        public_id = generate_public_id('profile', user_id)

        upload_params = {
            "folder": "profile_pictures",
            "resource_type": "image",
            "public_id": public_id,
            "transformation": [
                {"width": 400, "height": 400, "crop": "fill"},
                {"quality": "auto:good"}
            ]
        }
            
        result = cloudinary.uploader.upload(file, **upload_params)
        
        # Get the secure URL
        file_url = result.get('secure_url')
        if file_url:
            # For viewing, use the original URL
            view_url = file_url
            # For thumbnail, use a smaller version
            thumbnail_url = file_url.replace('/upload/', '/upload/w_100,h_100,c_fill/')
            
            result['view_url'] = view_url
            result['thumbnail_url'] = thumbnail_url
            logger.info(f"Profile picture uploaded successfully. View URL: {view_url}")
            
        return result
    except Exception as e:
        logger.error(f"Cloudinary profile picture upload error: {str(e)}")
        raise Exception(f"Failed to upload profile picture to Cloudinary: {str(e)}")

def get_profile_picture_url(public_id: str, size: str = "full") -> str:
    """
    Get the URL for a profile picture in Cloudinary
    
    Args:
        public_id: The public ID of the profile picture
        size: The size of the image to return ('full' or 'thumbnail')
    
    Returns:
        URL of the profile picture
    """
    try:
        if size == "thumbnail":
            return cloudinary.utils.cloudinary_url(
                public_id,
                width=100,
                height=100,
                crop="fill",
                quality="auto:good"
            )[0]
        return cloudinary.utils.cloudinary_url(public_id)[0]
    except Exception as e:
        raise Exception(f"Failed to get profile picture URL from Cloudinary: {str(e)}") 