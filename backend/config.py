import os
from datetime import timedelta
from pathlib import Path


class Config:
    """Central configuration for SmartBackup OS backend."""

    BASE_DIR = Path(__file__).resolve().parent
    SECRET_KEY = os.getenv("SMARTBACKUP_SECRET", "change-me")
    SQLALCHEMY_DATABASE_URI = os.getenv(
        "SMARTBACKUP_DB_URI",
        "mysql+pymysql://root:password@localhost:3306/smartbackup",
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.getenv("SMARTBACKUP_JWT_SECRET", "jwt-change-me")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=8)

    BACKUP_STORAGE_PATH = Path(
        os.getenv("SMARTBACKUP_STORAGE", BASE_DIR.parent / "storage")
    )
    BACKUP_STORAGE_PATH.mkdir(parents=True, exist_ok=True)

    WATCH_EXCLUDE_DIRS = {
        ".git",
        "__pycache__",
        "node_modules",
        "venv",
        "env",
        "System32",
        "Windows",
    }

    MAX_BACKUP_WORKERS = int(os.getenv("SMARTBACKUP_WORKERS", "3"))
    BACKUP_CHUNK_SIZE = 1024 * 1024  # 1 MB
    AES_KEY = os.getenv("SMARTBACKUP_AES_KEY", "Z" * 32).encode()
    HASH_ALGORITHM = "sha256"


config = Config()

