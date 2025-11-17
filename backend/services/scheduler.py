from __future__ import annotations

import threading
import time
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from typing import List

from flask import current_app

from ..extensions import db
from ..models import VirtualFile


@dataclass
class ScheduledBackup:
    user_id: int
    interval_seconds: int
    description: str
    next_run: datetime = field(default_factory=datetime.utcnow)


class BackupScheduler:
    def __init__(self, backup_manager):
        self.backup_manager = backup_manager
        self.jobs: List[ScheduledBackup] = []
        self.lock = threading.Lock()
        self.stop_event = threading.Event()
        self.thread: threading.Thread | None = None

    def start(self) -> None:
        if self.thread and self.thread.is_alive():
            return
        self.thread = threading.Thread(target=self._loop, daemon=True)
        self.thread.start()

    def shutdown(self) -> None:
        self.stop_event.set()
        if self.thread:
            self.thread.join(timeout=2)

    def schedule(self, user_id: int, interval_seconds: int, description: str) -> ScheduledBackup:
        job = ScheduledBackup(user_id=user_id, interval_seconds=interval_seconds, description=description)
        job.next_run = datetime.utcnow() + timedelta(seconds=interval_seconds)
        with self.lock:
            self.jobs.append(job)
        return job

    def _loop(self) -> None:
        while not self.stop_event.is_set():
            now = datetime.utcnow()
            with self.lock:
                for job in self.jobs:
                    if job.next_run <= now:
                        self._dispatch(job)
                        job.next_run = now + timedelta(seconds=job.interval_seconds)
            time.sleep(1)

    def _dispatch(self, job: ScheduledBackup) -> None:
        with current_app.app_context():
            files = (
                VirtualFile.query.filter_by(user_id=job.user_id)
                .filter(VirtualFile.status != "deleted")
                .all()
            )
            for vf in files:
                self.backup_manager.queue_backup(job.user_id, vf.id, schedule=job.description, detail="scheduled run")
            db.session.commit()

