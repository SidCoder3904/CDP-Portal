from datetime import datetime
import re

def validate_login(data):
    """
    Validate login data.
    
    Args:
        data: Dictionary containing login data
        
    Returns:
        Dictionary of validation errors or None if valid
    """
    errors = {}
    
    if not data.get('email'):
        errors['email'] = 'Email is required'
    
    if not data.get('password'):
        errors['password'] = 'Password is required'
    
    return errors if errors else None

def validate_register(data):
    """
    Validate registration data.
    
    Args:
        data: Dictionary containing registration data
        
    Returns:
        Dictionary of validation errors or None if valid
    """
    errors = {}
    
    if not data.get('name'):
        errors['name'] = 'Name is required'
    
    if not data.get('email'):
        errors['email'] = 'Email is required'
    elif not re.match(r"[^@]+@[^@]+\.[^@]+", data.get('email', '')):
        errors['email'] = 'Invalid email format'
    
    if not data.get('password'):
        errors['password'] = 'Password is required'
    elif len(data.get('password', '')) < 8:
        errors['password'] = 'Password must be at least 8 characters'
    
    if data.get('role') not in ['admin', 'student']:
        errors['role'] = 'Role must be admin or student'
    
    return errors if errors else None

def validate_notice(data):
    """
    Validate notice data.
    
    Args:
        data: Dictionary containing notice data
        
    Returns:
        Dictionary of validation errors or None if valid
    """
    errors = {}
    
    if not data.get('title'):
        errors['title'] = 'Title is required'
    elif len(data.get('title', '')) < 5:
        errors['title'] = 'Title must be at least 5 characters'
    
    if not data.get('content'):
        errors['content'] = 'Content is required'
    elif len(data.get('content', '')) < 10:
        errors['content'] = 'Content must be at least 10 characters'
    
    if not data.get('type') or data.get('type') not in ['placement', 'internship', 'workshop']:
        errors['type'] = 'Type must be placement, internship, or workshop'
    
    return errors if errors else None

def validate_comment(data):
    """
    Validate comment data.
    
    Args:
        data: Dictionary containing comment data
        
    Returns:
        Dictionary of validation errors or None if valid
    """
    errors = {}
    
    if not data.get('content'):
        errors['content'] = 'Comment content is required'
    elif len(data.get('content', '')) < 1:
        errors['content'] = 'Comment cannot be empty'
    elif len(data.get('content', '')) > 1000:
        errors['content'] = 'Comment cannot exceed 1000 characters'
    
    return errors if errors else None

def validate_placement_cycle(data):
    """
    Validate placement cycle data.
    
    Args:
        data: Dictionary containing placement cycle data
        
    Returns:
        Dictionary of validation errors or None if valid
    """
    errors = {}
    
    if not data.get('name'):
        errors['name'] = 'Name is required'
    
    if not data.get('type') or data.get('type') not in ['Placement', 'Internship']:
        errors['type'] = 'Type must be Placement or Internship'
    
    if not data.get('description'):
        errors['description'] = 'Description is required'
    elif len(data.get('description', '')) < 10:
        errors['description'] = 'Description must be at least 10 characters'
    
    if not data.get('status') or data.get('status') not in ['active', 'completed', 'upcoming']:
        errors['status'] = 'Status must be active, completed, or upcoming'
    
    if not data.get('startDate'):
        errors['startDate'] = 'Start date is required'
    
    if not data.get('endDate'):
        errors['endDate'] = 'End date is required'
    
    if not data.get('eligibleBranches') or not isinstance(data.get('eligibleBranches'), list):
        errors['eligibleBranches'] = 'Eligible branches are required and must be a list'
    elif len(data.get('eligibleBranches', [])) == 0:
        errors['eligibleBranches'] = 'At least one eligible branch is required'
    
    if not data.get('eligiblePrograms') or not isinstance(data.get('eligiblePrograms'), list):
        errors['eligiblePrograms'] = 'Eligible programs are required and must be a list'
    elif len(data.get('eligiblePrograms', [])) == 0:
        errors['eligiblePrograms'] = 'At least one eligible program is required'
    
    # Validate start and end dates
    try:
        start_date = datetime.strptime(data.get('startDate', ''), '%Y-%m-%d')
        end_date = datetime.strptime(data.get('endDate', ''), '%Y-%m-%d')
        
        if end_date < start_date:
            errors['endDate'] = 'End date cannot be before start date'
    except ValueError:
        if 'startDate' not in errors:
            errors['startDate'] = 'Invalid date format (use YYYY-MM-DD)'
        if 'endDate' not in errors:
            errors['endDate'] = 'Invalid date format (use YYYY-MM-DD)'
    
    return errors if errors else None

def validate_job(data):
    """
    Validate job data.
    
    Args:
        data: Dictionary containing job data
        
    Returns:
        Dictionary of validation errors or None if valid
    """
    errors = {}
    
    if not data.get('company'):
        errors['company'] = 'Company name is required'
    
    if not data.get('role'):
        errors['role'] = 'Job role is required'
    
    if not data.get('jobDescription'):
        errors['jobDescription'] = 'Job description is required'
    
    # Validate eligibility criteria
    if not data.get('eligibility') or not isinstance(data.get('eligibility'), dict):
        errors['eligibility'] = 'Eligibility criteria are required'
    else:
        eligibility = data.get('eligibility')
        
        if not eligibility.get('cgpa'):
            errors['eligibility.cgpa'] = 'CGPA requirement is required'
        elif not isinstance(eligibility.get('cgpa'), (int, float, str)):
            errors['eligibility.cgpa'] = 'CGPA must be a number'
        elif isinstance(eligibility.get('cgpa'), str) and not eligibility.get('cgpa').replace('.', '', 1).isdigit():
            errors['eligibility.cgpa'] = 'CGPA must be a valid number'
        
        if not eligibility.get('gender') or eligibility.get('gender') not in ['All', 'Male', 'Female']:
            errors['eligibility.gender'] = 'Gender must be All, Male, or Female'
        
        if not eligibility.get('branches') or not isinstance(eligibility.get('branches'), list):
            errors['eligibility.branches'] = 'Eligible branches are required and must be a list'
        elif len(eligibility.get('branches', [])) == 0:
            errors['eligibility.branches'] = 'At least one eligible branch is required'
    
    # Validate hiring flow
    if not data.get('hiringFlow') or not isinstance(data.get('hiringFlow'), list):
        errors['hiringFlow'] = 'Hiring flow is required and must be a list'
    elif len(data.get('hiringFlow', [])) == 0:
        errors['hiringFlow'] = 'At least one hiring step is required'
    else:
        for i, step in enumerate(data.get('hiringFlow', [])):
            if not step.get('step'):
                errors[f'hiringFlow[{i}].step'] = 'Step name is required'
            if not step.get('description'):
                errors[f'hiringFlow[{i}].description'] = 'Step description is required'
    
    return errors if errors else None

def validate_student(data):
    """
    Validate student profile data.
    
    Args:
        data: Dictionary containing student profile data
        
    Returns:
        Dictionary of validation errors or None if valid
    """
    errors = {}
    
    if 'name' in data and not data.get('name'):
        errors['name'] = 'Name is required'
    
    if 'rollNumber' in data and not data.get('rollNumber'):
        errors['rollNumber'] = 'Roll number is required'
    
    if 'branch' in data and not data.get('branch'):
        errors['branch'] = 'Branch is required'
    
    if 'email' in data and not data.get('email'):
        errors['email'] = 'Email is required'
    elif 'email' in data and not re.match(r"[^@]+@[^@]+\.[^@]+", data.get('email', '')):
        errors['email'] = 'Invalid email format'
    
    if 'phone' in data and not data.get('phone'):
        errors['phone'] = 'Phone number is required'
    elif 'phone' in data and not re.match(r"^\+?[0-9]{10,15}$", data.get('phone', '')):
        errors['phone'] = 'Invalid phone number format'
    
    if 'githubProfile' in data and data.get('githubProfile') and not data['githubProfile'].startswith('https://github.com/'):
        errors['githubProfile'] = 'Invalid GitHub profile URL'
    
    if 'linkedinProfile' in data and data.get('linkedinProfile') and not data['linkedinProfile'].startswith('https://www.linkedin.com/'):
        errors['linkedinProfile'] = 'Invalid LinkedIn profile URL'
    
    return errors if errors else None

def validate_education(data):
    """
    Validate education data.
    
    Args:
        data: Dictionary containing education data
        
    Returns:
        Dictionary of validation errors or None if valid
    """
    errors = {}
    
    if not data.get('institution'):
        errors['institution'] = 'Institution name is required'
    
    if not data.get('degree'):
        errors['degree'] = 'Degree is required'
    
    if not data.get('year'):
        errors['year'] = 'Year is required'
    elif not re.match(r"^\d{4}(-\d{4})?$", data.get('year', '')):
        errors['year'] = 'Year must be in format YYYY or YYYY-YYYY'
    
    if 'gpa' in data and data.get('gpa') and not isinstance(data.get('gpa'), (int, float, str)):
        errors['gpa'] = 'GPA must be a number'
    elif 'gpa' in data and isinstance(data.get('gpa'), str) and not data.get('gpa').replace('.', '', 1).isdigit():
        errors['gpa'] = 'GPA must be a valid number'
    
    return errors if errors else None

def validate_application(data):
    """
    Validate job application data.
    
    Args:
        data: Dictionary containing application data
        
    Returns:
        Dictionary of validation errors or None if valid
    """
    errors = {}
    
    if 'resumeId' in data and not data.get('resumeId'):
        errors['resumeId'] = 'Resume is required'
    
    if 'coverLetter' in data and data.get('coverLetter') and len(data.get('coverLetter')) > 2000:
        errors['coverLetter'] = 'Cover letter cannot exceed 2000 characters'
    
    if 'answers' in data and not isinstance(data.get('answers'), list):
        errors['answers'] = 'Answers must be a list'
    
    return errors if errors else None


def validate_student_profile(data):
    """Validate student profile data"""
    errors = {}
    
    # Validate name if present
    if "name" in data and not data["name"]:
        errors["name"] = "Name is required"
    
    # Validate email if present
    if "email" in data:
        if not data["email"]:
            errors["email"] = "Email is required"
        # Add email format validation if needed
    
    # Validate phone if present
    if "phone" in data and not data["phone"]:
        errors["phone"] = "Phone number is required"
    
    # Add more validations as needed for other fields
    
    return errors