import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import logo from "../images/logo.png";

const THEME_KEY = "noteme-theme";

function initialTheme() {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    // storage unavailable, fall through to the system preference
  }
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState(initialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      // ignore: theme just won't be remembered
    }
  }, [theme]);

  useEffect(() => setMenuOpen(false), [location.pathname]);

  const handleLogout = () => {
    logout();
    notify("You've been logged out. See you soon! 👋", "info");
    navigate("/");
  };

  const links = user
    ? [
        { to: "/home", label: "Convert" },
        { to: "/history", label: "My Songs" },
        { to: "/about", label: "About" },
      ]
    : [
        { to: "/", label: "Home", end: true },
        { to: "/about", label: "About" },
      ];

  return (
    <header className="navbar">
      <Link to={user ? "/home" : "/"} className="brand" aria-label="NoteMe home">
        <img src={logo} alt="NoteMe" className="brand-logo" />
      </Link>

      <button
        className={`nav-toggle ${menuOpen ? "open" : ""}`}
        aria-label="Toggle menu"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((open) => !open)}
      >
        <span />
        <span />
        <span />
      </button>

      <nav className={`nav-links ${menuOpen ? "open" : ""}`}>
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            {link.label}
          </NavLink>
        ))}

        <button
          className="theme-toggle"
          onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>

        {user ? (
          <div className="nav-user">
            <span className="avatar" aria-hidden="true">
              {user.userName.charAt(0).toUpperCase()}
            </span>
            <span className="nav-username">{user.userName}</span>
            <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
              Log out
            </button>
          </div>
        ) : (
          <div className="nav-user">
            <NavLink to="/login" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
              Log in
            </NavLink>
            <Link to="/signup" className="btn btn-light btn-sm">
              Sign up
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
