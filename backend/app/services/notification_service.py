from datetime import datetime
from app import mongo
from bson import ObjectId

class NotificationService:
    def get_notifications(self, placement_cycle_id: str) -> list:
        """Get all notifications for a placement cycle"""
        notifications = list(mongo.db.notifications.find(
            {"placement_cycle_id": placement_cycle_id}
        ).sort("created_at", -1))
        
        # Convert ObjectId to string for JSON serialization
        for notification in notifications:
            notification['_id'] = str(notification['_id'])
        
        return notifications

    def create_notification(self, data: dict) -> dict:
        """Create a new notification"""
        notification = {
            "title": data['title'],
            "message": data['message'],
            "type": data['type'],
            "placement_cycle_id": data['placement_cycle_id'],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "created_by": data.get('created_by', 'Admin')
        }
        
        result = mongo.db.notifications.insert_one(notification)
        notification['_id'] = str(result.inserted_id)
        return notification

    def update_notification(self, notification_id: str, data: dict):
        """Update an existing notification"""
        update_data = {
            "title": data['title'],
            "message": data['message'],
            "type": data['type'],
            "updated_at": datetime.utcnow()
        }
        
        result = mongo.db.notifications.update_one(
            {"_id": ObjectId(notification_id)},
            {"$set": update_data}
        )
        
        if result.modified_count == 0:
            raise Exception("Notification not found or no changes made")
            
        # Get the updated notification
        updated_notification = mongo.db.notifications.find_one({"_id": ObjectId(notification_id)})
        updated_notification['_id'] = str(updated_notification['_id'])
        return updated_notification

    def delete_notification(self, notification_id: str):
        """Delete a notification"""
        result = mongo.db.notifications.delete_one({"_id": ObjectId(notification_id)})
        if result.deleted_count == 0:
            raise Exception("Notification not found")

    def mark_as_read(self, notification_id: str) -> dict:
        """Mark a notification as read"""
        notification = mongo.db.notification.find_one({'_id': ObjectId(notification_id)})
        if not notification:
            raise ValueError('Notification not found')
            
        mongo.db.notification.update_one(
            {'_id': ObjectId(notification_id)},
            {
                '$set': {
                    'updated_at': datetime.utcnow()
                }
            }
        )
        
        notification['_id'] = str(notification['_id'])
        notification['updated_at'] = datetime.utcnow()
        return notification

    def mark_all_as_read(self, placement_cycle_id: str) -> None:
        """Mark all notifications for a placement cycle as read"""
        mongo.db.notification.update_many(
            {
                'placement_cycle_id': placement_cycle_id
            },
            {
                '$set': {
                    'updated_at': datetime.utcnow()
                }
            }
        ) 