from __future__ import annotations

import hashlib
from pathlib import Path

CHUNK_SIZE = 1024 * 512


def file_hash(path: Path, algorithm: str = "sha256") -> str:
    hasher = hashlib.new(algorithm)
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(CHUNK_SIZE), b""):
            hasher.update(chunk)
    return hasher.hexdigest()

