"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/AuthContext";
import { User, Shield, LogOut, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

interface UserProfile {
  name: string;
  email: string;
  plan: string;
  created_at: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const fetched = useRef(false);

  useEffect(() => {
    if (authLoading || !user || fetched.current) return;
    fetched.current = true;

    const fetchProfile = async () => {
      const supabase = createClient();

      const { data } = await supabase
        .from("users")
        .select("name, email, plan, created_at")
        .eq("id", user.id)
        .single();
      
      if (data) {
        setProfile(data as UserProfile);
      } else {
        // Fallback if record doesn't exist
        setProfile({
          name: user.user_metadata?.name || "User",
          email: user.email || "",
          plan: "Free",
          created_at: user.created_at || new Date().toISOString()
        });
      }
      setLoading(false);
    };

    fetchProfile();
  }, [user, authLoading]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  if (loading || !profile) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const joinDate = new Date(profile.created_at).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric"
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted">Manage your account preferences and details.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
        {/* Profile Info */}
        <div className="md:col-span-2 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-surface border border-white/5 rounded-3xl p-8"
          >
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-accent" /> Profile Details
            </h2>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-muted mb-1">Full Name</label>
                <div className="w-full px-4 py-3 rounded-xl bg-background border border-white/10 text-foreground">
                  {profile.name}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted mb-1">Email Address</label>
                <div className="w-full px-4 py-3 rounded-xl bg-background border border-white/10 text-foreground flex items-center justify-between">
                  <span>{profile.email}</span>
                  <span className="text-brand-mint flex items-center gap-1 text-xs px-2 py-1 bg-brand-mint/10 rounded-full font-medium">
                     <CheckCircle2 className="w-3 h-3" /> Verified
                  </span>
                </div>
              </div>
              <p className="text-sm text-muted pt-2">Member since {joinDate}</p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-surface border border-white/5 rounded-3xl p-8"
          >
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Shield className="w-5 h-5 text-accent" /> Security
            </h2>
            <p className="text-muted text-sm mb-6">EduVault uses secure authentication via Supabase. You can change your password by initiating a reset flow.</p>
            
            <button className="px-5 py-2.5 bg-background border border-white/10 hover:border-white/20 hover:bg-white/5 rounded-xl text-sm font-medium transition-colors">
              Request Password Reset
            </button>
          </motion.div>
        </div>

        {/* Sidebar panels */}
        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-surface to-background border border-white/5 rounded-3xl p-6 relative overflow-hidden"
          >
             <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 blur-[50px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2" />
             <h3 className="text-lg font-bold mb-1">Current Plan</h3>
             <div className="text-3xl font-bold text-accent mb-4">{profile.plan}</div>
             <p className="text-sm text-muted mb-6">You are currently taking advantage of our free Beta platform features.</p>
             <button disabled className="w-full py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm font-medium opacity-50 cursor-not-allowed">
               Upgrade Plan
             </button>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="bg-surface border border-white/5 rounded-3xl p-6"
          >
             <h3 className="text-lg font-bold mb-4">Account</h3>
             <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/10 rounded-xl text-sm font-medium transition-colors mb-2"
             >
               <LogOut className="w-4 h-4" /> Sign Out
             </button>
             <button className="text-xs text-muted hover:text-foreground underline underline-offset-2 w-full text-center mt-4 transition-colors">
               Delete Account
             </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
