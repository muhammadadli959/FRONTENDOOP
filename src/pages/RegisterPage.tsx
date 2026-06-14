import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Terminal, UserPlus } from "lucide-react";
import * as api from "../api";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (username.trim().length < 3) {
      setError("Username must be at least 3 characters.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    try {
      await api.register(username.trim(), password);
      navigate("/login");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#0a0a14]">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-violet-600 mb-3">
            <Terminal size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Create account</h1>
          <p className="text-gray-500 text-sm mt-1">Join TerminalArt today</p>
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
              placeholder="Choose a username"
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
              placeholder="At least 6 characters"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full bg-[#0d0d1a] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors"
              placeholder="Repeat your password"
              required
            />
          </div>

          <button
            type="submit"
            className="flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-semibold py-2.5 rounded-lg transition-colors"
          >
            <UserPlus size={16} />
            Create Account
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-violet-400 hover:text-violet-300 transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
