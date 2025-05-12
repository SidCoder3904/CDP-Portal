from app import mongo
from bson.objectid import ObjectId
from datetime import datetime

class PlacementService:
    @staticmethod
    def get_all_placement_cycles(filters=None):
        """
        Get all placement cycles with optional filtering.
        
        Args:
            filters: Dictionary of filter criteria
            
        Returns:
            List of placement cycle documents
        """
        query = filters or {}
        return list(mongo.db.placement_cycles.find(query).sort('startDate', -1))
    
    @staticmethod
    def get_placement_cycle_by_id(cycle_id):
        """
        Get a specific placement cycle by ID.
        
        Args:
            cycle_id: The ID of the placement cycle
            
        Returns:
            The placement cycle document or None if not found
        """
        try:
            return mongo.db.placement_cycles.find_one({'_id': ObjectId(cycle_id)})
        except Exception:
            return None
    
    @staticmethod
    def create_placement_cycle(data):
        """
        Create a new placement cycle.
        
        Args:
            data: Dictionary containing placement cycle data
            
        Returns:
            The ID of the newly created placement cycle
        """
        cycle = {
            'name': data.get('name'),
            'type': data.get('type'),
            'status': data.get('status'),
            'description': data.get('description'),
            'batch': data.get('batch'),
            'startDate': datetime.strptime(data.get('startDate'), '%Y-%m-%d'),
            'endDate': datetime.strptime(data.get('endDate'), '%Y-%m-%d'),
            'eligiblePrograms': data.get('eligiblePrograms'),
            'createdAt': datetime.utcnow(),
            'updatedAt': datetime.utcnow()
        }

        result = mongo.db.placement_cycles.insert_one(cycle)
        return str(result.inserted_id)


    
    @staticmethod
    def update_placement_cycle(cycle_id, data):
        """
        Update an existing placement cycle.
        
        Args:
            cycle_id: The ID of the placement cycle to update
            data: Dictionary containing updated placement cycle data
            
        Returns:
            True if update was successful, False otherwise
        """
        try:
            update_data = {
                'name': data['name'],
                'year': data['year'],
                'type': data['type'],
                'status': data['status'],
                'startDate': datetime.strptime(data['startDate'], '%Y-%m-%d'),
                'endDate': datetime.strptime(data['endDate'], '%Y-%m-%d'),
                'updatedAt': datetime.utcnow()
            }
            
            result = mongo.db.placement_cycles.update_one(
                {'_id': ObjectId(cycle_id)},
                {'$set': update_data}
            )
            
            return result.modified_count > 0
        except Exception:
            return False
    
    @staticmethod
    def delete_placement_cycle(cycle_id):
        """
        Delete a placement cycle and its associated jobs.
        
        Args:
            cycle_id: The ID of the placement cycle to delete
            
        Returns:
            True if deletion was successful, False otherwise
        """
        try:
            # Delete all applications for jobs in this cycle
            job_ids = [job['_id'] for job in mongo.db.jobs.find({'cycleId': cycle_id})]
            mongo.db.applications.delete_many({'jobId': {'$in': [str(id) for id in job_ids]}})
            
            # Delete all jobs in this cycle
            mongo.db.jobs.delete_many({'cycleId': cycle_id})
            
            # Delete the cycle itself
            result = mongo.db.placement_cycles.delete_one({'_id': ObjectId(cycle_id)})
            return result.deleted_count > 0
        except Exception:
            return False
    
    @staticmethod
    def get_jobs_by_filters(filters):
        """
        Get jobs based on filters.
        
        Args:
            filters: Dictionary of filter criteria
            
        Returns:
            List of job documents
        """
        return list(mongo.db.jobs.find(filters).sort('createdAt', -1))
    
    @staticmethod
    def get_job_by_id(job_id):
        """
        Get a specific job by ID.
        
        Args:
            job_id: The ID of the job
            
        Returns:
            The job document or None if not found
        """
        try:
            return mongo.db.jobs.find_one({'_id': ObjectId(job_id)})
        except Exception:
            return None
    
    @staticmethod
    def create_job(cycle_id, data):
        """
        Create a new job within a placement cycle.
        
        Args:
            cycle_id: The ID of the placement cycle
            data: Dictionary containing job data
            
        Returns:
            The ID of the newly created job
        """
        job = {
            'cycleId': cycle_id,
            'company': data['company'],
            'role': data['role'],
            'package': data['package'],
            'location': data['location'],
            'deadline': data['deadline'],
            'accommodation': data.get('accommodation', False),
            'eligibility': {
                'uniformCgpa': data['eligibility']['uniformCgpa'],
                'cgpa': data['eligibility']['cgpa'] if data['eligibility']['uniformCgpa'] else None,
                'cgpaCriteria': data['eligibility']['cgpaCriteria'] if not data['eligibility']['uniformCgpa'] else {},
                'gender': data['eligibility']['gender'],
                'branches': data['eligibility']['branches'],
            },
            'hiringFlow': data['hiringFlow'],
            'jobDescription': data['jobDescription'],
            'status': 'open',
            'createdAt': datetime.utcnow(),
            'updatedAt': datetime.utcnow(),
            # Add fields for storing file URLs and Cloudinary public IDs
            'logo': data.get('logo', ''),
            'jobDescriptionFile': data.get('jobDescriptionFile', ''),
            'companyImagePublicId': data.get('companyImagePublicId', ''),
            'jobDescriptionFilePublicId': data.get('jobDescriptionFilePublicId', '')
        }
        result = mongo.db.jobs.insert_one(job)
        return str(result.inserted_id)

    
    @staticmethod
    def get_cycle_statistics(cycle_id):
        """
        Get statistics for a placement cycle.
        
        Args:
            cycle_id: The ID of the placement cycle
            
        Returns:
            Dictionary containing statistics for the placement cycle
        """
        try:
            # Get the cycle
            cycle = PlacementService.get_placement_cycle_by_id(cycle_id)
            if not cycle:
                return None
            
            # Get all jobs in this cycle
            jobs = list(mongo.db.jobs.find({'cycleId': cycle_id}))
            job_ids = [str(job['_id']) for job in jobs]
            
            # Count applications and selected students
            applications = list(mongo.db.applications.find({'jobId': {'$in': job_ids}}))
            selected_applications = [app for app in applications if app['status'] == 'selected']
            
            # Get unique companies and students
            companies = set(job['company'] for job in jobs)
            student_ids = set(app['studentId'] for app in applications)
            selected_student_ids = set(app['studentId'] for app in selected_applications)
            
            # Get gender-wise statistics if available
            male_selected = 0
            female_selected = 0
            for student_id in selected_student_ids:
                student = mongo.db.students.find_one({'_id': ObjectId(student_id)})
                if student:
                    if student.get('gender') == 'male':
                        male_selected += 1
                    elif student.get('gender') == 'female':
                        female_selected += 1
            
            # Get branch-wise statistics
            branch_stats = {}
            for student_id in selected_student_ids:
                student = mongo.db.students.find_one({'_id': ObjectId(student_id)})
                if student and 'branch' in student:
                    branch = student['branch']
                    branch_stats[branch] = branch_stats.get(branch, 0) + 1
            
            # Calculate average and highest package/stipend
            highest_package = 0
            total_package = 0
            package_count = 0
            
            for job in jobs:
                if cycle['type'] == 'placement' and job.get('salary'):
                    try:
                        salary = float(job['salary'].replace('LPA', '').strip())
                        highest_package = max(highest_package, salary)
                        total_package += salary
                        package_count += 1
                    except (ValueError, AttributeError):
                        pass
            
            avg_package = total_package / package_count if package_count > 0 else 0
            
            return {
                'totalJobs': len(jobs),
                'totalCompanies': len(companies),
                'totalApplications': len(applications),
                'totalStudentsApplied': len(student_ids),
                'totalSelected': len(selected_student_ids),
                'maleSelected': male_selected,
                'femaleSelected': female_selected,
                'branchStatistics': branch_stats,
                'highestPackage': highest_package,
                'averagePackage': avg_package,
                'placementPercentage': (len(selected_student_ids) / len(student_ids) * 100) if len(student_ids) > 0 else 0
            }
        except Exception as e:
            print(f"Error in get_cycle_statistics: {str(e)}")
            return None
    
    @staticmethod
    def get_eligible_students(cycle_id):
        """
        Get all students eligible for a placement cycle.
        
        Args:
            cycle_id: The ID of the placement cycle
            
        Returns:
            List of eligible student documents
        """
        try:
            cycle = PlacementService.get_placement_cycle_by_id(cycle_id)
            if not cycle:
                return []
            
            # Find students in eligible branches
            eligible_branch_query = {'branch': {'$in': cycle['eligibleBranches']}}
            
            # For placement cycles, check if already placed
            if cycle['type'] == 'placement':
                # Get IDs of students already placed
                placed_student_ids = set()
                # Find all placement cycles of this year
                year_cycles = mongo.db.placement_cycles.find({'year': cycle['year'], 'type': 'placement'})
                for year_cycle in year_cycles:
                    # Get all jobs in these cycles
                    jobs = mongo.db.jobs.find({'cycleId': str(year_cycle['_id'])})
                    job_ids = [str(job['_id']) for job in jobs]
                    # Get all selected applications
                    selected_apps = mongo.db.applications.find({
                        'jobId': {'$in': job_ids},
                        'status': 'selected'
                    })
                    # Add selected student IDs to set
                    for app in selected_apps:
                        placed_student_ids.add(app['studentId'])
                
                # Exclude already placed students
                if placed_student_ids:
                    eligible_branch_query['_id'] = {'$nin': [ObjectId(id) for id in placed_student_ids]}
            
            return list(mongo.db.students.find(eligible_branch_query))
        except Exception as e:
            print(f"Error in get_eligible_students: {str(e)}")
            return []

    @staticmethod
    def update_job(job_id, data):
        """
        Update a job.
        
        Args:
            job_id: The ID of the job to update
            data: Dictionary containing job data to update
            
        Returns:
            True if update successful, False otherwise
        """
        try:
            # Prevent updating certain fields
            if 'cycleId' in data:
                del data['cycleId']
            if 'createdAt' in data:
                del data['createdAt']
            
            # Update object with cleaned data
            update_data = {}
            
            # Basic fields
            if 'company' in data:
                update_data['company'] = data['company']
            if 'role' in data:
                update_data['role'] = data['role']
            if 'package' in data:
                update_data['package'] = data['package']
            if 'location' in data:
                update_data['location'] = data['location']
            if 'deadline' in data:
                update_data['deadline'] = data['deadline']
            if 'accommodation' in data:
                update_data['accommodation'] = data['accommodation']
            if 'jobDescription' in data:
                update_data['jobDescription'] = data['jobDescription']
            if 'status' in data:
                update_data['status'] = data['status']
            if 'hiringFlow' in data:
                update_data['hiringFlow'] = data['hiringFlow']
            
            # Eligibility criteria
            if 'eligibility' in data:
                update_data['eligibility'] = {
                    'uniformCgpa': data['eligibility'].get('uniformCgpa', True),
                    'cgpa': data['eligibility'].get('cgpa'),
                    'gender': data['eligibility'].get('gender', 'All'),
                    'branches': data['eligibility'].get('branches', []),
                }
                
                if not data['eligibility'].get('uniformCgpa', True) and 'cgpaCriteria' in data['eligibility']:
                    update_data['eligibility']['cgpaCriteria'] = data['eligibility']['cgpaCriteria']
            
            # File uploads
            if 'logo' in data:
                update_data['logo'] = data['logo']
            if 'companyImagePublicId' in data:
                update_data['companyImagePublicId'] = data['companyImagePublicId']
            if 'jobDescriptionFile' in data:
                update_data['jobDescriptionFile'] = data['jobDescriptionFile']
            if 'jobDescriptionFilePublicId' in data:
                update_data['jobDescriptionFilePublicId'] = data['jobDescriptionFilePublicId']
            
            # Add timestamp
            update_data['updatedAt'] = datetime.utcnow()
            
            result = mongo.db.jobs.update_one(
                {'_id': ObjectId(job_id)},
                {'$set': update_data}
            )
            
            return result.matched_count > 0
        except Exception as e:
            print(f"Error updating job: {str(e)}")
            return False
