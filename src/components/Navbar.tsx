import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Terminal,
  Upload,
  LayoutGrid,
  Shield,
  LogOut,
  LogIn,
  Menu,
  X,
  Heart,
} from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const { session, logout, isUser, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
    setMobileOpen(false);
  };

  const isActive = (path: string) =>
    location.pathname === path
      ? "text-violet-400 border-b border-violet-400"
      : "text-gray-300 hover:text-white";

  const navLinks = (
    <>
      <Link
        to="/"
        className={`flex items-center gap-1 pb-0.5 text-sm font-medium transition-colors ${isActive("/")}`}
        onClick={() => setMobileOpen(false)}
      >
        <LayoutGrid size={15} />
        Explore
      </Link>
      {isUser && (
        <Link
          to="/saved"
          className={`flex items-center gap-1 pb-0.5 text-sm font-medium transition-colors ${isActive("/saved")}`}
          onClick={() => setMobileOpen(false)}
        >
          <Heart size={15} />
          Saved
        </Link>
      )}
      {isUser && (
        <Link
          to="/upload"
          className={`flex items-center gap-1 pb-0.5 text-sm font-medium transition-colors ${isActive("/upload")}`}
          onClick={() => setMobileOpen(false)}
        >
          <Upload size={15} />
          Upload
        </Link>
      )}
      {isUser && (
        <Link
          to="/my-gallery"
          className={`flex items-center gap-1 pb-0.5 text-sm font-medium transition-colors ${isActive("/my-gallery")}`}
          onClick={() => setMobileOpen(false)}
        >
          My Gallery
        </Link>
      )}

      {isAdmin && (
        <Link
          to="/admin"
          className={`flex items-center gap-1 pb-0.5 text-sm font-medium transition-colors ${isActive("/admin")}`}
          onClick={() => setMobileOpen(false)}
        >
          <Shield size={15} />
          Admin
        </Link>
      )}
    </>
  );

  return (
    <nav className="sticky top-0 z-50 bg-[#0d0d1a]/90 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 shrink-0"
          onClick={() => setMobileOpen(false)}
        >
          <span className="flex items-center justify-center w-7 h-7 rounded bg-violet-600">
            <Terminal size={15} className="text-white" />
          </span>
          <span className="text-white font-bold text-base tracking-tight">
            Terminal<span className="text-violet-400">Art</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">{navLinks}</div>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-3">
          {session ? (
            <>
              <span className="text-sm text-gray-400">
                <span className="text-violet-400 font-semibold">
                  {session.username}
                </span>
                <span className="ml-1 text-xs bg-white/10 px-1.5 py-0.5 rounded text-gray-400">
                  {session.role}
                </span>
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-400 transition-colors"
              >
                <LogOut size={14} />
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-1.5 text-sm bg-violet-600 hover:bg-violet-500 text-white px-3 py-1.5 rounded-lg transition-colors font-medium"
            >
              <LogIn size={14} />
              Login
            </Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-gray-300 hover:text-white"
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[#0d0d1a] border-t border-white/5 px-4 py-4 flex flex-col gap-4">
          {navLinks}
          <div className="border-t border-white/10 pt-4">
            {session ? (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">
                  <span className="text-violet-400 font-semibold">
                    {session.username}
                  </span>
                  <span className="ml-1 text-xs bg-white/10 px-1.5 py-0.5 rounded text-gray-400">
                    {session.role}
                  </span>
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 text-sm text-red-400"
                >
                  <LogOut size={14} /> Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-1.5 text-sm bg-violet-600 text-white px-3 py-1.5 rounded-lg w-fit"
              >
                <LogIn size={14} /> Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
