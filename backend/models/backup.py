from datetime import datetime

from ..extensions import db


class BackupJob(db.Model):
    __tablename__ = "backup_jobs"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    file_id = db.Column(db.Integer, db.ForeignKey("virtual_files.id"), nullable=True)
    status = db.Column(db.String(32), default="queued")  # queued, running, completed, failed
    schedule = db.Column(db.String(32), default="manual")  # manual, hourly, daily, custom
    detail = db.Column(db.String(255), nullable=True)
    started_at = db.Column(db.DateTime, nullable=True)
    finished_at = db.Column(db.DateTime, nullable=True)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "status": self.status,
            "schedule": self.schedule,
            "detail": self.detail,
            "started_at": self.started_at.isoformat() if self.started_at else None,
            "finished_at": self.finished_at.isoformat() if self.finished_at else None,
        }


class BackupEvent(db.Model):
    __tablename__ = "backup_events"

    id = db.Column(db.Integer, primary_key=True)
    job_id = db.Column(db.Integer, db.ForeignKey("backup_jobs.id"), nullable=False)
    level = db.Column(db.String(16), default="info")
    message = db.Column(db.String(512), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "level": self.level,
            "message": self.message,
            "created_at": self.created_at.isoformat(),
        }

