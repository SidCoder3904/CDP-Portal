from app import mongo
from bson.objectid import ObjectId
from datetime import datetime

class CommentService:
    @staticmethod
    def get_comments_by_notice(notice_id):
        """
        Get all comments for a specific notice.
        
        Args:
            notice_id: The ID of the notice
            
        Returns:
            List of comment documents for the specified notice
        """
        pipeline = [
            {'$match': {'noticeId': notice_id}},
            {'$sort': {'createdAt': -1}},
            {'$lookup': {
                'from': 'users',
                'localField': 'userId',
                'foreignField': '_id',
                'as': 'user'
            }},
            {'$unwind': '$user'},
            {'$lookup': {
                'from': 'users',
                'localField': 'repliedBy',
                'foreignField': '_id',
                'as': 'admin'
            }},
            {'$unwind': {
                'path': '$admin',
                'preserveNullAndEmptyArrays': True
            }},
            {'$project': {
                'content': 1,
                'adminReply': 1,
                'createdAt': 1,
                'repliedAt': 1,
                'user': {
                    '_id': 1,
                    'name': 1,
                    'role': 1
                },
                'admin': {
                    '_id': 1,
                    'name': 1
                }
            }}
        ]
        
        return list(mongo.db.comments.aggregate(pipeline))
    
    @staticmethod
    def get_comment_by_id(comment_id):
        """
        Get a specific comment by ID.
        
        Args:
            comment_id: The ID of the comment
            
        Returns:
            The comment document or None if not found
        """
        try:
            pipeline = [
                {'$match': {'_id': ObjectId(comment_id)}},
                {'$lookup': {
                    'from': 'users',
                    'localField': 'userId',
                    'foreignField': '_id',
                    'as': 'user'
                }},
                {'$unwind': '$user'},
                {'$lookup': {
                    'from': 'users',
                    'localField': 'repliedBy',
                    'foreignField': '_id',
                    'as': 'admin'
                }},
                {'$unwind': {
                    'path': '$admin',
                    'preserveNullAndEmptyArrays': True
                }},
                {'$project': {
                    'noticeId': 1,
                    'content': 1,
                    'adminReply': 1,
                    'createdAt': 1,
                    'repliedAt': 1,
                    'user': {
                        '_id': 1,
                        'name': 1,
                        'role': 1
                    },
                    'admin': {
                        '_id': 1,
                        'name': 1
                    }
                }}
            ]
            
            result = list(mongo.db.comments.aggregate(pipeline))
            return result[0] if result else None
        except Exception:
            return None
    
    @staticmethod
    def create_comment(notice_id, user_id, content):
        """
        Create a new comment on a notice.
        
        Args:
            notice_id: The ID of the notice
            user_id: The ID of the user creating the comment
            content: The comment content
            
        Returns:
            The ID of the newly created comment
        """
        comment = {
            'noticeId': notice_id,
            'userId': ObjectId(user_id),
            'content': content,
            'createdAt': datetime.utcnow(),
            'updatedAt': datetime.utcnow()
        }
        result = mongo.db.comments.insert_one(comment)
        return str(result.inserted_id)
    
    @staticmethod
    def add_reply(comment_id, admin_id, reply_content):
        """
        Add an admin reply to a comment.
        
        Args:
            comment_id: The ID of the comment to reply to
            admin_id: The ID of the admin user
            reply_content: The reply content
            
        Returns:
            True if reply was added successfully, False otherwise
        """
        try:
            result = mongo.db.comments.update_one(
                {'_id': ObjectId(comment_id)},
                {
                    '$set': {
                        'adminReply': reply_content,
                        'repliedBy': ObjectId(admin_id),
                        'repliedAt': datetime.utcnow(),
                        'updatedAt': datetime.utcnow()
                    }
                }
            )
            return result.modified_count > 0
        except Exception:
            return False
    
    @staticmethod
    def delete_comment(comment_id):
        """
        Delete a comment.
        
        Args:
            comment_id: The ID of the comment to delete
            
        Returns:
            True if deletion was successful, False otherwise
        """
        try:
            result = mongo.db.comments.delete_one({'_id': ObjectId(comment_id)})
            return result.deleted_count > 0
        except Exception:
            return False
    
    @staticmethod
    def can_delete_comment(comment_id, user_id, user_role):
        """
        Check if a user can delete a comment.
        
        Args:
            comment_id: The ID of the comment
            user_id: The ID of the user
            user_role: The role of the user
            
        Returns:
            True if user can delete the comment, False otherwise
        """
        # Admins can delete any comment
        if user_role == 'admin':
            return True
        
        # Students can only delete their own comments
        try:
            comment = mongo.db.comments.find_one({'_id': ObjectId(comment_id)})
            return comment and str(comment['userId']) == user_id
        except Exception:
            return False
    
    @staticmethod
    def get_pending_comments():
        """
        Get comments that haven't been replied to by an admin.
        
        Returns:
            List of pending comment documents
        """
        pipeline = [
            {'$match': {
                '$or': [
                    {'adminReply': {'$exists': False}},
                    {'adminReply': None}
                ]
            }},
            {'$lookup': {
                'from': 'notices',
                'localField': 'noticeId',
                'foreignField': '_id',
                'as': 'notice'
            }},
            {'$unwind': '$notice'},
            {'$lookup': {
                'from': 'users',
                'localField': 'userId',
                'foreignField': '_id',
                'as': 'user'
            }},
            {'$unwind': '$user'},
            {'$sort': {'createdAt': -1}},
            {'$project': {
                'content': 1,
                'createdAt': 1,
                'notice': {
                    '_id': 1,
                    'title': 1
                },
                'user': {
                    '_id': 1,
                    'name': 1
                }
            }}
        ]
        
        return list(mongo.db.comments.aggregate(pipeline))
