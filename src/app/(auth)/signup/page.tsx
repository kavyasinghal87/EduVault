"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    const supabase = createClient();

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // If user was created and session exists, they can proceed directly
    if (data.session) {
      // Insert into public.users table
      await supabase.from("users").upsert({
        id: data.user!.id,
        email: email,
        name: name,
      });
      router.push("/dashboard");
      router.refresh();
    } else {
      // Email confirmation required
      setSuccess(true);
    }

    setLoading(false);
  };

  const handleGoogleAuth = async () => {
    setError("");
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 60 }}
        className="w-full max-w-md bg-surface border border-white/5 rounded-2xl p-8 shadow-2xl relative z-10 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-16 h-16 rounded-full bg-brand-mint/10 border border-brand-mint/20 flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle2 className="w-8 h-8 text-brand-mint" />
        </motion.div>
        <h2 className="text-2xl font-bold mb-3">Check Your Email</h2>
        <p className="text-muted mb-6 leading-relaxed">
          We&apos;ve sent a confirmation link to{" "}
          <span className="text-foreground font-medium">{email}</span>. Click
          the link to activate your Vault.
        </p>
        <Link
          href="/login"
          className="text-accent hover:text-accent-hover font-medium transition-colors text-sm"
        >
          Back to Sign In
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, type: "spring", stiffness: 60 }}
      className="w-full max-w-md bg-surface border border-white/5 rounded-2xl p-8 shadow-2xl relative z-10"
    >
      <div className="flex justify-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-14 h-14 rounded-xl bg-accent flex items-center justify-center shadow-[0_0_25px_rgba(108,99,255,0.4)]"
        >
          <Sparkles className="w-7 h-7 text-white" />
        </motion.div>
      </div>

      <h1 className="text-3xl font-bold text-center mb-2">
        Create Your Vault
      </h1>
      <p className="text-muted text-center mb-8">
        Start building your knowledge empire.
      </p>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-3 mb-6 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </motion.div>
      )}

      <form onSubmit={handleSignup} className="space-y-4">
        <div>
          <label
            className="block text-sm font-medium text-foreground mb-1.5"
            htmlFor="name"
          >
            Full Name
          </label>
          <input
            id="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            className="w-full px-4 py-3 rounded-xl bg-background border border-white/10 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all placeholder:text-muted"
          />
        </div>
        <div>
          <label
            className="block text-sm font-medium text-foreground mb-1.5"
            htmlFor="email"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full px-4 py-3 rounded-xl bg-background border border-white/10 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all placeholder:text-muted"
          />
        </div>
        <div>
          <label
            className="block text-sm font-medium text-foreground mb-1.5"
            htmlFor="password"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min. 6 characters"
            className="w-full px-4 py-3 rounded-xl bg-background border border-white/10 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all placeholder:text-muted"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-8 py-3.5 mt-6 text-base font-semibold bg-accent hover:bg-accent-hover disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl transition-all shadow-[0_0_20px_rgba(108,99,255,0.3)] hover:shadow-[0_0_30px_rgba(108,99,255,0.5)]"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Create Account
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>

      <div className="mt-8 mb-6 flex items-center">
        <div className="flex-1 border-t border-white/10"></div>
        <span className="px-4 text-xs uppercase text-muted font-semibold tracking-wider">or</span>
        <div className="flex-1 border-t border-white/10"></div>
      </div>

      <button
        type="button"
        onClick={handleGoogleAuth}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 px-8 py-3.5 text-base font-semibold bg-surface border border-white/10 hover:bg-white/5 disabled:opacity-60 disabled:cursor-not-allowed text-foreground rounded-xl transition-all"
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-1 7.28-2.69l-3.57-2.77c-.99.69-2.26 1.1-3.71 1.1-2.87 0-5.3-1.94-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.11c-.22-.69-.35-1.43-.35-2.11s.13-1.42.35-2.11V7.05H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.95l3.66-2.84z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84c.87-2.6 3.3-4.51 6.16-4.51z" fill="#EA4335"/>
        </svg>
        Continue with Google
      </button>

      <p className="text-center text-sm text-muted mt-8">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-accent hover:text-accent-hover font-medium transition-colors"
        >
          Sign In
        </Link>
      </p>
    </motion.div>
  );
}
