from __future__ import annotations

from flask import Flask
from flask_cors import CORS

from .config import config
from .extensions import db, jwt
from .models import VirtualFile
from .routes import register_blueprints
from .services.backup_manager import BackupManager
from .services.chatbot import ChatbotService
from .services.power import PowerGuard
from .services.scheduler import BackupScheduler
from .services.vfs_service import VFSService
from .services.watcher import WatcherService

power_guard = PowerGuard()
vfs_service = VFSService(config.WATCH_EXCLUDE_DIRS)
backup_manager = BackupManager(vfs_service=vfs_service, power_guard=power_guard)
scheduler = BackupScheduler(backup_manager=backup_manager)
watcher = WatcherService(vfs_service=vfs_service, excluded_dirs=config.WATCH_EXCLUDE_DIRS)
chatbot = ChatbotService(
    backup_manager=backup_manager,
    scheduler=scheduler,
    vfs_service=vfs_service,
    power_guard=power_guard,
)


def create_app() -> Flask:
    app = Flask(__name__)
    app.config.from_object(config)
    CORS(app, supports_credentials=True)

    db.init_app(app)
    jwt.init_app(app)

    with app.app_context():
        db.create_all()
        for vf in VirtualFile.query.filter(VirtualFile.status != "deleted").all():
            watcher.track_file(vf)

    register_blueprints(app)

    app.extensions["vfs_service"] = vfs_service
    app.extensions["watcher_service"] = watcher
    app.extensions["backup_manager"] = backup_manager
    app.extensions["scheduler"] = scheduler
    app.extensions["chatbot"] = chatbot
    app.extensions["power_guard"] = power_guard

    backup_manager.attach_app(app)
    backup_manager.start()
    scheduler.start()
    watcher.start()

    return app


app = create_app()


@app.get("/api/health")
def health():
    return {"status": "ok"}


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)

