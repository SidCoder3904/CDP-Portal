from mongoengine import Document, StringField, IntField, FloatField, ListField, ReferenceField, DateTimeField, BooleanField, ObjectIdField, DictField, EmbeddedDocument, EmbeddedDocumentField
from datetime import datetime

class users(Document):
    email = StringField(required=True, unique=True)
    password = StringField(required=True)
    role = StringField(choices=['admin', 'student'], default='student')
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)

class studentDetails(Document):
    user_id = ObjectIdField(required=True)
    roll_number = StringField(required=True, unique=True)
    branch = StringField(required=True)
    cgpa = FloatField(required=True)
    gender = StringField(choices=['male', 'female', 'other'])
    batch = IntField()  # Graduation year
    program = StringField()  # B.Tech, M.Tech, etc.
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)

class placement_cycles(Document):
    name = StringField(required=True)
    year = IntField(required=True)
    type = StringField(required=True, choices=['placement', 'internship'])
    description = StringField()
    status = StringField(required=True, default='active', choices=['active', 'inactive'])
    start_date = DateTimeField(required=True)
    end_date = DateTimeField(required=True)
    eligible_branches = ListField(StringField())
    eligible_programs = ListField(StringField())
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)

class Eligibility(EmbeddedDocument):
    cgpa = FloatField(required=True)
    gender = StringField(choices=['all', 'male', 'female', 'other'], default='all')
    branches = ListField(StringField(), required=True)
    degrees = ListField(StringField())
    batches = ListField(IntField())

class HiringStep(EmbeddedDocument):
    step = StringField(required=True)
    description = StringField(required=True)

class jobs(Document):
    cycle_id = ObjectIdField(required=True)  # Reference to PlacementCycle
    company = StringField(required=True)
    role = StringField(required=True)
    location = StringField()
    logo = StringField()  # URL to company logo
    stipend = StringField()  # For internships
    salary = StringField()  # For placements
    accommodation = BooleanField(default=False)
    jobType = StringField(choices=['Internship', 'Placement'])
    eligibility = DictField(required=True)  # Contains cgpa, gender, branches, etc.
    hiring_flow = ListField(DictField())  # List of hiring steps
    job_description = StringField(required=True)  # Can be a string or converted to array in frontend
    job_functions = ListField(StringField())  # Categories/tags for the job
    status = StringField(default='open', choices=['open', 'closed', 'on_hold'])
    deadline = DateTimeField()
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)
    
    meta = {
        'collection': 'jobs'  # Explicitly set collection name
    }

class Application(Document):
    job_id = ObjectIdField(required=True)  # Reference to Job
    student_id = ObjectIdField(required=True)  # Reference to Student
    status = StringField(default='applied', choices=['applied', 'shortlisted', 'rejected', 'selected', 'on_hold'])
    current_stage = StringField(default='Application Submitted')
    resume_id = ObjectIdField()  # Reference to DocumentModel
    cover_letter = StringField()
    answers = DictField()  # For any additional questions
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)
    
    meta = {
        'collection': 'applications'  # Explicitly set collection name
    }

class Notice(Document):
    title = StringField(required=True)
    content = StringField(required=True)
    created_by = ObjectIdField(required=True)
    is_pinned = BooleanField(default=False)
    category = StringField(default='general')
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


