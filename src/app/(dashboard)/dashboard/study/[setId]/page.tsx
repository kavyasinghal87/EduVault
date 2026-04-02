"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Loader2, RotateCcw, CheckCircle2, TrendingUp, Presentation } from "lucide-react";
import Link from "next/link";
import { useStudyStore } from "@/stores/studyStore";
import { calculateSM2 } from "@/lib/sm2";
import { motion, AnimatePresence } from "framer-motion";

export default function StudySessionPage() {
  const params = useParams();
  const router = useRouter();
  const setId = params.setId as string;

  const { cards, currentIndex, isFlipped, isFinished, stats, startSession, flipCard, nextCard, resetSession } = useStudyStore();
  const [loading, setLoading] = useState(true);
  const [sessionSetTitle, setSessionSetTitle] = useState("Study Session");

  useEffect(() => {
    const initSession = async () => {
      setLoading(true);
      const supabase = createClient();

      const { data: setData } = await supabase
        .from("study_sets")
        .select("title, vault_id")
        .eq("id", setId)
        .single();
        
      if (setData) setSessionSetTitle(setData.title);

      const { data: cardsData } = await supabase
        .from("cards")
        .select("*")
        .eq("set_id", setId);

      // In a real app we would filter cards due for review:
      // .lte('next_review_at', new Date().toISOString())
      // For MVP, just study everything or randomly shuffle
      
      const shuffled = (cardsData || []).sort(() => 0.5 - Math.random());
      
      startSession(shuffled);
      setLoading(false);
    };

    initSession();
    
    return () => resetSession();
  }, [setId, startSession, resetSession]);

  const handleRate = async (rating: number) => {
    const { cardToUpdate, isFinished } = nextCard(rating);
    
    // Calculate new SM-2 values
    const sm2Result = calculateSM2(
      rating,
      cardToUpdate.easiness_factor || 2.5,
      cardToUpdate.interval || 0,
      cardToUpdate.repetitions || 0
    );

    // Update in database (optimistic UI is fine here since user is moving to next card)
    const supabase = createClient();
    await supabase.from("cards").update({
      easiness_factor: sm2Result.easiness_factor,
      interval: sm2Result.interval,
      repetitions: sm2Result.repetitions,
      next_review_at: sm2Result.next_review_at
    }).eq("id", cardToUpdate.id);

    if (isFinished) {
      // Could trigger a streak update or session summary save here
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
        <p className="text-muted">Preparing your study session...</p>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-md mx-auto">
        <Presentation className="w-16 h-16 text-muted mb-6" />
        <h2 className="text-2xl font-bold mb-2">No cards found</h2>
        <p className="text-muted mb-8">This study set doesn&apos;t have any cards yet, or none are due for review.</p>
        <button onClick={() => router.back()} className="px-6 py-3 bg-surface border border-white/10 rounded-xl hover:bg-white/5 transition-colors">
          Go Back
        </button>
      </div>
    );
  }

  if (isFinished) {
    const accuracy = stats.totalStudied > 0 
      ? Math.round((stats.correctCount / stats.totalStudied) * 100) 
      : 0;

    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center max-w-lg mx-auto py-12">
        <motion.div 
          initial={{ scale: 0 }} 
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="w-24 h-24 rounded-full bg-brand-mint/10 border border-brand-mint/20 flex items-center justify-center mb-8"
        >
          <CheckCircle2 className="w-12 h-12 text-brand-mint" />
        </motion.div>
        
        <h2 className="text-3xl font-bold mb-3">Session Complete!</h2>
        <p className="text-muted text-lg mb-10">Great job. You&apos;ve finished studying {stats.totalStudied} cards.</p>

        <div className="grid grid-cols-2 gap-4 w-full mb-10">
          <div className="bg-surface border border-white/5 rounded-2xl p-6">
            <TrendingUp className="w-6 h-6 text-accent mb-3 mx-auto" />
            <p className="text-3xl font-bold mb-1">{accuracy}%</p>
            <p className="text-sm text-muted">Accuracy</p>
          </div>
          <div className="bg-surface border border-white/5 rounded-2xl p-6">
            <CheckCircle2 className="w-6 h-6 text-brand-mint mb-3 mx-auto" />
            <p className="text-3xl font-bold mb-1">{stats.correctCount}</p>
            <p className="text-sm text-muted">Recalled</p>
          </div>
        </div>

        <div className="flex gap-4 w-full">
          <button 
            onClick={resetSession}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-surface border border-white/10 rounded-xl font-semibold hover:bg-white/5 transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
            Study Again
          </button>
          <button 
            onClick={() => router.back()}
            className="flex-1 px-6 py-4 bg-accent hover:bg-accent-hover text-white rounded-xl font-semibold shadow-[0_0_20px_rgba(108,99,255,0.3)] transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  const currentCard = cards[currentIndex];
  // Calculate progress safely
  const progressPercentage = cards.length > 0 ? ((currentIndex) / cards.length) * 100 : 0;

  return (
    <div className="max-w-3xl mx-auto flex flex-col min-h-[80vh]">
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => router.back()} className="text-muted hover:text-foreground text-sm font-medium flex items-center gap-1.5 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Exit
        </button>
        <span className="font-semibold">{sessionSetTitle}</span>
        <span className="text-sm text-muted font-mono">{currentIndex + 1} / {cards.length}</span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-surface border border-white/5 rounded-full h-2 mb-12 overflow-hidden">
        <motion.div 
          className="bg-accent h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Card Area */}
      <div className="flex-1 flex flex-col items-center justify-center mb-12 relative [perspective:1000px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentCard.id + (isFlipped ? "-back" : "-front")}
            initial={{ rotateX: 90, opacity: 0 }}
            animate={{ rotateX: 0, opacity: 1 }}
            exit={{ rotateX: -90, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            onClick={() => !isFlipped && flipCard()}
            className={`w-full aspect-[4/3] sm:aspect-video max-w-2xl rounded-3xl p-8 sm:p-12 flex flex-col items-center justify-center text-center cursor-pointer relative shadow-2xl border ${
              isFlipped 
                ? "bg-surface border-accent/30 shadow-[0_0_40px_rgba(108,99,255,0.1)]" 
                : "bg-surface border-white/10 hover:border-white/20"
            }`}
          >
            {!isFlipped ? (
               <div className="space-y-6 flex flex-col items-center justify-center flex-1">
                 <span className="text-xs uppercase tracking-widest text-muted font-bold absolute top-6">Question</span>
                 <h3 className="text-2xl sm:text-4xl text-balance leading-relaxed font-medium">
                   {currentCard.front_content.text}
                 </h3>
                 <p className="text-muted text-sm absolute bottom-6 opacity-50">Click to reveal answer</p>
               </div>
            ) : (
                <div className="space-y-6 flex flex-col items-center justify-center flex-1 w-full">
                 <span className="text-xs uppercase tracking-widest text-accent font-bold absolute top-6">Answer</span>
                 <p className="text-xl sm:text-2xl text-balance leading-relaxed text-foreground/90 whitespace-pre-wrap px-4 overflow-y-auto max-h-[60%] w-full">
                   {currentCard.back_content.text}
                 </p>
               </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Rating Controls */}
      <div className="h-24">
        <AnimatePresence>
          {isFlipped && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-center gap-2 sm:gap-4 flex-wrap"
            >
              {[
                { label: "Again", rating: 1, color: "bg-red-500/10 text-red-400 hover:bg-red-500/20 border-red-500/20" },
                { label: "Hard", rating: 3, color: "bg-brand-amber/10 text-brand-amber hover:bg-brand-amber/20 border-brand-amber/20" },
                { label: "Good", rating: 4, color: "bg-accent/10 text-accent hover:bg-accent/20 border-accent/20" },
                { label: "Easy", rating: 5, color: "bg-brand-mint/10 text-brand-mint hover:bg-brand-mint/20 border-brand-mint/20" },
              ].map((btn) => (
                <button
                  key={btn.label}
                  onClick={() => handleRate(btn.rating)}
                  className={`px-4 sm:px-8 py-3 rounded-xl border font-semibold transition-all ${btn.color} focus:outline-none focus:ring-2 focus:ring-accent/50`}
                >
                  {btn.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
