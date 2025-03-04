import requests

class StudentService:
    @staticmethod
    def get_student_details(email):
        # Replace with your actual API endpoint
        api_url = f"https://your-college-api.com/students/{email}"
        
        try:
            response = requests.get(api_url)
            response.raise_for_status()  # Raises an HTTPError for bad responses
            return response.json()
        except requests.RequestException as e:
            print(f"Error fetching student details: {e}")
            return None
