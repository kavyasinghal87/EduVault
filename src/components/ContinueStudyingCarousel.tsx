"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/AuthContext";
import { BookOpen, ChevronRight, Layers, Clock } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface RecentStudySet {
  id: string;
  title: string;
  card_count: number;
  collection_name: string;
  vault_name: string;
  created_at: string;
}

export default function ContinueStudyingCarousel() {
  const { user, loading: authLoading } = useAuth();
  const [sets, setSets] = useState<RecentStudySet[]>([]);
  const [loading, setLoading] = useState(true);
  const fetched = useRef(false);

  useEffect(() => {
    if (authLoading || !user || fetched.current) return;
    fetched.current = true;

    const fetchRecentSets = async () => {
      const supabase = createClient();

      const { data } = await supabase
        .from("study_sets")
        .select(`
          id, title, card_count, created_at,
          collections ( name, vaults ( name ) )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(6);

      if (data) {
        const formattedSets = data.map((set: any) => ({
          id: set.id,
          title: set.title,
          card_count: set.card_count,
          created_at: set.created_at,
          collection_name: set.collections ? set.collections.name : "Unknown",
          vault_name: set.collections?.vaults ? set.collections.vaults.name : "Unknown",
        }));
        setSets(formattedSets);
      }
      setLoading(false);
    };

    fetchRecentSets();
  }, [user, authLoading]);

  if (loading) {
    return (
      <div className="w-full h-48 bg-surface border border-white/5 rounded-2xl animate-pulse flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (sets.length === 0) {
    return null; // Don't show carousel if no sets
  }

  return (
    <div className="mb-10 w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Clock className="w-5 h-5 text-accent" />
          Continue Studying
        </h2>
        <Link
          href="/dashboard/study"
          className="text-sm text-accent hover:text-accent-hover font-medium flex items-center gap-1 transition-colors"
        >
          View All
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide -mx-6 px-6 lg:mx-0 lg:px-0 mt-4">
        {sets.map((set, i) => (
          <motion.div
            key={set.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.07 }}
            className="snap-start shrink-0 w-[280px] sm:w-[320px]"
          >
            <Link
              href={`/dashboard/study/${set.id}`}
              className="block h-full p-5 bg-surface border border-white/5 hover:border-accent/40 rounded-2xl transition-all group relative overflow-hidden flex flex-col"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-accent/10 transition-colors" />
              
              <div className="flex items-start justify-between mb-3 relative z-10">
                <span className="text-xs font-semibold px-2.5 py-1 bg-white/5 rounded-full text-muted flex items-center gap-1.5 border border-white/5">
                  <Layers className="w-3 h-3 text-brand-amber" />
                  {set.card_count} Terms
                </span>
                <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                  <BookOpen className="w-4 h-4 text-accent" />
                </div>
              </div>
              
              <h3 className="font-bold text-lg mb-1 group-hover:text-accent transition-colors relative z-10 line-clamp-1">
                {set.title}
              </h3>
              
              <span className="text-xs text-muted font-medium mb-6 relative z-10 line-clamp-1">
                {set.vault_name} &bull; {set.collection_name}
              </span>

              {/* Quizlet-style Progress Bar (Mocked to 0 for now) */}
              <div className="mt-auto relative z-10">
                <div className="flex justify-between text-xs font-medium mb-1.5">
                  <span className="text-muted">Mastery</span>
                  <span className="text-foreground">0%</span>
                </div>
                <div className="w-full h-1.5 bg-background rounded-full overflow-hidden">
                  <div className="h-full bg-accent w-0 rounded-full" />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
