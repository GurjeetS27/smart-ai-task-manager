import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from "react";
import AuthProvider from "./context/AuthContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Navbar from "./components/Navbar";

function App() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <Router> {/* ✅ Router wraps everything */}
      <AuthProvider> {/* ✅ AuthProvider inside Router */}
        <Navbar darkMode={darkMode} setDarkMode={setDarkMode} /> {/* ✅ Pass darkMode & setDarkMode */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard darkMode={darkMode} setDarkMode={setDarkMode} />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
