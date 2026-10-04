import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { api, convertAudio, downloadPdf, errorMessage } from "../api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { formatBytes, LIMITS, validateAudioFile, validateSongName } from "../utils/validation";
import Timer from "./timer";

const STEPS = ["Upload", "Convert", "Save & download"];

function readAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function baseName(fileName) {
  return fileName.replace(/\.[^.]+$/, "").slice(0, LIMITS.songNameMax);
}

export default function HomePage() {
  const { user } = useAuth();
  const { notify } = useToast();
  const inputRef = useRef(null);

  const [audioFile, setAudioFile] = useState(null);
  const [audioUrl, setAudioUrl] = useState("");
  const [dragging, setDragging] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | converting | done
  const [songName, setSongName] = useState("");
  const [nameTouched, setNameTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const step = !audioFile ? 0 : status === "done" ? 2 : 1;
  const nameError = validateSongName(songName);

  const chooseFile = async (file) => {
    if (!file) return;
    const error = validateAudioFile(file);
    if (error) {
      notify(error, "error");
      return;
    }
    try {
      const url = await readAsDataUrl(file);
      setAudioFile(file);
      setAudioUrl(url);
      setSongName(baseName(file.name));
      setNameTouched(false);
      setStatus("idle");
      setSaved(false);
    } catch {
      notify("We couldn't read that file. Please try another one.", "error");
    }
  };

  const reset = () => {
    setAudioFile(null);
    setAudioUrl("");
    setSongName("");
    setStatus("idle");
    setSaved(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    if (status !== "converting") chooseFile(e.dataTransfer.files[0]);
  };

  const handleConvert = async () => {
    setStatus("converting");
    try {
      await convertAudio(audioFile);
      setStatus("done");
      notify("Your sheet music is ready! 🎼", "success");
    } catch (error) {
      setStatus("idle");
      notify(errorMessage(error, "Conversion failed. Please try again."), "error");
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadPdf(nameError ? baseName(audioFile.name) : songName.trim());
    } catch (error) {
      notify(errorMessage(error, "Couldn't download the PDF. Please convert again."), "error");
    } finally {
      setDownloading(false);
    }
  };

  const handleSave = async () => {
    setNameTouched(true);
    if (nameError) return;
    setSaving(true);
    try {
      await api.post("/add_song", {
        songName: songName.trim(),
        fileName: audioFile.name,
        filePath: audioUrl,
        userId: user.email,
      });
      setSaved(true);
      notify(`"${songName.trim()}" was saved to your songs`, "success");
    } catch (error) {
      notify(errorMessage(error, "Failed to save the song."), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page narrow">
      <div className="page-header fade-in">
        <h1>Hi, {user.userName} 👋</h1>
        <p className="lead">Welcome to your sheet music maker</p>
      </div>

      <ol className="stepper" aria-label="Progress">
        {STEPS.map((label, i) => (
          <li key={label} className={i < step ? "complete" : i === step ? "current" : ""}>
            <span className="stepper-dot">{i < step ? "✓" : i + 1}</span>
            <span className="stepper-label">{label}</span>
          </li>
        ))}
      </ol>

      <div className="card converter fade-in">
        {!audioFile ? (
          <label
            className={`dropzone ${dragging ? "dragging" : ""}`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".wav,.mp3,.m4a,audio/wav,audio/mpeg,audio/mp4,audio/x-m4a"
              className="visually-hidden"
              onChange={(e) => chooseFile(e.target.files[0])}
            />
            <span className="dropzone-icon">🎙️</span>
            <strong>Drag & drop your piano recording here</strong>
            <span className="muted">or click to browse</span>
            <span className="dropzone-formats">.wav · .mp3 · .m4a · up to 10 MB</span>
          </label>
        ) : (
          <>
            <div className="file-row">
              <span className="file-icon">🎵</span>
              <div className="file-info">
                <strong title={audioFile.name}>{audioFile.name}</strong>
                <span className="muted">{formatBytes(audioFile.size)}</span>
              </div>
              <button
                className="icon-btn"
                onClick={reset}
                disabled={status === "converting"}
                aria-label="Remove file"
                title="Choose a different file"
              >
                ✕
              </button>
            </div>
            <audio className="audio" src={audioUrl} controls />

            {status === "idle" && (
              <button className="btn btn-primary btn-lg btn-block" onClick={handleConvert}>
                ✨ Convert to sheet music
              </button>
            )}

            {status === "converting" && <Timer />}

            {status === "done" && (
              <div className="result fade-in">
                <div className="result-banner">
                  <span>🎼</span>
                  <div>
                    <strong>Your sheet music is ready!</strong>
                    <p className="muted">Download it now, or save it to your songs for later.</p>
                  </div>
                </div>

                <button className="btn btn-primary btn-lg btn-block" onClick={handleDownload} disabled={downloading}>
                  {downloading ? <span className="spinner" aria-label="Downloading" /> : "⬇️ Download PDF"}
                </button>

                <div className={`field ${nameTouched && nameError ? "has-error" : ""}`}>
                  <label htmlFor="songName">
                    Song name
                    <span className="counter">
                      {songName.trim().length}/{LIMITS.songNameMax}
                    </span>
                  </label>
                  <div className="inline-form">
                    <input
                      id="songName"
                      className="input"
                      placeholder="Name your song"
                      value={songName}
                      maxLength={LIMITS.songNameMax}
                      disabled={saved}
                      aria-invalid={Boolean(nameTouched && nameError)}
                      onChange={(e) => setSongName(e.target.value)}
                      onBlur={() => setNameTouched(true)}
                    />
                    <button className="btn btn-secondary" onClick={handleSave} disabled={saving || saved}>
                      {saving ? <span className="spinner" aria-label="Saving" /> : saved ? "✓ Saved" : "💾 Save"}
                    </button>
                  </div>
                  {nameTouched && nameError && <p className="field-error">{nameError}</p>}
                </div>

                <div className="result-actions">
                  {saved && (
                    <Link to="/history" className="btn btn-ghost">
                      View my songs →
                    </Link>
                  )}
                  <button className="btn btn-ghost" onClick={reset}>
                    ↺ Convert another recording
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
