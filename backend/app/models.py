from mongoengine import Document, StringField, IntField, FloatField, ListField, ReferenceField, DateTimeField, BooleanField, ObjectIdField, DictField
from datetime import datetime

class User(Document):
    email = StringField(required=True, unique=True)
    password = StringField(required=True)
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)

class Student(Document):
    email = StringField(required=True, unique=True)
    roll_number = StringField(required=True, unique=True)
    branch = StringField(required=True)
    cgpa = FloatField(required=True)
    gender = StringField(choices=['male', 'female', 'other'])
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)

class Job(Document):
    cycle_id = ObjectIdField(required=True)
    company = StringField(required=True)
    role = StringField(required=True)
    stipend = StringField()
    salary = StringField()
    accommodation = BooleanField(default=False)
    eligibility = DictField()
    hiring_flow = ListField(StringField())
    job_description = StringField()
    status = StringField(default='open')
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)

class Application(Document):
    job_id = ObjectIdField(required=True)
    student_id = ObjectIdField(required=True)
    status = StringField(default='applied')
    current_stage = StringField(default='Application Submitted')
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)

class Notice(Document):
    title = StringField(required=True)
    content = StringField(required=True)
    created_by = ObjectIdField(required=True)
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)

class Comment(Document):
    notice_id = ObjectIdField(required=True)
    user_id = ObjectIdField(required=True)
    content = StringField(required=True)
    admin_reply = StringField()
    replied_by = ObjectIdField()
    created_at = DateTimeField(default=datetime.utcnow)
    replied_at = DateTimeField()
    updated_at = DateTimeField(default=datetime.utcnow)

class DocumentModel(Document):
    student_id = ObjectIdField(required=True)
    name = StringField(required=True)
    type = StringField(required=True)
    file_url = StringField(required=True)
    verified = BooleanField(default=False)
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)

class PlacementCycle(Document):
    name = StringField(required=True)
    year = IntField(required=True)
    type = StringField(required=True)
    status = StringField(required=True)
    start_date = DateTimeField(required=True)
    end_date = DateTimeField(required=True)
    eligible_branches = ListField(StringField())
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)


