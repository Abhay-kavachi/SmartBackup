from flask import Blueprint, current_app, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from ..extensions import db
from ..models import BackupEvent, BackupJob, VirtualFile

backup_bp = Blueprint("backups", __name__)


def _manager():
    return current_app.extensions["backup_manager"]


@backup_bp.get("/")
@backup_bp.get("")
@jwt_required()
def list_jobs():
    user_id = int(get_jwt_identity())
    jobs = (
        BackupJob.query.filter_by(user_id=user_id)
        .order_by(BackupJob.started_at.desc())
        .limit(20)
        .all()
    )
    return jsonify({"jobs": [job.to_dict() for job in jobs]})


@backup_bp.get("/events")
@backup_bp.get("events")
@jwt_required()
def list_events():
    user_id = int(get_jwt_identity())
    job_ids = {job.id for job in BackupJob.query.filter_by(user_id=user_id).all()}
    if not job_ids:
        return jsonify({"events": []})
    events = (
        BackupEvent.query.filter(BackupEvent.job_id.in_(job_ids))
        .order_by(BackupEvent.created_at.desc())
        .limit(50)
        .all()
    )
    return jsonify({"events": [event.to_dict() for event in events]})


@backup_bp.post("/run")
@jwt_required()
def run_backup():
    user_id = int(get_jwt_identity())
    payload = request.get_json() or {}
    file_id = payload.get("file_id")

    query = VirtualFile.query.filter_by(user_id=user_id)
    files = query.filter(VirtualFile.id == file_id).all() if file_id else query.filter(VirtualFile.status != "deleted").all()

    manager = _manager()
    for vf in files:
        manager.queue_backup(user_id=user_id, file_id=vf.id)

    return jsonify({"status": "queued", "count": len(files)})


@backup_bp.post("/schedule")
@jwt_required()
def schedule_backup():
    user_id = int(get_jwt_identity())
    payload = request.get_json() or {}
    kind = payload.get("type", "hourly")
    scheduler = current_app.extensions["scheduler"]
    if kind == "hourly":
        job = scheduler.schedule(user_id, 3600, "hourly")
    elif kind == "daily":
        job = scheduler.schedule(user_id, 86400, "daily")
    else:
        interval = int(payload.get("interval", 3600))
        job = scheduler.schedule(user_id, max(interval, 300), "custom")
    return jsonify({"next_run": job.next_run.isoformat(), "type": kind})

