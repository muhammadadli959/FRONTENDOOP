import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Terminal, LogIn } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import type { UserRole } from "../types";
import * as api from "../api";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const result = (await api.login(username.trim(), password)) as {
        username: string;
        role: UserRole;
        token: string;
      };
      // api.login() sudah parse ApiResponse.data => { token, username, role }
      login(result.username, result.role, result.token);
      navigate("/");
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Invalid username or password.",
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#0a0a14]">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-violet-600 mb-3">
            <Terminal size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="text-gray-500 text-sm mt-1">Sign in to TerminalArt</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-[#13131f] border border-white/10 rounded-2xl p-6 flex flex-col gap-4"
        >
          {error && (
            <div className="bg-red-900/30 border border-red-500/30 text-red-400 text-sm px-3 py-2 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-[#0d0d1a] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors"
              placeholder="Enter username"
              autoComplete="username"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#0d0d1a] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors"
              placeholder="Enter password"
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            className="flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-semibold py-2.5 rounded-lg transition-colors"
          >
            <LogIn size={16} />
            Sign In
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-violet-400 hover:text-violet-300 transition-colors"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
