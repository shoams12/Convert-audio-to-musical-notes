// Keep these rules in sync with the server checks in Server/mongoDB.py

export const LIMITS = {
  usernameMin: 3,
  usernameMax: 20,
  passwordMin: 8,
  passwordMax: 32,
  songNameMax: 40,
  audioMaxBytes: 10 * 1024 * 1024,
};

export const AUDIO_EXTENSIONS = [".wav", ".mp3", ".m4a"];

const USERNAME_RE = /^\p{L}[\p{L}\p{N} _.-]{2,19}$/u;
const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;

export function validateUsername(value) {
  const name = value.trim();
  if (!name) return "Username is required";
  if (name.length < LIMITS.usernameMin || name.length > LIMITS.usernameMax) {
    return `Username must be ${LIMITS.usernameMin}-${LIMITS.usernameMax} characters`;
  }
  if (!USERNAME_RE.test(name)) {
    return "Start with a letter and use only letters, numbers, spaces, _ . -";
  }
  return "";
}

export function validateEmail(value) {
  const email = value.trim();
  if (!email) return "Email is required";
  if (email.length > 254 || email.includes("..") || !EMAIL_RE.test(email)) {
    return "Please enter a valid email address (like name@example.com)";
  }
  return "";
}

export const PASSWORD_RULES = [
  {
    id: "length",
    label: `${LIMITS.passwordMin}-${LIMITS.passwordMax} characters`,
    test: (p) => p.length >= LIMITS.passwordMin && p.length <= LIMITS.passwordMax,
  },
  { id: "lower", label: "A lowercase letter", test: (p) => /[a-z]/.test(p) },
  { id: "upper", label: "An uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { id: "digit", label: "A number", test: (p) => /\d/.test(p) },
  { id: "special", label: "A special character (!@#$…)", test: (p) => /[^A-Za-z0-9\s]/.test(p) },
  { id: "spaces", label: "No spaces", test: (p) => p.length > 0 && !/\s/.test(p) },
];

function containsPersonalInfo(password, { username = "", email = "" }) {
  const lowered = password.toLowerCase();
  return [username.trim(), email.trim().split("@")[0]].some(
    (part) => part.length >= 3 && lowered.includes(part.toLowerCase())
  );
}

export function validatePassword(password, personal = {}) {
  if (!password) return "Password is required";
  const failed = PASSWORD_RULES.find((rule) => !rule.test(password));
  if (failed) return `Password needs: ${failed.label.toLowerCase()}`;
  if (containsPersonalInfo(password, personal)) {
    return "Password must not contain your username or email";
  }
  return "";
}

// 0 = empty, 1 = weak, 2 = fair, 3 = good, 4 = strong
export function passwordStrength(password) {
  if (!password) return 0;
  const passed = PASSWORD_RULES.filter((rule) => rule.test(password)).length;
  let score = passed <= 3 ? 1 : passed <= 5 ? 2 : 3;
  if (score === 3 && password.length >= 12) score = 4;
  return score;
}

export function validateSongName(value) {
  const name = value.trim();
  if (!name) return "Give your song a name";
  if (name.length > LIMITS.songNameMax) {
    return `Song name can be up to ${LIMITS.songNameMax} characters`;
  }
  if (/[<>]/.test(name)) return "Song name can't contain < or >";
  return "";
}

export function validateAudioFile(file) {
  if (!file) return "Please choose an audio file";
  const name = file.name.toLowerCase();
  if (!AUDIO_EXTENSIONS.some((ext) => name.endsWith(ext))) {
    return "Unsupported file type. Please upload a .wav, .mp3 or .m4a file";
  }
  if (file.size === 0) return "This file is empty";
  if (file.size > LIMITS.audioMaxBytes) return "The file is too large. The maximum size is 10 MB";
  return "";
}

export function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
