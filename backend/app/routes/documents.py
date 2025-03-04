# app/routes/documents.py
from flask import Blueprint, request, jsonify, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.document_service import DocumentService
from app.utils.auth import admin_required, student_required
from app.utils.upload import allowed_file, save_file
import os

documents_bp = Blueprint('documents', __name__)

@documents_bp.route('', methods=['POST'])
@jwt_required()
def upload_document():
    current_user = get_jwt_identity()
    
    if 'file' not in request.files:
        return jsonify({"message": "No file part"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"message": "No selected file"}), 400
    
    if not allowed_file(file.filename):
        return jsonify({"message": "File type not allowed"}), 400
    
    document_type = request.form.get('type')
    document_name = request.form.get('name')
    
    if not document_type or not document_name:
        return jsonify({"message": "Document type and name are required"}), 400
    
    file_path = save_file(file)
    
    document_id = DocumentService.create_document(
        current_user['id'],
        document_name,
        document_type,
        file_path
    )
    
    document = DocumentService.get_document_by_id(document_id)
    return jsonify(document), 201

@documents_bp.route('/<document_id>', methods=['GET'])
@jwt_required()
def get_document(document_id):
    current_user = get_jwt_identity()
    
    document = DocumentService.get_document_by_id(document_id)
    if not document:
        return jsonify({"message": "Document not found"}), 404
    
    # Check if user is admin or document owner
    if current_user['role'] != 'admin' and current_user['id'] != document['studentId']:
        return jsonify({"message": "Unauthorized access"}), 403
    
    return jsonify(document), 200

@documents_bp.route('/<document_id>/download', methods=['GET'])
@jwt_required()
def download_document(document_id):
    current_user = get_jwt_identity()
    
    document = DocumentService.get_document_by_id(document_id)
    if not document:
        return jsonify({"message": "Document not found"}), 404
    
    # Check if user is admin or document owner
    if current_user['role'] != 'admin' and current_user['id'] != document['studentId']:
        return jsonify({"message": "Unauthorized access"}), 403
    
    return send_file(document['fileUrl'], as_attachment=True)

@documents_bp.route('/<document_id>/verify', methods=['PUT'])
@jwt_required()
@admin_required
def verify_document(document_id):
    verified = DocumentService.verify_document(document_id)
    if not verified:
        return jsonify({"message": "Document not found"}), 404
    
    return jsonify({"message": "Document verified successfully"}), 200

@documents_bp.route('/<document_id>', methods=['DELETE'])
@jwt_required()
def delete_document(document_id):
    current_user = get_jwt_identity()
    
    document = DocumentService.get_document_by_id(document_id)
    if not document:
        return jsonify({"message": "Document not found"}), 404
    
    # Check if user is admin or document owner
    if current_user['role'] != 'admin' and current_user['id'] != document['studentId']:
        return jsonify({"message": "Unauthorized access"}), 403
    
    deleted = DocumentService.delete_document(document_id)
    if not deleted:
        return jsonify({"message": "Document not found"}), 404
    
    return jsonify({"message": "Document deleted successfully"}), 200
