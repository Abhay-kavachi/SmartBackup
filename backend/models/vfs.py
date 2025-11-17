from datetime import datetime

from ..extensions import db


class VirtualFile(db.Model):
    __tablename__ = "virtual_files"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    path = db.Column(db.String(1024), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    size = db.Column(db.BigInteger, default=0)
    status = db.Column(db.String(32), default="active")  # active, pending, deleted
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    versions = db.relationship(
        "FileVersion", back_populates="file", cascade="all, delete-orphan", lazy="dynamic"
    )
    owner = db.relationship("User", back_populates="files")

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "path": self.path,
            "name": self.name,
            "size": self.size,
            "status": self.status,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "versions": [version.to_dict() for version in self.versions.order_by(FileVersion.created_at.desc())],
        }


class FileVersion(db.Model):
    __tablename__ = "file_versions"

    id = db.Column(db.Integer, primary_key=True)
    file_id = db.Column(db.Integer, db.ForeignKey("virtual_files.id"), nullable=False)
    delta_hash = db.Column(db.String(128), nullable=False)
    storage_path = db.Column(db.String(512), nullable=False)
    compressed_size = db.Column(db.BigInteger, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    file = db.relationship("VirtualFile", back_populates="versions")

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "delta_hash": self.delta_hash,
            "storage_path": self.storage_path,
            "compressed_size": self.compressed_size,
            "created_at": self.created_at.isoformat(),
        }

