import hmac
import math
import os
import re
import time
import uuid

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from werkzeug.exceptions import RequestEntityTooLarge
from werkzeug.security import generate_password_hash, check_password_hash
from pymongo import MongoClient
from bson.objectid import ObjectId
from main import main

app = Flask(__name__, static_folder='static', static_url_path='')
# Audio uploads are limited to 10 MB on the client; saved songs carry the audio as
# base64 (about 13.4 MB for a 10 MB file), so allow a little more per request.
app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024
CORS(app)

# Initialize MongoDB client and select database and collection
client = MongoClient("mongodb://localhost:27017/")
db = client["noteMe_Site"]
users_col = db["users"]
songs_col = db["songs"]

UPLOAD_DIR = './audioUploadedFiles'
PDF_DIR = './pdfOutputFiles'
PDF_NAME = "example"
PDF_PATH = PDF_DIR + '/' + PDF_NAME + '.pdf'
ALLOWED_AUDIO_EXTENSIONS = ('.mp3', '.wav', '.m4a')

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(PDF_DIR, exist_ok=True)

# ---------- Validation (keep in sync with src/utils/validation.js) ----------

USERNAME_RE = re.compile(r"^[^\W\d_][\w .-]{2,19}$")
EMAIL_RE = re.compile(r"^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$")
SONG_NAME_MAX = 40

MAX_FAILED_LOGINS = 5
LOCKOUT_SECONDS = 5 * 60
failed_logins = {}  # email -> (failed attempts, time of first failure)


def validate_username(username):
    if not isinstance(username, str) or not 3 <= len(username) <= 20:
        return "Username must be 3-20 characters"
    if not USERNAME_RE.match(username):
        return "Username must start with a letter and contain only letters, numbers, spaces, _ . -"
    return None


def validate_email(email):
    if not isinstance(email, str) or not email or len(email) > 254:
        return "Please enter a valid email address"
    if ".." in email or not EMAIL_RE.match(email):
        return "Please enter a valid email address"
    return None


def validate_password(password, username="", email=""):
    if not isinstance(password, str) or not 8 <= len(password) <= 32:
        return "Password must be 8-32 characters"
    if re.search(r"\s", password):
        return "Password must not contain spaces"
    if not re.search(r"[a-z]", password):
        return "Password must contain a lowercase letter"
    if not re.search(r"[A-Z]", password):
        return "Password must contain an uppercase letter"
    if not re.search(r"\d", password):
        return "Password must contain a number"
    if not re.search(r"[^A-Za-z0-9]", password):
        return "Password must contain a special character"
    lowered = password.lower()
    for part in (username, email.split("@")[0]):
        if part and len(part) >= 3 and part.lower() in lowered:
            return "Password must not contain your username or email"
    return None


def find_user_by_email(email):
    # Case-insensitive so accounts created before emails were normalized still match
    return users_col.find_one({"email": {"$regex": "^" + re.escape(email) + "$", "$options": "i"}})


def password_matches(user, password):
    stored = user.get("password") or ""
    if stored.startswith(("scrypt:", "pbkdf2:")):
        return check_password_hash(stored, password)
    # Older accounts stored the password as plain text: check it, then upgrade to a hash
    if stored and hmac.compare_digest(stored.encode(), password.encode()):
        users_col.update_one({"_id": user["_id"]}, {"$set": {"password": generate_password_hash(password)}})
        return True
    return False


def lockout_remaining(email):
    entry = failed_logins.get(email)
    if not entry:
        return 0
    count, first_failure = entry
    elapsed = time.time() - first_failure
    if elapsed > LOCKOUT_SECONDS:
        failed_logins.pop(email, None)
        return 0
    return LOCKOUT_SECONDS - elapsed if count >= MAX_FAILED_LOGINS else 0


def register_failed_login(email):
    count, first_failure = failed_logins.get(email, (0, time.time()))
    failed_logins[email] = (count + 1, first_failure)


@app.errorhandler(RequestEntityTooLarge)
def file_too_large(_error):
    return jsonify({"message": "The file is too large. The maximum size is 10 MB"}), 413


# ---------- Users ----------

@app.route("/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}
    email = str(data.get("email", "")).strip().lower()
    password = data.get("password")

    if validate_email(email) or not isinstance(password, str) or not password:
        return jsonify({"message": "Please enter a valid email and password"}), 400

    remaining = lockout_remaining(email)
    if remaining:
        minutes = math.ceil(remaining / 60)
        return jsonify({"message": f"Too many failed attempts. Try again in {minutes} minute(s)"}), 429

    user = find_user_by_email(email)
    if user and password_matches(user, password):
        failed_logins.pop(email, None)
        return jsonify({"userName": user["userName"], "email": user["email"]})

    register_failed_login(email)
    return jsonify({"message": "Incorrect email or password"}), 401


@app.route('/add_user', methods=['POST'])
def add_user():
    data = request.get_json(silent=True) or {}
    username = str(data.get("userName", "")).strip()
    email = str(data.get("email", "")).strip().lower()
    password = data.get("password")

    error = validate_username(username) or validate_email(email) or validate_password(password, username, email)
    if error:
        return jsonify({"message": error}), 400

    if find_user_by_email(email):
        return jsonify({"message": "An account with this email already exists"}), 409

    new_user = {
        "userName": username,
        "email": email,
        "password": generate_password_hash(password)
    }
    insert_result = users_col.insert_one(new_user)
    return jsonify({
        "message": "User added successfully",
        "user": {"id": str(insert_result.inserted_id), "userName": username, "email": email}
    })


# ---------- Audio → PDF ----------

@app.route("/uploadAudio", methods=["POST"])
def upload_audio():
    file = request.files.get('file')
    if file is None or not file.filename:
        return jsonify({"message": "No file was uploaded"}), 400

    extension = os.path.splitext(file.filename)[1].lower()
    if extension not in ALLOWED_AUDIO_EXTENSIONS:
        return jsonify({"message": "Unsupported file type. Please upload a .wav, .mp3 or .m4a file"}), 400

    # Never trust the uploaded name: save under a random name with a known extension
    path = UPLOAD_DIR + '/' + uuid.uuid4().hex + extension
    file.save(path)

    # Remove the previous PDF so an old result is never reported as a new success
    if os.path.exists(PDF_PATH):
        try:
            os.remove(PDF_PATH)
        except OSError:
            pass

    try:
        main(path, PDF_NAME)
    except Exception:
        app.logger.exception("Converting %s failed", path)
        return jsonify({"message": "We couldn't convert this recording. Try a clearer piano recording"}), 500

    if os.path.exists(PDF_PATH) and os.path.getsize(PDF_PATH) > 0:
        return jsonify({"message": "PDF generated successfully"}), 200
    return jsonify({"message": "PDF generation failed"}), 500


@app.route("/downloadPdf", methods=["GET"])
def download_pdf():
    if os.path.exists(PDF_PATH):
        return send_file(PDF_PATH, as_attachment=True, download_name="yourSong.pdf", mimetype='application/pdf')
    return jsonify({"message": "PDF not found"}), 404


# ---------- Songs ----------

def song_serializer(song) -> dict:
    return {
        "id": str(song["_id"]),
        "songName": song["songName"],
        "fileName": song["fileName"],
        "filePath": song["filePath"],
        "userId": song["userId"]
    }


@app.route('/add_song', methods=['POST'])
def add_song():
    data = request.get_json(silent=True) or {}
    songName = str(data.get("songName", "")).strip()
    fileName = data.get("fileName")
    filePath = data.get("filePath")
    userId = data.get("userId")

    if not songName or len(songName) > SONG_NAME_MAX or re.search(r"[<>]", songName):
        return jsonify({"message": f"Song name must be 1-{SONG_NAME_MAX} characters, without < or >"}), 400
    if not isinstance(filePath, str) or not filePath.startswith("data:"):
        return jsonify({"message": "Missing audio for this song"}), 400
    if not isinstance(userId, str) or not find_user_by_email(userId):
        return jsonify({"message": "User not found"}), 404

    new_song = {
        "songName": songName,
        "fileName": fileName if isinstance(fileName, str) else "",
        "filePath": filePath,
        "userId": userId
    }

    insert_result = songs_col.insert_one(new_song)
    new_song["_id"] = insert_result.inserted_id
    return jsonify({"message": "Song added successfully", "song": song_serializer(new_song)})


@app.route('/songs/<userId>', methods=['GET'])
def get_songs_by_user(userId):
    songs = songs_col.find({"userId": userId})
    return jsonify([song_serializer(song) for song in songs])


@app.route('/remove_song', methods=['DELETE'])
def remove_song():
    data = request.get_json(silent=True) or {}
    song_id = data.get("songId")
    user_id = data.get("userId")

    if not song_id or not user_id or not ObjectId.is_valid(song_id):
        return jsonify({"message": "Invalid input"}), 400

    result = songs_col.delete_one({"_id": ObjectId(song_id), "userId": user_id})
    if result.deleted_count == 1:
        return jsonify({"message": "Song removed successfully"})
    return jsonify({"message": "Song not found"}), 404


if __name__ == '__main__':
    app.run()
