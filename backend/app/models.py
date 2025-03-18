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

class Application(Document):
    job = ReferenceField('Job', required=True)
    student = ReferenceField('Student', required=True)
    status = StringField(default='applied', choices=['applied', 'shortlisted', 'rejected', 'selected', 'on_hold'])
    current_stage = StringField(default='Application Submitted')
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)

class Notice(Document):
    title = StringField(required=True)
    content = StringField(required=True)
    created_by = StringField(required=True)
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
    type = StringField(required=True, choices=['Placement', 'Internship'])
    description = StringField(required=True)
    status = StringField(required=True, default='active')
    start_date = DateTimeField(required=True)
    end_date = DateTimeField(required=True)
    eligible_branches = ListField(StringField())
    eligible_programs = ListField(StringField())
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)

class Job(Document):
    cycle = ReferenceField('PlacementCycle', required=True)
    company = StringField(required=True)
    role = StringField(required=True)
    package = StringField(required=True)
    location = StringField(required=True)
    deadline = DateTimeField(required=True)
    eligibility = DictField(required=True)
    hiring_flow = ListField(DictField())
    job_description = StringField(required=True)
    job_description_file = StringField()
    status = StringField(default='open', choices=['open', 'closed', 'on_hold'])
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)

