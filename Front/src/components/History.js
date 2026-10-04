import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, convertAudio, downloadPdf, errorMessage, songToFile } from "../api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import ConfirmDialog from "./ConfirmDialog";
import Timer from "./timer";

export default function History() {
  const { user } = useAuth();
  const { notify } = useToast();

  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [toDelete, setToDelete] = useState(null);

  const loadSongs = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const res = await api.get(`/songs/${encodeURIComponent(user.email)}`);
      setSongs(res.data);
    } catch (error) {
      setLoadError(errorMessage(error, "Couldn't load your songs."));
    } finally {
      setLoading(false);
    }
  }, [user.email]);

  useEffect(() => {
    loadSongs();
  }, [loadSongs]);

  const handleSheetMusic = async (song) => {
    setBusyId(song.id);
    try {
      const file = await songToFile(song);
      await convertAudio(file);
      await downloadPdf(song.songName);
      notify(`Sheet music for "${song.songName}" downloaded 🎼`, "success");
    } catch (error) {
      notify(errorMessage(error, "Couldn't create the sheet music. Please try again."), "error");
    } finally {
      setBusyId(null);
    }
  };

  const confirmDelete = async () => {
    const song = toDelete;
    setToDelete(null);
    try {
      await api.delete("/remove_song", { data: { songId: song.id, userId: user.email } });
      setSongs((current) => current.filter((s) => s.id !== song.id));
      notify(`"${song.songName}" was removed`, "info");
    } catch (error) {
      notify(errorMessage(error, "Failed to remove the song."), "error");
    }
  };

  const closeDialog = useCallback(() => setToDelete(null), []);

  const filtered = songs.filter((s) => s.songName.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <div className="page">
      <div className="page-header row fade-in">
        <div>
          <h1>My Songs</h1>
          <p className="lead">
            {songs.length} {songs.length === 1 ? "song" : "songs"} saved
          </p>
        </div>
        <div className="toolbar">
          <input
            className="input search"
            type="search"
            placeholder="🔍 Search songs…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search songs"
          />
          <button className="btn btn-ghost" onClick={loadSongs} disabled={loading} title="Refresh">
            ↻
          </button>
          <Link to="/home" className="btn btn-primary">
            + New
          </Link>
        </div>
      </div>

      {busyId && <Timer label="Creating your sheet music" />}

      {loading ? (
        <div className="song-grid">
          {[0, 1, 2].map((i) => (
            <div key={i} className="card song-card skeleton" />
          ))}
        </div>
      ) : loadError ? (
        <div className="empty card">
          <span className="empty-icon">📡</span>
          <h3>{loadError}</h3>
          <button className="btn btn-primary" onClick={loadSongs}>
            Try again
          </button>
        </div>
      ) : songs.length === 0 ? (
        <div className="empty card fade-in">
          <span className="empty-icon">🎹</span>
          <h3>No songs yet</h3>
          <p className="muted">Convert your first recording and save it here.</p>
          <Link to="/home" className="btn btn-primary">
            Convert a recording
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty card">
          <span className="empty-icon">🔍</span>
          <h3>No songs match "{query}"</h3>
        </div>
      ) : (
        <div className="song-grid">
          {filtered.map((song) => (
            <div key={song.id} className="card song-card fade-in">
              <div className="song-head">
                <span className="song-icon">🎵</span>
                <h3 title={song.songName}>{song.songName}</h3>
              </div>
              <audio className="audio" src={song.filePath} controls preload="none" />
              <div className="song-actions">
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => handleSheetMusic(song)}
                  disabled={busyId !== null}
                >
                  {busyId === song.id ? <span className="spinner" aria-label="Working" /> : "🎼 Sheet music"}
                </button>
                <button
                  className="btn btn-danger-ghost btn-sm"
                  onClick={() => setToDelete(song)}
                  disabled={busyId === song.id}
                >
                  🗑 Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {toDelete && (
        <ConfirmDialog
          title="Delete this song?"
          message={`"${toDelete.songName}" will be permanently removed from your songs.`}
          confirmLabel="Delete"
          onConfirm={confirmDelete}
          onCancel={closeDialog}
        />
      )}
    </div>
  );
}
