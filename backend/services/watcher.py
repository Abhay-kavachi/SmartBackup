from __future__ import annotations

import threading
from pathlib import Path
from typing import Dict

from watchdog.events import FileSystemEventHandler
from watchdog.observers import Observer


class _WatchHandler(FileSystemEventHandler):
    def __init__(self, service: "WatcherService"):
        self.service = service

    def on_modified(self, event):
        if event.is_directory:
            return
        self.service.handle_event(Path(event.src_path))

    def on_created(self, event):
        if event.is_directory:
            return
        self.service.handle_event(Path(event.src_path))


class WatcherService:
    def __init__(self, vfs_service, excluded_dirs: set[str]):
        self.vfs_service = vfs_service
        self.excluded_dirs = excluded_dirs
        self.observer = Observer(timeout=1)
        self.handler = _WatchHandler(self)
        self.lock = threading.Lock()
        self.tracked_paths: Dict[Path, int] = {}
        self.directories: set[str] = set()
        self.started = False

    def start(self) -> None:
        if self.started:
            return
        self.observer.start()
        self.started = True

    def stop(self) -> None:
        if not self.started:
            return
        self.observer.stop()
        self.observer.join(timeout=2)
        self.started = False

    def track_file(self, file_model) -> None:
        path = Path(file_model.path).resolve()
        if any(part in self.excluded_dirs for part in path.parts):
            return

        directory = str(path.parent)
        with self.lock:
            if path not in self.tracked_paths:
                self.tracked_paths[path] = file_model.id
            if directory not in self.directories:
                self.observer.schedule(self.handler, directory, recursive=False)
                self.directories.add(directory)

    def handle_event(self, path: Path) -> None:
        resolved = path.resolve()
        with self.lock:
            file_id = self.tracked_paths.get(resolved)
        if file_id:
            self.vfs_service.mark_pending(file_id)

