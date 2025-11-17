from __future__ import annotations

import io
import zipfile
from pathlib import Path


def compress_file(path: Path) -> bytes:
    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, mode="w", compression=zipfile.ZIP_DEFLATED) as zf:
        zf.write(path, arcname=path.name)
    buffer.seek(0)
    return buffer.read()

