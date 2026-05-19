import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { BarChart3, Mail, Lock, AlertCircle, LogIn } from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!email || !password) {
      setErr("Email and password are required");
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      nav("/", { replace: true });
    } catch (e: any) {
      setErr(e.response?.data?.error || e.message || "Login failed");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8">
          <div className="text-center mb-8">
            <div className="bg-blue-600 p-3 rounded-full w-fit mx-auto mb-4">
              <BarChart3 className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
            <p className="text-slate-600 mt-1">
              Sign in to your Cloud Cost Intelligence workspace
            </p>
          </div>

          <form onSubmit={submit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  className="w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter your email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  className="w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter your password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {err && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                <AlertCircle className="h-4 w-4" />
                {err}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white rounded-lg px-4 py-3 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              ) : (
                <LogIn className="h-4 w-4" />
              )}
              {loading ? "Signing in..." : "Sign in"}
            </button>

            <div className="text-center">
              <p className="text-sm text-slate-600">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
