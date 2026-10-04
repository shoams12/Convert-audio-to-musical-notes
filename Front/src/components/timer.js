import { useEffect, useState } from "react";

const TIPS = [
  "Detecting where each note begins…",
  "Listening for pitches with our neural network…",
  "Measuring the tempo of your recording…",
  "Writing notes onto the treble and bass staves…",
  "Engraving your sheet music with LilyPond…",
];

export default function Timer({ label = "Converting your recording" }) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const minutes = String(Math.floor(seconds / 60)).padStart(2, "0");
  const rest = String(seconds % 60).padStart(2, "0");
  const tip = TIPS[Math.floor(seconds / 4) % TIPS.length];

  return (
    <div className="progress-card" role="status" aria-live="polite">
      <div className="equalizer" aria-hidden="true">
        {Array.from({ length: 7 }, (_, i) => (
          <span key={i} style={{ animationDelay: `${i * 0.12}s` }} />
        ))}
      </div>
      <div>
        <strong>{label}</strong>
        <span className="progress-time">
          {minutes}:{rest}
        </span>
        <p className="progress-tip">{tip}</p>
      </div>
      <div className="progress-bar">
        <span />
      </div>
    </div>
  );
}
