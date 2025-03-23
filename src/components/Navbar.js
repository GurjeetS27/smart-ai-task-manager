import { Link, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Sun, Moon, LogOut, LogIn, Home, LayoutDashboard } from "lucide-react";

const Navbar = ({ darkMode, setDarkMode }) => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();

  return (
    <nav className={`p-4 shadow-md flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 transition-all ${darkMode ? "bg-gray-900 text-white" : "bg-blue-600 text-white"}`}>
      <div className="flex justify-between items-center w-full sm:w-auto">
        <Link to="/" className="text-lg sm:text-xl font-bold flex items-center gap-2">
          🧠 Smart AI Task Manager
        </Link>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-full bg-gray-800 text-white hover:bg-gray-700 transition sm:hidden"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      <div className="flex flex-wrap justify-center sm:justify-end items-center gap-3 w-full sm:w-auto">
        <NavItem to="/" label="Home" icon={<Home size={20} />} active={location.pathname === "/"} />
        <NavItem to="/dashboard" label="Dashboard" icon={<LayoutDashboard size={20} />} active={location.pathname === "/dashboard"} />

        {user ? (
          <button
            onClick={logout}
            className="flex items-center gap-2 bg-red-500 px-4 py-2 rounded-lg text-white hover:bg-red-600 transition"
          >
            <LogOut size={18} /> Logout
          </button>
        ) : (
          <Link
            to="/login"
            className="flex items-center gap-2 bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-gray-200 transition"
          >
            <LogIn size={18} /> Login
          </Link>
        )}

        {/* Only show toggle button on wider screens here */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="hidden sm:inline-flex p-2 rounded-full bg-gray-800 text-white hover:bg-gray-700 transition"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </nav>
  );
};

// ✅ Reusable Nav Item Component
const NavItem = ({ to, label, icon, active }) => (
  <Link
    to={to}
    className={`flex items-center gap-2 px-3 py-2 rounded-md transition ${
      active ? "bg-gray-300 text-gray-900" : "hover:bg-gray-200"
    }`}
  >
    {icon} {label}
  </Link>
);

export default Navbar;
