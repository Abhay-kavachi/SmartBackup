from flask import Blueprint, current_app, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

chatbot_bp = Blueprint("chatbot", __name__)


@chatbot_bp.post("/")
@chatbot_bp.post("")
@jwt_required()
def converse():
    try:
        user_id_str = get_jwt_identity()
        print(f"JWT identity (string): '{user_id_str}' (type: {type(user_id_str)})")
        user_id = int(user_id_str)
        print(f"Converted user_id: {user_id} (type: {type(user_id)})")
    except (ValueError, TypeError) as e:
        print(f"JWT identity conversion error: {e}")
        return jsonify({"error": "Invalid authentication"}), 401
    
    payload = request.get_json() or {}
    message = payload.get("message", "")
    chatbot = current_app.extensions["chatbot"]
    response = chatbot.respond(user_id, message)
    return jsonify(response)

