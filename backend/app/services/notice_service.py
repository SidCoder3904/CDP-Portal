from app import mongo
from bson.objectid import ObjectId
from datetime import datetime
import logging
from app.utils.cloudinary_config import delete_file
import re

logger = logging.getLogger(__name__)

class NoticeService:
    @staticmethod
    def create_notice(data, user_id):
        try:
            notice = {
                'title': data.get('title'),
                'description': data.get('description', ''),
                'link': data.get('link'),
                'type': 'pdf',
                'date': data.get('date'),
                'createdBy': ObjectId(user_id),
                'createdAt': datetime.utcnow(),
                'updatedAt': datetime.utcnow()
            }
            
            result = mongo.db.notices.insert_one(notice)
            logger.info(f"Created notice with ID: {result.inserted_id}")
            return result.inserted_id
        except Exception as e:
            logger.error(f"Error creating notice: {str(e)}", exc_info=True)
            raise Exception(f"Failed to create notice: {str(e)}")

    @staticmethod
    def get_notice_by_id(notice_id):
        try:
            notice = mongo.db.notices.find_one({'_id': ObjectId(notice_id)})
            if notice:
                notice['_id'] = str(notice['_id'])
                if 'createdBy' in notice:
                    notice['createdBy'] = str(notice['createdBy'])
            return notice
        except Exception as e:
            logger.error(f"Error fetching notice by ID: {str(e)}", exc_info=True)
            return None

    @staticmethod
    def get_notices(page=1, per_page=10, notice_type=None, company=None):
        try:
            # Build query
            query = {}
            if notice_type:
                query['type'] = notice_type
            if company:
                query['company'] = company

            # Get total count
            total = mongo.db.notices.count_documents(query)

            # Get notices with pagination
            notices = list(mongo.db.notices.find(query)
                        .sort('createdAt', -1)
                        .skip((page-1)*per_page)
                        .limit(per_page))

            # Convert ObjectId to string for JSON serialization
            for notice in notices:
                notice['_id'] = str(notice['_id'])
                if 'createdBy' in notice:
                    notice['createdBy'] = str(notice['createdBy'])

            return notices, total

        except Exception as e:
            logger.error(f"Error fetching notices: {str(e)}", exc_info=True)
            raise Exception(f"Failed to fetch notices: {str(e)}")

    @staticmethod
    def update_notice(notice_id, data):
        try:
            update_data = {
                'title': data.get('title'),
                'description': data.get('description', ''),
                'link': data.get('link'),
                'type': 'pdf',
                'date': data.get('date'),
                'updatedAt': datetime.utcnow()
            }
            
            result = mongo.db.notices.update_one(
                {'_id': ObjectId(notice_id)},
                {'$set': update_data}
            )
            return result.modified_count > 0
        except Exception as e:
            logger.error(f"Error updating notice: {str(e)}", exc_info=True)
            return False

    @staticmethod
    def delete_notice(notice_id):
        try:
            # First get the notice to get the file URL
            notice = mongo.db.notices.find_one({'_id': ObjectId(notice_id)})
            if not notice:
                return False

            # Extract public_id from Cloudinary URL for raw files
            # Example URL: https://res.cloudinary.com/dszmntl6x/raw/upload/v1234567890/notices/filename.pdf
            file_url = notice.get('link', '')
            if file_url:
                try:
                    # Get the full filename including extension for raw files
                    parts = file_url.split('/notices/')
                    if len(parts) > 1:
                        filename = parts[1].split('?')[0]  # Remove any query parameters
                        # Include the full filename with extension for raw files
                        public_id = f"notices/{filename}"
                        
                        logger.info(f"Attempting to delete raw file from Cloudinary. URL: {file_url}, Public ID: {public_id}")
                        delete_result = delete_file(public_id)
                        if not delete_result:
                            logger.error(f"Failed to delete raw file from Cloudinary: {public_id}")
                except Exception as e:
                    logger.error(f"Error processing Cloudinary deletion: {str(e)}")

            # Delete notice from database
            result = mongo.db.notices.delete_one({'_id': ObjectId(notice_id)})
            return result.deleted_count > 0
        except Exception as e:
            logger.error(f"Error deleting notice: {str(e)}", exc_info=True)
            return False
