import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import logo from "../images/logo.png";

const WHITE_KEYS = [
  { note: "C", freq: 261.63, key: "a" },
  { note: "D", freq: 293.66, key: "s" },
  { note: "E", freq: 329.63, key: "d" },
  { note: "F", freq: 349.23, key: "f" },
  { note: "G", freq: 392.0, key: "g" },
  { note: "A", freq: 440.0, key: "h" },
  { note: "B", freq: 493.88, key: "j" },
  { note: "C", freq: 523.25, key: "k" },
];
// index of the white key each black key sits after
const BLACK_KEYS = [
  { after: 0, freq: 277.18, note: "C#" },
  { after: 1, freq: 311.13, note: "D#" },
  { after: 3, freq: 369.99, note: "F#" },
  { after: 4, freq: 415.3, note: "G#" },
  { after: 5, freq: 466.16, note: "A#" },
];

export const STEPS = [
  { icon: "🎙️", title: "Upload", text: "Choose a piano recording — .wav, .mp3 or .m4a, up to 10 MB." },
  { icon: "🧠", title: "Convert", text: "Our neural network finds every note and its length." },
  { icon: "🎼", title: "Download", text: "Get printable sheet music as a PDF and save it to your songs." },
];

function MiniPiano() {
  const ctxRef = useRef(null);
  const [active, setActive] = useState(null);

  const play = (id, freq) => {
    setActive(id);
    setTimeout(() => setActive((current) => (current === id ? null : current)), 250);
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!ctxRef.current) ctxRef.current = new AudioCtx();
      const ctx = ctxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.25);
    } catch {
      // audio isn't available in this browser; the keys still animate
    }
  };

  const onKeyDown = (e) => {
    const index = WHITE_KEYS.findIndex((k) => k.key === e.key.toLowerCase());
    if (index >= 0) play(`w${index}`, WHITE_KEYS[index].freq);
  };

  return (
    <div className="piano-card">
      <div className="piano" tabIndex={0} onKeyDown={onKeyDown} aria-label="Mini piano. Press keys A to K to play">
        {WHITE_KEYS.map((k, i) => (
          <button
            key={`w${i}`}
            className={`white-key ${active === `w${i}` ? "pressed" : ""}`}
            onMouseDown={() => play(`w${i}`, k.freq)}
            aria-label={`Play ${k.note}`}
            tabIndex={-1}
          >
            <span>{k.note}</span>
          </button>
        ))}
        {BLACK_KEYS.map((k, i) => (
          <button
            key={`b${i}`}
            className={`black-key ${active === `b${i}` ? "pressed" : ""}`}
            style={{ left: `calc(${(k.after + 1) * 12.5}% - 3.5%)` }}
            onMouseDown={() => play(`b${i}`, k.freq)}
            aria-label={`Play ${k.note}`}
            tabIndex={-1}
          />
        ))}
      </div>
      <p className="piano-hint">Try it — click the keys or press A S D F G H J K 🎹</p>
    </div>
  );
}

export default function Landing() {
  return (
    <div className="page">
      <section className="hero">
        <div className="hero-text fade-in">
          <span className="pill">🎵 Where sound meets score</span>
          <h1>
            Turn your piano recordings into <span className="gradient-text">sheet music</span>
          </h1>
          <p className="lead">
            Upload a recording, and NoteMe listens, detects every note, and writes a printable score for you — in
            seconds.
          </p>
          <div className="hero-actions">
            <Link to="/signup" className="btn btn-primary btn-lg">
              Get started — it's free
            </Link>
            <Link to="/login" className="btn btn-ghost btn-lg">
              I have an account
            </Link>
          </div>
        </div>
        <div className="hero-visual fade-in delay-1">
          <img src={logo} alt="NoteMe — where sound meets score" className="hero-logo" />
          <MiniPiano />
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">How does it work?</h2>
        <div className="steps-grid">
          {STEPS.map((step, i) => (
            <div key={step.title} className={`card step-card fade-in delay-${i + 1}`}>
              <span className="step-number">{i + 1}</span>
              <div className="step-icon">{step.icon}</div>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
