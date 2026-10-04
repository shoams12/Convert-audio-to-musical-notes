import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../images/logo.png";

const FEATURES = [
  { icon: "🌐", title: "Music meets technology", text: "We bridge the timeless elegance of piano music and the modern world of technology." },
  { icon: "🎼", title: "Real sheet music", text: "Transform piano audio into tangible music sheets with treble and bass staves." },
  { icon: "✨", title: "For everyone", text: "Transcribing piano compositions is simple and accessible, whatever your musical expertise." },
  { icon: "🎹", title: "Learn & preserve", text: "Preserve your own compositions or learn from your favorite tunes." },
];

const PIPELINE = [
  "Normalize the volume of your recording",
  "Detect where every note starts (spectral flux)",
  "Identify each pitch with a trained neural network",
  "Estimate note lengths from the tempo",
  "Engrave the score as a PDF with LilyPond",
];

export default function About() {
  const { user } = useAuth();

  return (
    <div className="page">
      <section className="about-hero fade-in">
        <img src={logo} alt="NoteMe" className="about-logo" />
        <div>
          <h1>About NoteMe</h1>
          <p className="lead">
            Our mission is to empower musicians and enthusiasts alike with tools that transform piano audio into
            sheet music. Join us on this harmonious journey and unlock the creative power of every note!
          </p>
        </div>
      </section>

      <section className="feature-grid">
        {FEATURES.map((f, i) => (
          <div key={f.title} className={`card feature-card fade-in delay-${(i % 3) + 1}`}>
            <div className="feature-icon">{f.icon}</div>
            <h3>{f.title}</h3>
            <p>{f.text}</p>
          </div>
        ))}
      </section>

      <section className="card pipeline fade-in">
        <h2>What happens to your recording?</h2>
        <ol className="pipeline-list">
          {PIPELINE.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>

      <div className="cta">
        {user ? (
          <Link to="/home" className="btn btn-primary btn-lg">
            Convert a recording 🎙️
          </Link>
        ) : (
          <Link to="/signup" className="btn btn-primary btn-lg">
            Create your free account
          </Link>
        )}
      </div>
    </div>
  );
}
