from __future__ import annotations

from datetime import datetime

from flask import current_app

from ..extensions import db
from ..models import BackupJob, VirtualFile
from .power import PowerGuard


class ChatbotService:
    def __init__(self, backup_manager, scheduler, vfs_service, power_guard: PowerGuard):
        self.backup_manager = backup_manager
        self.scheduler = scheduler
        self.vfs_service = vfs_service
        self.power_guard = power_guard

    def respond(self, user_id: int, message: str) -> dict:
        text = message.strip().lower()
        if not text:
            return {"reply": "Please type a command.", "meta": {}}

        if text in {"hello", "hi"}:
            return {"reply": "Hello! I'm Chitty. Ask me to show backups, stats, or schedule jobs.", "meta": {}}

        if text in {"help", "commands"}:
            return {
                "reply": "Try commands like: show backups, show stats, check power, delta backups, recover files, add file, show activity, schedule hourly backups.",
                "meta": {},
            }

        if "show backups" in text:
            jobs = (
                BackupJob.query.filter_by(user_id=user_id)
                .order_by(BackupJob.started_at.desc())
                .limit(5)
                .all()
            )
            return {"reply": "Latest backups prepared.", "meta": {"jobs": [job.to_dict() for job in jobs]}}

        if "show stats" in text or "show activity" in text:
            total_files = VirtualFile.query.filter_by(user_id=user_id).count()
            completed = BackupJob.query.filter_by(user_id=user_id, status="completed").count()
            pending = BackupJob.query.filter_by(user_id=user_id, status="running").count()
            return {
                "reply": "Here are your stats.",
                "meta": {"files": total_files, "completed": completed, "running": pending},
            }

        if "check power" in text:
            state = self.power_guard.get(user_id)
            if not state:
                return {"reply": "No battery data yet. Open the dashboard to sync.", "meta": {}}
            status = "charging" if state.charging else "on battery"
            return {"reply": f"Battery at {int(state.level * 100)}% and {status}.", "meta": {"state": state.__dict__}}

        if "delta backups" in text:
            return {
                "reply": "Delta backups only store changed blocks. All future jobs will skip unchanged files automatically.",
                "meta": {},
            }

        if "recover files" in text:
            files = (
                VirtualFile.query.filter_by(user_id=user_id, status="deleted")
                .order_by(VirtualFile.updated_at.desc())
                .all()
            )
            return {"reply": "Select a file below to recover.", "meta": {"deleted": [f.to_dict() for f in files]}}

        if "add file" in text:
            return {"reply": "Use the Add File button to register a path. I'll start watching it instantly.", "meta": {}}

        if "schedule hourly" in text:
            job = self.scheduler.schedule(user_id=user_id, interval_seconds=3600, description="hourly")
            return {"reply": "Hourly backups scheduled.", "meta": {"next_run": job.next_run.isoformat()}}

        if "schedule daily" in text:
            job = self.scheduler.schedule(user_id=user_id, interval_seconds=86400, description="daily")
            return {"reply": "Daily backups scheduled.", "meta": {"next_run": job.next_run.isoformat()}}

        if "schedule" in text and "custom" in text:
            try:
                minutes = int("".join(filter(str.isdigit, text)))
            except ValueError:
                minutes = 60
            interval = max(300, minutes * 60)
            job = self.scheduler.schedule(user_id=user_id, interval_seconds=interval, description="custom")
            return {"reply": f"Scheduled every {minutes} minutes.", "meta": {"next_run": job.next_run.isoformat()}}

        if "pending" in text:
            files = (
                VirtualFile.query.filter_by(user_id=user_id, status="pending")
                .order_by(VirtualFile.updated_at.desc())
                .all()
            )
            return {"reply": "Pending files listed.", "meta": {"pending": [f.to_dict() for f in files]}}

        return {
            "reply": "I didn't catch that. Try saying 'help' to see available commands.",
            "meta": {"timestamp": datetime.utcnow().isoformat()},
        }

