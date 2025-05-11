from datetime import datetime
from app import mongo
from bson import ObjectId
from app.services.email_service import EmailService

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

    def get_student_notifications(self, email: str) -> dict:
        """Get notifications for a student based on their email (batch and program)"""
        try:
            # Extract batch and program from email
            batch = email[:4]  # First 4 characters are batch year
            program_match = email.split('cs')[1][0]  # Get the character after 'cs'
            program = 'btech' if program_match == 'b' else 'mtech'

            print(f"Looking for cycle with batch: {batch} and program: {program}")

            # First get all active cycles
            active_cycles = list(mongo.db.placement_cycles.find({"status": "active"}))
            
            # Convert ObjectId to string and print cycle details for debugging
            for cycle in active_cycles:
                cycle['_id'] = str(cycle['_id'])
                print(f"Found cycle: {cycle}")

            # Find cycle matching student's batch and program
            matching_cycle = None
            for cycle in active_cycles:
                if cycle.get('batch') == batch and program in cycle.get('eligiblePrograms', []):
                    matching_cycle = cycle
                    break

            if not matching_cycle:
                return {
                    "error": "No active placement cycle found for your batch and program",
                    "notifications": []
                }

            # Get notifications for the matching cycle
            notifications = list(mongo.db.notifications.find(
                {"placement_cycle_id": matching_cycle['_id']}
            ).sort("created_at", -1))

            # Convert ObjectId to string for JSON serialization
            for notification in notifications:
                notification['_id'] = str(notification['_id'])
            
            return {
                "cycle": matching_cycle,
                "notifications": notifications
            }
        except Exception as e:
            print(f"Error in get_student_notifications: {str(e)}")
            return {
                "error": f"Error processing request: {str(e)}",
                "notifications": []
            }

    def create_notification(self, data: dict) -> dict:
        """Create a new notification"""
        print("\n=== Creating New Notification ===")
        print(f"Data received: {data}")
        
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
        print(f"Notification created successfully with ID: {notification['_id']}")

        # Send email notification for new notification
        try:
            print("\n=== Attempting to Send Email ===")
            EmailService.send_notice_notification(
                cycle_id=data['placement_cycle_id'],
                notice_type="add",
                notice_title=data['title'],
                notice_content=data['message']
            )
            print("Email service called successfully")
        except Exception as e:
            print(f"❌ Error in email service: {str(e)}")
            print("Continuing without email notification")

        return notification

    def update_notification(self, notification_id: str, data: dict):
        """Update an existing notification"""
        print("\n=== Updating Notification ===")
        print(f"Notification ID: {notification_id}")
        print(f"Update data: {data}")
        
        # Get the original notification to get the placement cycle ID
        original_notification = mongo.db.notifications.find_one({"_id": ObjectId(notification_id)})
        if not original_notification:
            raise Exception("Notification not found")

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
        print("Notification updated successfully")

        # Send email notification for updated notification
        try:
            print("\n=== Attempting to Send Email ===")
            EmailService.send_notice_notification(
                cycle_id=original_notification['placement_cycle_id'],
                notice_type="update",
                notice_title=data['title'],
                notice_content=data['message']
            )
            print("Email service called successfully")
        except Exception as e:
            print(f"❌ Error in email service: {str(e)}")
            print("Continuing without email notification")

        return updated_notification

    def delete_notification(self, notification_id: str):
        """Delete a notification"""
        print("\n=== Deleting Notification ===")
        print(f"Notification ID: {notification_id}")
        
        # Get the notification before deleting to get its details
        notification = mongo.db.notifications.find_one({"_id": ObjectId(notification_id)})
        if not notification:
            raise Exception("Notification not found")

        result = mongo.db.notifications.delete_one({"_id": ObjectId(notification_id)})
        if result.deleted_count == 0:
            raise Exception("Notification not found")
        
        print("Notification deleted successfully")

        # Send email notification for deleted notification
        try:
            print("\n=== Attempting to Send Email ===")
            EmailService.send_notice_notification(
                cycle_id=notification['placement_cycle_id'],
                notice_type="delete",
                notice_title=notification['title'],
                notice_content=notification['message']
            )
            print("Email service called successfully")
        except Exception as e:
            print(f"❌ Error in email service: {str(e)}")
            print("Continuing without email notification")

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