from __future__ import annotations

import queue
import threading
import time
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Optional

from flask import current_app

from ..config import config
from ..extensions import db
from ..models import BackupEvent, BackupJob, VirtualFile
from ..utils.compression import compress_file
from ..utils.crypto import encrypt_bytes


@dataclass
class BackupTask:
    user_id: int
    file_id: int
    schedule: str = "manual"
    detail: str | None = None


class BackupManager:
    def __init__(self, vfs_service, power_guard=None):
        self.vfs_service = vfs_service
        self.power_guard = power_guard
        self.storage_root = Path(config.BACKUP_STORAGE_PATH)
        self.queue: queue.Queue[BackupTask] = queue.Queue()
        self.stop_event = threading.Event()
        self.workers: list[threading.Thread] = []
        self.app = None

    def attach_app(self, app) -> None:
        self.app = app

    def start(self) -> None:
        if self.workers:
            return
        for _ in range(config.MAX_BACKUP_WORKERS):
            worker = threading.Thread(target=self._worker_loop, daemon=True)
            worker.start()
            self.workers.append(worker)

    def shutdown(self) -> None:
        self.stop_event.set()
        for worker in self.workers:
            worker.join(timeout=2)

    def queue_backup(self, user_id: int, file_id: int, schedule: str = "manual", detail: str | None = None) -> None:
        self.queue.put(BackupTask(user_id=user_id, file_id=file_id, schedule=schedule, detail=detail))

    def _worker_loop(self) -> None:
        while not self.stop_event.is_set():
            try:
                task = self.queue.get(timeout=1)
            except queue.Empty:
                continue

            if not self.app:
                time.sleep(0.5)
                self.queue.task_done()
                continue

            with self.app.app_context():
                self._process_task(task)
            self.queue.task_done()

    def _process_task(self, task: BackupTask) -> None:
        if self.power_guard and not self.power_guard.can_backup(task.user_id):
            current_app.logger.info("Backup paused for user %s due to low battery", task.user_id)
            time.sleep(30)
            self.queue.put(task)
            return

        vf: Optional[VirtualFile] = VirtualFile.query.filter_by(id=task.file_id, user_id=task.user_id).first()
        if not vf:
            current_app.logger.warning("Virtual file %s not found for user %s", task.file_id, task.user_id)
            return

        job = BackupJob(
            user_id=task.user_id,
            file_id=vf.id,
            status="running",
            schedule=task.schedule,
            detail=task.detail,
            started_at=datetime.utcnow(),
        )
        db.session.add(job)
        db.session.commit()

        try:
            source = Path(vf.path)
            compressed = compress_file(source)
            encrypted = encrypt_bytes(compressed, config.AES_KEY)
            dest_dir = self.storage_root / f"user_{task.user_id}" / f"file_{vf.id}"
            dest_dir.mkdir(parents=True, exist_ok=True)

            dest_path = dest_dir / f"{int(time.time())}.bin"
            with dest_path.open("wb") as handle:
                handle.write(encrypted)

            self.vfs_service.add_version(vf.id, source, dest_path)

            job.status = "completed"
            message = f"Backup completed for {vf.path}"
            current_app.logger.info(message)
            db.session.add(BackupEvent(job_id=job.id, level="info", message=message))
        except Exception as exc:  # pylint: disable=broad-except
            db.session.add(
                BackupEvent(
                    job_id=job.id,
                    level="error",
                    message=str(exc),
                )
            )
            job.status = "failed"
            job.detail = str(exc)
            current_app.logger.exception("Backup failed for %s", vf.path)
        finally:
            job.finished_at = datetime.utcnow()
            db.session.commit()

