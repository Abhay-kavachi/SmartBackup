from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
import os
import uuid
from datetime import datetime

from ..models import VirtualFile
from ..extensions import db
from ..services.vfs_service import VFSService
from ..services.watcher import WatcherService

file_bp = Blueprint("files", __name__)


def _services():
    # Import here to avoid circular imports
    from .. import app
    return (
        app.extensions["vfs_service"],
        app.extensions["watcher_service"],
    )


@file_bp.get("/")
@file_bp.get("")
@jwt_required()
def list_files():
    user_id = int(get_jwt_identity())
    vfs_service, _ = _services()
    return jsonify({"files": vfs_service.list_files(user_id)})


@file_bp.post("/watch")
@jwt_required()
def watch_file():
    user_id = int(get_jwt_identity())
    payload = request.get_json() or {}
    path = payload.get("path")
    if not path:
        return jsonify({"error": "Path required"}), 400

    vfs_service, watcher = _services()
    try:
        record = vfs_service.register_file(user_id, path)
        watcher.track_file(record)
    except FileNotFoundError:
        return jsonify({"error": "File not found"}), 404
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400

    return jsonify({"file": record.to_dict()}), 201


@file_bp.delete("/<int:file_id>")
@jwt_required()
def delete_file(file_id: int):
    user_id = int(get_jwt_identity())
    record = VirtualFile.query.filter_by(id=file_id, user_id=user_id).first()
    if not record:
        return jsonify({"error": "Not found"}), 404

    record.status = "deleted"
    db.session.commit()
    return jsonify({"status": "deleted"})


@file_bp.post("/recover/<int:file_id>")
@jwt_required()
def recover_file(file_id: int):
    user_id = int(get_jwt_identity())
    record = VirtualFile.query.filter_by(id=file_id, user_id=user_id, status="deleted").first()
    if not record:
        return jsonify({"error": "Not found"}), 404

    record.status = "active"
    db.session.commit()

    watcher = current_app.extensions["watcher_service"]
    watcher.track_file(record)

    return jsonify({"status": "recovered"})


@file_bp.post("/upload")
@jwt_required()
def upload_files():
    """Handle file uploads"""
    user_id = int(get_jwt_identity())
    vfs_service, watcher = _services()
    
    if 'files' not in request.files:
        return jsonify({"error": "No files provided"}), 400
    
    files = request.files.getlist('files')
    uploaded_files = []
    
    # Create upload directory if it doesn't exist
    upload_dir = os.path.join(os.getcwd(), 'uploads', str(user_id))
    os.makedirs(upload_dir, exist_ok=True)
    
    for file in files:
        if file.filename == '':
            continue
            
        # Secure the filename
        filename = secure_filename(file.filename)
        if filename == '':
            continue
            
        # Generate unique filename to avoid conflicts
        unique_filename = f"{uuid.uuid4()}_{filename}"
        file_path = os.path.join(upload_dir, unique_filename)
        
        # Save the file
        file.save(file_path)
        
        try:
            # Register the file in VFS
            record = vfs_service.register_file(user_id, file_path)
            watcher.track_file(record)
            uploaded_files.append(record.to_dict())
        except Exception as e:
            # Clean up file if registration failed
            if os.path.exists(file_path):
                os.remove(file_path)
            print(f"Failed to register uploaded file {filename}: {e}")
            continue
    
    return jsonify({"files": uploaded_files}), 201


@file_bp.post("/upload/folder")
@jwt_required()
def upload_folder():
    """Handle folder uploads"""
    user_id = int(get_jwt_identity())
    vfs_service, watcher = _services()
    
    if 'files' not in request.files:
        return jsonify({"error": "No files provided"}), 400
    
    files = request.files.getlist('files')
    folder_name = request.form.get('folder_name', 'uploaded_folder')
    uploaded_files = []
    
    # Create upload directory if it doesn't exist
    upload_dir = os.path.join(os.getcwd(), 'uploads', str(user_id), folder_name)
    os.makedirs(upload_dir, exist_ok=True)
    
    for file in files:
        if file.filename == '':
            continue
            
        # Get the relative path from webkitRelativePath
        relative_path = file.filename
        
        # Create subdirectories if needed
        file_dir = os.path.dirname(relative_path)
        if file_dir:
            target_dir = os.path.join(upload_dir, file_dir)
            os.makedirs(target_dir, exist_ok=True)
        
        # Secure the filename
        filename = os.path.basename(relative_path)
        secure_name = secure_filename(filename)
        if secure_name == '':
            continue
            
        # Save the file with its directory structure
        file_path = os.path.join(upload_dir, relative_path)
        file.save(file_path)
        
        try:
            # Register the file in VFS
            record = vfs_service.register_file(user_id, file_path)
            watcher.track_file(record)
            uploaded_files.append(record.to_dict())
        except Exception as e:
            # Clean up file if registration failed
            if os.path.exists(file_path):
                os.remove(file_path)
            print(f"Failed to register uploaded file {relative_path}: {e}")
            continue
    
    return jsonify({"files": uploaded_files}), 201

