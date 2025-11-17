from flask import Blueprint, current_app, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from ..extensions import db
from ..models import VirtualFile

file_bp = Blueprint("files", __name__)


def _services():
    app = current_app
    return (
        app.extensions["vfs_service"],
        app.extensions["watcher_service"],
    )


@file_bp.get("/")
@jwt_required()
def list_files():
    user_id = get_jwt_identity()
    vfs_service, _ = _services()
    return jsonify({"files": vfs_service.list_files(user_id)})


@file_bp.post("/watch")
@jwt_required()
def watch_file():
    user_id = get_jwt_identity()
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
    user_id = get_jwt_identity()
    record = VirtualFile.query.filter_by(id=file_id, user_id=user_id).first()
    if not record:
        return jsonify({"error": "Not found"}), 404

    record.status = "deleted"
    db.session.commit()
    return jsonify({"status": "deleted"})


@file_bp.post("/recover/<int:file_id>")
@jwt_required()
def recover_file(file_id: int):
    user_id = get_jwt_identity()
    record = VirtualFile.query.filter_by(id=file_id, user_id=user_id, status="deleted").first()
    if not record:
        return jsonify({"error": "Not found"}), 404

    record.status = "active"
    db.session.commit()

    watcher = current_app.extensions["watcher_service"]
    watcher.track_file(record)

    return jsonify({"status": "recovered"})

