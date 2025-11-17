from flask import Blueprint, current_app, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

chatbot_bp = Blueprint("chatbot", __name__)


@chatbot_bp.post("/")
@jwt_required()
def converse():
    user_id = get_jwt_identity()
    payload = request.get_json() or {}
    message = payload.get("message", "")
    chatbot = current_app.extensions["chatbot"]
    response = chatbot.respond(user_id, message)
    return jsonify(response)

