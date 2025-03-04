from app.services.database import mongo, to_object_id, serialize_id
from bson.objectid import ObjectId
from datetime import datetime
import os
import uuid
from werkzeug.utils import secure_filename
from flask import current_app

class DocumentService:
    @staticmethod
    def create_document(student_id, name, document_type, file_path):
        """
        Create a new document record.
        
        Args:
            student_id: The ID of the student
            name: The name of the document
            document_type: The type of document
            file_path: The path to the saved file
            
        Returns:
            The ID of the newly created document
        """
        document = {
            'studentId': student_id,
            'name': name,
            'type': document_type,
            'fileUrl': file_path,
            'verified': False,
            'createdAt': datetime.utcnow(),
            'updatedAt': datetime.utcnow()
        }
        
        result = mongo.db.documents.insert_one(document)
        return str(result.inserted_id)
    
    @staticmethod
    def get_document_by_id(document_id):
        """
        Get a document by ID.
        
        Args:
            document_id: The ID of the document
            
        Returns:
            The document object or None if not found
        """
        try:
            doc = mongo.db.documents.find_one({'_id': to_object_id(document_id)})
            return serialize_id(doc) if doc else None
        except Exception as e:
            print(f"Error retrieving document: {str(e)}")
            return None
    
    @staticmethod
    def get_documents_by_student(student_id, document_type=None):
        """
        Get all documents for a student, optionally filtered by type.
        
        Args:
            student_id: The ID of the student
            document_type: Optional type filter
            
        Returns:
            List of document objects
        """
        query = {'studentId': student_id}
        if document_type:
            query['type'] = document_type
        
        documents = list(mongo.db.documents.find(query).sort('createdAt', -1))
        return [serialize_id(doc) for doc in documents]
    
    @staticmethod
    def verify_document(document_id):
        """
        Mark a document as verified.
        
        Args:
            document_id: The ID of the document
            
        Returns:
            True if successful, False otherwise
        """
        try:
            result = mongo.db.documents.update_one(
                {'_id': to_object_id(document_id)},
                {'$set': {'verified': True, 'updatedAt': datetime.utcnow()}}
            )
            return result.modified_count > 0
        except Exception as e:
            print(f"Error verifying document: {str(e)}")
            return False
    
    @staticmethod
    def delete_document(document_id):
        """
        Delete a document and its file.
        
        Args:
            document_id: The ID of the document
            
        Returns:
            True if successful, False otherwise
        """
        try:
            # Get the document to find the file path
            document = mongo.db.documents.find_one({'_id': to_object_id(document_id)})
            if document and document.get('fileUrl'):
                # Delete the file if it exists
                file_path = document['fileUrl']
                if os.path.exists(file_path):
                    os.remove(file_path)
            
            # Delete the document record
            result = mongo.db.documents.delete_one({'_id': to_object_id(document_id)})
            return result.deleted_count > 0
        except Exception as e:
            print(f"Error deleting document: {str(e)}")
            return False
    
    @staticmethod
    def get_documents_by_type(document_type, verified=None):
        """
        Get all documents of a specific type.
        
        Args:
            document_type: The type of documents to retrieve
            verified: Filter by verification status if provided
            
        Returns:
            List of document objects
        """
        query = {'type': document_type}
        if verified is not None:
            query['verified'] = verified
        
        documents = list(mongo.db.documents.find(query).sort('createdAt', -1))
        return [serialize_id(doc) for doc in documents]
    
    @staticmethod
    def get_unverified_documents():
        """
        Get all unverified documents.
        
        Returns:
            List of unverified document objects
        """
        documents = list(mongo.db.documents.find({'verified': False}).sort('createdAt', -1))
        return [serialize_id(doc) for doc in documents]
    
    @staticmethod
    def save_document_file(file, document_type):
        """
        Save a document file to the filesystem.
        
        Args:
            file: The file object from the request
            document_type: The type of document
            
        Returns:
            The path to the saved file
        """
        filename = secure_filename(file.filename)
        
        # Generate a unique filename to prevent collisions
        unique_filename = f"{uuid.uuid4()}_{filename}"
        
        # Create document type directory if it doesn't exist
        document_dir = os.path.join(current_app.config['UPLOAD_FOLDER'], document_type)
        os.makedirs(document_dir, exist_ok=True)
        
        # Save the file
        file_path = os.path.join(document_dir, unique_filename)
        file.save(file_path)
        
        return file_path
    
    @staticmethod
    def get_document_metadata(document_id):
        """
        Get metadata for a document without the file content.
        
        Args:
            document_id: The ID of the document
            
        Returns:
            Document metadata or None if not found
        """
        try:
            # Get document excluding file content
            doc = mongo.db.documents.find_one(
                {'_id': to_object_id(document_id)},
                {'fileContent': 0}
            )
            return serialize_id(doc) if doc else None
        except Exception:
            return None
    
    @staticmethod
    def update_document_metadata(document_id, metadata):
        """
        Update document metadata.
        
        Args:
            document_id: The ID of the document
            metadata: Dictionary containing metadata to update
            
        Returns:
            True if successful, False otherwise
        """
        try:
            # Remove fields that shouldn't be directly updated
            safe_metadata = metadata.copy()
            for field in ['_id', 'id', 'fileUrl', 'createdAt']:
                if field in safe_metadata:
                    del safe_metadata[field]
            
            safe_metadata['updatedAt'] = datetime.utcnow()
            
            result = mongo.db.documents.update_one(
                {'_id': to_object_id(document_id)},
                {'$set': safe_metadata}
            )
            return result.modified_count > 0
        except Exception as e:
            print(f"Error updating document metadata: {str(e)}")
            return False
