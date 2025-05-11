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

    @staticmethod
    def get_comments(placement_cycle_id: str):
        """Get all comments for a placement cycle"""
        try:
            # Validate placement_cycle_id
            if not placement_cycle_id:
                raise ValueError("placement_cycle_id is required")

            print(f"Fetching comments for placement cycle: {placement_cycle_id}")  # Debug log

            # Find comments for this placement cycle
            query = {"placement_cycle_id": placement_cycle_id}
            print(f"MongoDB query: {query}")  # Debug log

            comments = list(mongo.db.comments.find(query).sort("created_at", -1))
            print(f"Found {len(comments)} comments")  # Debug log
            
            # Convert ObjectId to string for JSON serialization
            serialized_comments = []
            for comment in comments:
                # Create a new dict to avoid modifying the original
                serialized_comment = {}
                
                # Convert all fields
                for key, value in comment.items():
                    if isinstance(value, ObjectId):
                        serialized_comment[key] = str(value)
                    elif isinstance(value, dict):
                        # Handle nested dictionaries (like reply)
                        serialized_dict = {}
                        for k, v in value.items():
                            if isinstance(v, ObjectId):
                                serialized_dict[k] = str(v)
                            else:
                                serialized_dict[k] = v
                        serialized_comment[key] = serialized_dict
                    else:
                        serialized_comment[key] = value
                
                # Ensure all required fields are present
                if 'reply' not in serialized_comment:
                    serialized_comment['reply'] = None
                if 'created_at' not in serialized_comment:
                    serialized_comment['created_at'] = datetime.utcnow().isoformat()
                if 'updated_at' not in serialized_comment:
                    serialized_comment['updated_at'] = datetime.utcnow().isoformat()
                
                serialized_comments.append(serialized_comment)
            
            return serialized_comments
        except Exception as e:
            print(f"Error in get_comments: {str(e)}")  # Debug log
            print(f"Error type: {type(e)}")  # Debug log
            import traceback
            print(f"Traceback: {traceback.format_exc()}")  # Debug log
            raise Exception(f"Failed to fetch comments: {str(e)}")

    def create_comment(self, data: dict):
        """Create a new comment"""
        comment = {
            "content": data['content'],
            "user": data['user'],
            "user_type": data['user_type'],
            "placement_cycle_id": data['placement_cycle_id'],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        result = mongo.db.comments.insert_one(comment)
        comment['_id'] = str(result.inserted_id)
        return comment

    def delete_comment(self, comment_id: str):
        """Delete a comment by ID"""
        result = mongo.db.comments.delete_one({"_id": ObjectId(comment_id)})
        if result.deleted_count == 0:
            raise Exception("Comment not found")
