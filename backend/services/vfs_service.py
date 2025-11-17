from __future__ import annotations

from pathlib import Path
from typing import Iterable

from flask import current_app

from ..extensions import db
from ..models import FileVersion, VirtualFile
from ..utils.hashing import file_hash


class VFSService:
    def __init__(self, excluded_dirs: Iterable[str]):
        self.excluded_dirs = set(excluded_dirs)

    def _validate_path(self, path: Path) -> Path:
        resolved = path.expanduser().resolve()
        if any(part in self.excluded_dirs for part in resolved.parts):
            raise ValueError("Path is inside an excluded directory")
        return resolved

    def register_file(self, user_id: int, raw_path: str) -> VirtualFile:
        path = self._validate_path(Path(raw_path))
        stat = path.stat()

        existing = VirtualFile.query.filter_by(user_id=user_id, path=str(path)).first()
        if existing:
            existing.size = stat.st_size
            existing.status = "active"
            db.session.commit()
            return existing

        vf = VirtualFile(user_id=user_id, path=str(path), name=path.name, size=stat.st_size)
        db.session.add(vf)
        db.session.commit()
        current_app.logger.info("Registered file %s for user %s", path, user_id)
        return vf

    def mark_pending(self, file_id: int) -> None:
        vf = VirtualFile.query.get(file_id)
        if vf:
            vf.status = "pending"
            db.session.commit()

    def mark_deleted(self, file_id: int) -> None:
        vf = VirtualFile.query.get(file_id)
        if vf:
            vf.status = "deleted"
            db.session.commit()

    def recover(self, file_id: int) -> None:
        vf = VirtualFile.query.get(file_id)
        if vf and vf.status == "deleted":
            vf.status = "active"
            db.session.commit()

    def list_files(self, user_id: int) -> list[dict]:
        files = (
            VirtualFile.query.filter_by(user_id=user_id)
            .order_by(VirtualFile.updated_at.desc())
            .all()
        )
        return [file.to_dict() for file in files]

    def add_version(self, file_id: int, data_path: Path, storage_path: Path) -> FileVersion:
        vf = VirtualFile.query.get(file_id)
        if not vf:
            raise ValueError("File not found")

        hash_value = file_hash(data_path)
        last_version = (
            vf.versions.order_by(FileVersion.created_at.desc()).first()
            if vf.versions
            else None
        )
        if last_version and last_version.delta_hash == hash_value:
            current_app.logger.info("No changes detected for %s", vf.path)
            return last_version

        version = FileVersion(
            file_id=file_id,
            delta_hash=hash_value,
            storage_path=str(storage_path),
            compressed_size=storage_path.stat().st_size if storage_path.exists() else 0,
        )
        vf.status = "active"
        vf.size = data_path.stat().st_size
        db.session.add(version)
        db.session.commit()
        return version

