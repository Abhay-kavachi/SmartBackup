from flask import Blueprint

from .auth_routes import auth_bp
from .file_routes import file_bp
from .backup_routes import backup_bp
from .power_routes import power_bp
from .chatbot_routes import chatbot_bp
from .system_routes import system_bp

def register_blueprints(app):
    api = Blueprint("api", __name__)
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(file_bp, url_prefix="/api/files")
    app.register_blueprint(backup_bp, url_prefix="/api/backups")
    app.register_blueprint(chatbot_bp, url_prefix="/api/chatbot")
    app.register_blueprint(power_bp, url_prefix="/api/power")
    app.register_blueprint(system_bp, url_prefix="/api/system")
    return api
