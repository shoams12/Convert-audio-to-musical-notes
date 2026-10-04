import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import About from "./components/About";
import History from "./components/History";
import HomePage from "./components/HomePage";
import Landing from "./components/Landing";
import LogIn from "./components/logIn";
import Navbar from "./components/Navbar";
import { GuestOnly, RequireAuth } from "./components/ProtectedRoute";
import SignUp from "./components/signUp";

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <div className="app">
            <Navbar />
            <main className="main">
              <Routes>
                <Route index element={<GuestOnly><Landing /></GuestOnly>} />
                <Route path="login" element={<GuestOnly><LogIn /></GuestOnly>} />
                <Route path="signup" element={<GuestOnly><SignUp /></GuestOnly>} />
                <Route path="about" element={<About />} />
                <Route path="home" element={<RequireAuth><HomePage /></RequireAuth>} />
                <Route path="history" element={<RequireAuth><History /></RequireAuth>} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <footer className="footer">
              © {new Date().getFullYear()} NoteMe · Where sound meets score 🎹
            </footer>
          </div>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
