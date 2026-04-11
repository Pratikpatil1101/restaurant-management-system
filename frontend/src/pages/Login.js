import { motion } from "framer-motion";
import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import { Button } from "../components/UI";
import { useAuth } from "../context/AuthContext";
import { authApi, getApiErrorMessage } from "../services/api";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await authApi.login({ email, password });
      login({ token: response.data.token, user: response.data.user });
      toast.success(`Welcome back, ${response.data.user.name}`);
      navigate("/dashboard");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Login failed"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-app px-4 py-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[10%] top-[14%] h-56 w-56 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute bottom-[10%] right-[10%] h-72 w-72 rounded-full bg-fuchsia-500/10 blur-3xl" />
      </div>
      <div className="relative grid w-full max-w-6xl gap-6 lg:grid-cols-[1.08fr_0.92fr]">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="glass-panel hidden rounded-[36px] p-8 lg:block xl:p-12">
          <p className="text-xs uppercase tracking-[0.45em] text-cyan-300">Restaurant OS</p>
          <h1 className="mt-4 text-4xl font-semibold text-white">Smart system to manage your restaurant</h1>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {[
              "Real-time order tracking",
              "Easy menu management",
              "Staff role-based access",
              "Clean and user-friendly design"
            ].map((item) => (
              <div key={item} className="rounded-3xl border border-white/10 bg-white/5 p-5 text-sm text-slate-300">{item}</div>
            ))}
          </div>
        </motion.div>
        <motion.form initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleSubmit} className="glass-panel rounded-[36px] p-6 md:p-8 xl:p-10">
          <p className="text-xs uppercase tracking-[0.45em] text-cyan-300">Secure Access</p>
          <h2 className="mt-3 text-3xl font-semibold text-white">Login to continue</h2>
          <p className="mt-3 text-sm text-slate-400">Use the account you created in the backend.</p>
          <div className="mt-8 space-y-5">
            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Email</span>
              <input className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500" placeholder="manager@restaurant.com" value={email} onChange={(event) => setEmail(event.target.value)} />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Password</span>
              <input type="password" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500" placeholder="Enter your password" value={password} onChange={(event) => setPassword(event.target.value)} />
            </label>
            <Button type="submit" className="w-full py-3" disabled={isSubmitting}>{isSubmitting ? "Signing in..." : "Login"}</Button>
          </div>
        </motion.form>
      </div>
    </div>
  );
}

export default Login;
