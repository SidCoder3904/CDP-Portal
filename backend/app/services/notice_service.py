from app.services.database import mongo
from bson.objectid import ObjectId
from datetime import datetime

class NoticeService:
    @staticmethod
    def create_notice(data, user_id):
        notice = {
            **data,
            'createdBy': ObjectId(user_id),
            'createdAt': datetime.utcnow(),
            'updatedAt': datetime.utcnow()
        }
        return mongo.db.notices.insert_one(notice)
    
    @staticmethod
    def get_notices(page=1, per_page=10):
        return list(mongo.db.notices.find()
                    .skip((page-1)*per_page)
                    .limit(per_page))
