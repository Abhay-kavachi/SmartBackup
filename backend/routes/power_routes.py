from flask import Blueprint, current_app, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

power_bp = Blueprint("power", __name__)


@power_bp.get("/state")
@power_bp.get("state")
@jwt_required()
def get_power():
    user_id = int(get_jwt_identity())
    guard = current_app.extensions["power_guard"]
    state = guard.get_state(user_id)
    return jsonify({"state": state.__dict__})


@power_bp.post("/state")
@power_bp.post("state")
@jwt_required()
def update_power():
    user_id = int(get_jwt_identity())
    payload = request.get_json() or {}
    level = float(payload.get("level", 1))
    charging = bool(payload.get("charging", False))
    guard = current_app.extensions["power_guard"]
    state = guard.update(user_id, level, charging)
    return jsonify({"state": state.__dict__})

