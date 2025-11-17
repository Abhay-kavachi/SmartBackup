import { Link } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      login(data.token, data.user);
    } catch (err) {
      setError("Invalid credentials");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary">
      <motion.form
        className="bg-[#161b22] p-10 rounded-2xl max-w-md w-full shadow-xl space-y-6"
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl font-bold text-center text-primary">SmartBackup OS</h1>
        <p className="text-center text-gray-400">Log in to manage your backups</p>
        {error && <p className="text-red-400 text-center">{error}</p>}
        <div className="space-y-4">
          <input
            type="email"
            className="w-full rounded-lg bg-[#0d1117] px-4 py-3 focus:ring-2 focus:ring-primary outline-none"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            className="w-full rounded-lg bg-[#0d1117] px-4 py-3 focus:ring-2 focus:ring-primary outline-none"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-primary hover:bg-blue-600 transition text-white font-semibold py-3 rounded-lg disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
        <p className="text-center text-gray-400">
          No account?{" "}
          <Link className="text-primary font-semibold" to="/register">
            Register
          </Link>
        </p>
      </motion.form>
    </div>
  );
};

export default LoginPage;

