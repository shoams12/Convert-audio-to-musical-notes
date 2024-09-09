
import uuid
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from pymongo import MongoClient
from bson.objectid import ObjectId
import os
from main import main

app = Flask(__name__, static_folder='static', static_url_path='')
CORS(app)

# Initialize MongoDB client and select database and collection
client = MongoClient("mongodb://localhost:27017/")
db = client["noteMe_Site"]
users_col = db["users"]
songs_col = db["songs"]


@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")
    user = users_col.find_one({"email": email})
    if user and user['password']:
        print(user["userName"])
        return jsonify({"userName": user["userName"], "email": user["email"]})
    return jsonify({"message": "User not found"}), 404


def user_serializer(user):
    """Convert ObjectId to string for JSON serialization."""
    user["id"] = str(user["_id"])
    del user["_id"]
    return user


@app.route('/add_user', methods=['POST'])
def add_user():
    data = request.get_json()
    username = data.get("userName")
    email = data.get("email")
    password = data.get("password")

    if len(username) > 22 or len(password) > 20:
        return jsonify({"message": "User not valid"}), 400

    new_user = {
        "userName": username,
        "email": email,
        "password": password
    }
    # users_col.insert_one(new_user)
    # return jsonify({"message": "User added successfully", "user": new_user})
    insert_result = users_col.insert_one(new_user)
    new_user["id"] = str(insert_result.inserted_id)
    return jsonify({"message": "User added successfully", "user": user_serializer(new_user)})


@app.route("/uploadAudio", methods=["POST"])
def upload_audio():
    file = request.files['file']
    # user_email = request.form.get('userEmail')
    # song_name = request.form.get('songName')
    if file.filename.endswith(('.mp3', '.wav', '.m4a')):
        path = './audioUploadedFiles/' + file.filename
        file.save(path)
        pdfFileName = "example"
        main(path, pdfFileName)
        pdf_path = './pdfOutputFiles/example.pdf'
        if os.path.exists(pdf_path) and os.path.getsize(pdf_path) > 0:
            return jsonify({"message": "PDF generated successfully"}), 200
        else:
            return jsonify({"message": "PDF generation failed"}), 500
    else:
        return jsonify({"message": "Choose a different file"}), 400


@app.route("/downloadPdf", methods=["GET"])
def download_pdf():
    pdf_path = './pdfOutputFiles/example.pdf'
    if os.path.exists(pdf_path):
        return send_file(pdf_path, as_attachment=True, download_name="yourSong.pdf", mimetype='application/pdf')
    else:
        return jsonify({"message": "PDF not found"}), 404


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
    data = request.get_json()
    songName = data.get("songName")
    fileName = data.get("fileName")
    filePath = data.get("filePath")
    userId = data.get("userId")

    new_song = {
        "songName": songName,
        "fileName": fileName,
        "filePath": filePath,
        "userId": userId
    }

    insert_result = songs_col.insert_one(new_song)
    new_song["id"] = str(insert_result.inserted_id)
    return jsonify({"message": "Song added successfully", "song": song_serializer(new_song)})


@app.route('/songs/<userId>', methods=['GET'])
def get_songs_by_user(userId):
    songs = songs_col.find({"userId": userId})
    return jsonify([song_serializer(song) for song in songs])


@app.route('/remove_song', methods=['DELETE'])
def remove_song():
    data = request.get_json()
    song_id = data.get("songId")
    user_id = data.get("userId")

    if song_id and user_id:
        result = songs_col.delete_one({"_id": ObjectId(song_id), "userId": user_id})
        if result.deleted_count == 1:
            return jsonify({"message": "Song removed successfully"})
        else:
            return jsonify({"message": "Song not found"}), 404
    else:
        return jsonify({"message": "Invalid input"}), 400


if __name__ == '__main__':
    app.run()
