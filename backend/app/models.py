from bson.objectid import ObjectId


# Student collection
def create_student(email):
    return {
        "email": email,
        "additional_info": {
            "previous_education": [],
            "experience": [],
            "responsibilities": [],
            "projects": [],
            "resume_link": "",
            "certificates": [],
            "achievements": []
        }
    }


# Job collection
def create_job(title, description, jd_link, hiring_flow, eligibility):
    return {
        "title": title,
        "description": description,
        "jd_link": jd_link,
        "hiring_flow": hiring_flow,  # Array of steps in the hiring process
        "eligibility": eligibility  # JSON object defining eligibility criteria
    }
