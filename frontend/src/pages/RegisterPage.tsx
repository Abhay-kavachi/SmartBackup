import { Link } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

const RegisterPage = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post("/auth/register", { email, password });
      login(data.token, data.user);
    } catch (err) {
      setError("Registration failed");
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
        <h1 className="text-3xl font-bold text-center text-primary">Create Account</h1>
        <p className="text-center text-gray-400">Secure your files with SmartBackup</p>
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
          <input
            type="password"
            className="w-full rounded-lg bg-[#0d1117] px-4 py-3 focus:ring-2 focus:ring-primary outline-none"
            placeholder="Confirm password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-primary hover:bg-blue-600 transition text-white font-semibold py-3 rounded-lg disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Account"}
        </button>
        <p className="text-center text-gray-400">
          Already registered?{" "}
          <Link className="text-primary font-semibold" to="/login">
            Sign in
          </Link>
        </p>
      </motion.form>
    </div>
  );
};

export default RegisterPage;

