from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
from ..services.notification_service import NotificationService
from ..utils.auth import admin_required, student_required

notification_bp = Blueprint('notifications', __name__)
notification_service = NotificationService()

@notification_bp.route('/api/notifications', methods=['GET'])
@student_required
def get_notifications():
    placement_cycle_id = request.args.get('placement_cycle_id')
    if not placement_cycle_id:
        return jsonify({'error': 'placement_cycle_id is required'}), 400
    
    notifications = notification_service.get_notifications(placement_cycle_id)
    return jsonify({'notifications': notifications})

@notification_bp.route('/api/notifications/<placement_cycle_id>', methods=['GET'])
@cross_origin()
def get_notifications_by_placement_cycle(placement_cycle_id):
    try:
        notifications = notification_service.get_notifications(placement_cycle_id)
        return jsonify(notifications)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@notification_bp.route('/api/notifications', methods=['POST'])
@admin_required
def create_notification():
    data = request.json
    required_fields = ['title', 'message', 'type', 'placement_cycle_id']
    
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400
    
    notification = notification_service.create_notification(data)
    return jsonify(notification), 201

@notification_bp.route('/api/admin/notifications', methods=['POST'])
@cross_origin()
@admin_required
def create_notification_admin():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    required_fields = ['title', 'message', 'type', 'placement_cycle_id']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'{field} is required'}), 400
    
    try:
        notification = notification_service.create_notification(data)
        return jsonify(notification), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@notification_bp.route('/api/admin/notifications/<notification_id>', methods=['PUT'])
@cross_origin()
@admin_required
def update_notification(notification_id):
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    required_fields = ['title', 'message', 'type']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'{field} is required'}), 400
    
    try:
        notification = notification_service.update_notification(notification_id, data)
        return jsonify(notification)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@notification_bp.route('/api/admin/notifications/<notification_id>', methods=['DELETE'])
@cross_origin()
@admin_required
def delete_notification(notification_id):
    try:
        notification_service.delete_notification(notification_id)
        return '', 204
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@notification_bp.route('/api/admin/notifications', methods=['GET'])
@admin_required
def get_notifications_admin():
    placement_cycle_id = request.args.get('placement_cycle_id')
    if not placement_cycle_id:
        return jsonify({'error': 'placement_cycle_id is required'}), 400

    notifications = notification_service.get_notifications(placement_cycle_id)
    return jsonify({'notifications': notifications}) 