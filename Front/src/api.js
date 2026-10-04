import axios from "axios";

export const api = axios.create({ baseURL: "http://localhost:5000" });

export function errorMessage(error, fallback = "Something went wrong. Please try again.") {
  const message = error?.response?.data?.message;
  if (typeof message === "string" && message) return message;
  if (error?.code === "ERR_NETWORK") {
    return "Can't reach the NoteMe server. Make sure it is running on port 5000.";
  }
  return fallback;
}

function safeFileName(name) {
  const cleaned = (name || "").replace(/[\\/:*?"<>|]/g, "").trim();
  return cleaned || "yourSong";
}

export async function downloadPdf(name) {
  const res = await api.get("/downloadPdf", { responseType: "blob" });
  const url = URL.createObjectURL(res.data);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${safeFileName(name)}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function convertAudio(file) {
  const formData = new FormData();
  formData.append("file", file);
  return api.post("/uploadAudio", formData);
}

const MIME_EXTENSIONS = {
  "audio/mpeg": ".mp3",
  "audio/mp3": ".mp3",
  "audio/wav": ".wav",
  "audio/x-wav": ".wav",
  "audio/wave": ".wav",
  "audio/vnd.wave": ".wav",
  "audio/x-m4a": ".m4a",
  "audio/m4a": ".m4a",
  "audio/mp4": ".m4a",
};

// Saved songs keep their audio as a data URL; turn it back into a File to convert again
export async function songToFile(song) {
  const blob = await (await fetch(song.filePath)).blob();
  const storedName = typeof song.fileName === "string" ? song.fileName.toLowerCase() : "";
  const storedExt = [".wav", ".mp3", ".m4a"].find((ext) => storedName.endsWith(ext));
  const ext = storedExt || MIME_EXTENSIONS[blob.type] || ".wav";
  return new File([blob], `recording${ext}`, { type: blob.type });
}
