"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/AuthContext";
import { BookOpen, Layers, Info } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface StudySetWithDetails {
  id: string;
  title: string;
  description: string | null;
  card_count: number;
  vault_name: string;
  collection_name: string;
}

export default function GlobalStudyPage() {
  const { user, loading: authLoading } = useAuth();
  const [sets, setSets] = useState<StudySetWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const fetched = useRef(false);

  useEffect(() => {
    if (authLoading || !user || fetched.current) return;
    fetched.current = true;

    const fetchStudySets = async () => {
      const supabase = createClient();

      // Fetch all sets for the user, joined with their collections and vaults
      const { data } = await supabase
        .from("study_sets")
        .select(`
          id, title, description, card_count,
          collections ( name, vaults ( name ) )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (data) {
        const formattedSets = data.map((set: any) => ({
          id: set.id,
          title: set.title,
          description: set.description,
          card_count: set.card_count,
          collection_name: set.collections ? set.collections.name : "Unknown",
          vault_name: set.collections?.vaults ? set.collections.vaults.name : "Unknown",
        }));
        setSets(formattedSets);
      }
      setLoading(false);
    };

    fetchStudySets();
  }, [user, authLoading]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Study Center</h1>
        <p className="text-muted">Pick a study set to jump right back into learning.</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : sets.length === 0 ? (
        <div className="bg-surface border border-white/5 rounded-2xl p-16 text-center max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-accent" />
          </div>
          <h3 className="text-xl font-bold mb-2">No study sets yet</h3>
          <p className="text-muted mb-6">Create a vault and add functional study sets before you can review flashcards.</p>
          <Link
            href="/dashboard/vaults"
            className="inline-flex items-center gap-2 px-6 py-3 bg-surface border border-white/10 hover:bg-white/5 text-foreground rounded-xl font-medium transition-all"
          >
            Go to My Vaults
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sets.map((set) => (
            <motion.div key={set.id} whileHover={{ y: -3 }}>
              <div
                className="block h-full p-6 bg-surface border border-white/5 rounded-2xl transition-all group relative flex flex-col"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-xl bg-brand-mint/10 border border-brand-mint/20 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-brand-mint group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 bg-white/5 rounded-full text-muted flex items-center gap-1.5">
                    <Layers className="w-3 h-3" />
                    {set.card_count} Cards
                  </span>
                </div>
                
                <h3 className="text-xl font-bold mb-1 group-hover:text-brand-mint transition-colors">{set.title}</h3>
                <p className="text-sm text-muted mb-4 line-clamp-2">{set.description || "No description provided."}</p>
                
                <div className="mt-auto mb-6 text-xs text-muted font-medium bg-background px-3 py-2 rounded-lg border border-white/5 flex items-center gap-2">
                  <Info className="w-4 h-4 text-accent" />
                  <span>{set.vault_name} → {set.collection_name}</span>
                </div>

                <Link 
                  href={`/dashboard/study/${set.id}`}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-accent/10 hover:bg-accent text-accent hover:text-white rounded-xl font-semibold transition-colors"
                >
                  Start Session
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
