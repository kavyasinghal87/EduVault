"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  FolderOpen,
  Layers,
  Flame,
  Plus,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import ContinueStudyingCarousel from "@/components/ContinueStudyingCarousel";
import StatsCard from "@/components/StatsCard";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/AuthContext";
import { useEffect, useState, useRef } from "react";

interface Vault {
  id: string;
  name: string;
  description: string | null;
  exam_type: string | null;
  created_at: string;
}

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
} as any;

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 120, damping: 18 },
  },
} as any;

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [vaults, setVaults] = useState<Vault[]>([]);
  const [totalCards, setTotalCards] = useState(0);
  const [streak, setStreak] = useState(0);
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);
  const fetched = useRef(false);

  useEffect(() => {
    if (authLoading || !user || fetched.current) return;
    fetched.current = true;

    const fetchData = async () => {
      const supabase = createClient();

      setUserName(user.user_metadata?.name || "User");

      // Fire all queries in parallel instead of sequentially
      const [vaultResult, cardCountResult, profileResult] = await Promise.all([
        supabase
          .from("vaults")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(6),
        supabase
          .from("cards")
          .select("*, study_sets!inner(user_id)", { count: "exact", head: true })
          .eq("study_sets.user_id", user.id),
        supabase
          .from("users")
          .select("streak_count")
          .eq("id", user.id)
          .single(),
      ]);

      setVaults(vaultResult.data || []);
      setTotalCards(cardCountResult.count || 0);
      setStreak(profileResult.data?.streak_count || 0);
      setLoading(false);
    };

    fetchData();
  }, [user, authLoading]);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Welcome Header */}
      <motion.div variants={fadeUp}>
        <h1 className="text-3xl font-bold mb-1">
          {greeting()}, {userName} 👋
        </h1>
        <p className="text-muted">
          Here&apos;s an overview of your knowledge vault.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={fadeUp}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
      >
        <StatsCard
          icon={FolderOpen}
          label="Total Vaults"
          value={vaults.length}
          color="accent"
        />
        <StatsCard
          icon={Layers}
          label="Total Cards"
          value={totalCards}
          color="mint"
        />
        <StatsCard
          icon={Flame}
          label="Day Streak"
          value={streak}
          trend={streak > 0 ? `${streak} days` : undefined}
          color="amber"
        />
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={fadeUp} className="flex gap-3 flex-wrap">
        <Link
          href="/dashboard/vaults"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-xl text-sm font-semibold transition-all hover:scale-105 shadow-[0_0_20px_rgba(108,99,255,0.3)]"
        >
          <Plus className="w-4 h-4" />
          New Vault
        </Link>
        <Link
          href="/dashboard/study"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-surface border border-white/10 hover:bg-raised text-foreground rounded-xl text-sm font-semibold transition-all"
        >
          <BookOpen className="w-4 h-4" />
          Start Studying
        </Link>
      </motion.div>

      {/* Continue Studying Carousel */}
      <motion.div variants={fadeUp}>
        <ContinueStudyingCarousel />
      </motion.div>

      {/* Recent Vaults */}
      <motion.div variants={fadeUp}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Recent Vaults</h2>
          {vaults.length > 0 && (
            <Link
              href="/dashboard/vaults"
              className="text-sm text-accent hover:text-accent-hover font-medium flex items-center gap-1 transition-colors"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        {vaults.length === 0 ? (
          <div className="bg-surface border border-white/5 rounded-2xl p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-4">
              <FolderOpen className="w-8 h-8 text-accent" />
            </div>
            <h3 className="text-lg font-bold mb-2">No Vaults Yet</h3>
            <p className="text-muted text-sm mb-6 max-w-sm mx-auto">
              Create your first vault to start organizing your study materials.
            </p>
            <Link
              href="/dashboard/vaults"
              className="inline-flex items-center gap-2 px-6 py-3 bg-accent hover:bg-accent-hover text-white rounded-xl text-sm font-semibold transition-all shadow-[0_0_20px_rgba(108,99,255,0.3)]"
            >
              <Plus className="w-4 h-4" />
              Create Your First Vault
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {vaults.map((vault) => (
              <motion.div
                key={vault.id}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2 }}
              >
                <Link
                  href={`/dashboard/vaults/${vault.id}`}
                  className="block p-5 bg-surface border border-white/5 hover:border-accent/30 rounded-2xl transition-all group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                      <FolderOpen className="w-5 h-5 text-accent" />
                    </div>
                    {vault.exam_type && (
                      <span className="text-xs font-medium text-brand-amber bg-brand-amber/10 px-2 py-1 rounded-full">
                        {vault.exam_type}
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold mb-1 group-hover:text-accent transition-colors">
                    {vault.name}
                  </h3>
                  <p className="text-sm text-muted line-clamp-2">
                    {vault.description || "No description"}
                  </p>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
