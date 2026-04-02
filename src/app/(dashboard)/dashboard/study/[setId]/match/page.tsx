"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Loader2, Play, Trophy, RotateCcw, Gamepad2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface MatchCard {
  id: string; // Unique ID for the game piece
  pairId: string; // ID of the original card to identify matches
  text: string;
  type: "front" | "back";
  isMatched: boolean;
}

export default function MatchGamePage() {
  const params = useParams();
  const router = useRouter();
  const setId = params.setId as string;

  const [loading, setLoading] = useState(true);
  const [cards, setCards] = useState<MatchCard[]>([]);
  const [sessionSetTitle, setSessionSetTitle] = useState("Match Game");
  
  const [selectedCards, setSelectedCards] = useState<MatchCard[]>([]);
  const [isWrongMatch, setIsWrongMatch] = useState(false);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [finalTime, setFinalTime] = useState(0);
  const [bestTime, setBestTime] = useState<number | null>(null);

  const initGame = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();

    const { data: setData } = await supabase
      .from("study_sets")
      .select("title")
      .eq("id", setId)
      .single();
      
    if (setData) setSessionSetTitle(setData.title);

    const { data: cardsData } = await supabase
      .from("cards")
      .select("*")
      .eq("set_id", setId);

    if (!cardsData || cardsData.length < 2) {
      setLoading(false);
      return;
    }

    // Select up to 6 random cards
    const shuffledData = [...cardsData].sort(() => 0.5 - Math.random()).slice(0, 6);
    
    // Create match game pieces (fronts and backs)
    const gamePieces: MatchCard[] = [];
    shuffledData.forEach((card) => {
      gamePieces.push({
        id: `front-${card.id}`,
        pairId: card.id,
        text: card.front_content.text,
        type: "front",
        isMatched: false
      });
      gamePieces.push({
        id: `back-${card.id}`,
        pairId: card.id,
        text: card.back_content.text,
        type: "back",
        isMatched: false
      });
    });

    setCards(gamePieces.sort(() => 0.5 - Math.random()));
    
    // Check local storage for best time
    const storedBest = localStorage.getItem(`match_best_${setId}`);
    if (storedBest) {
      setBestTime(parseFloat(storedBest));
    }
    
    setLoading(false);
  }, [setId]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  // Timer logic
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && !isFinished) {
      timer = setInterval(() => {
        setTimeElapsed((prev) => prev + 0.1);
      }, 100);
    }
    return () => clearInterval(timer);
  }, [isPlaying, isFinished]);

  const startGame = () => {
    setTimeElapsed(0);
    setIsFinished(false);
    setSelectedCards([]);
    setIsPlaying(true);
  };

  const handleCardClick = (card: MatchCard) => {
    if (!isPlaying || card.isMatched || selectedCards.find(c => c.id === card.id) || isWrongMatch) return;

    const newSelected = [...selectedCards, card];
    setSelectedCards(newSelected);

    // If we've selected two cards, check for a match
    if (newSelected.length === 2) {
      const [first, second] = newSelected;
      
      if (first.pairId === second.pairId && first.type !== second.type) {
        // Match!
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            (c.pairId === first.pairId) ? { ...c, isMatched: true } : c
          ));
          setSelectedCards([]);
          
          // Check win condition
          setCards(currentCards => {
            const allMatched = currentCards.every(c => 
              (c.pairId === first.pairId) ? true : c.isMatched
            );
            if (allMatched) {
              handleWin();
            }
            return currentCards;
          });
        }, 300);
      } else {
        // No match
        setIsWrongMatch(true);
        setTimeout(() => {
          setSelectedCards([]);
          setIsWrongMatch(false);
        }, 800);
      }
    }
  };

  const handleWin = () => {
    setIsPlaying(false);
    setIsFinished(true);
    setFinalTime(timeElapsed);
    
    if (!bestTime || timeElapsed < bestTime) {
      setBestTime(timeElapsed);
      localStorage.setItem(`match_best_${setId}`, timeElapsed.toString());
    }
  };

  const getCardClasses = (card: MatchCard) => {
    if (card.isMatched) return "opacity-0 pointer-events-none"; // Hide matched cards
    
    const isSelected = selectedCards.find(c => c.id === card.id);
    if (!isSelected) return "bg-surface border-white/5 hover:border-brand-amber/40 hover:-translate-y-1";
    
    if (selectedCards.length === 2) {
      return isWrongMatch 
        ? "bg-red-500/10 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)] animate-shake" 
        : "bg-brand-mint/10 border-brand-mint shadow-[0_0_20px_rgba(61,214,160,0.3)]";
    }
    
    return "bg-brand-amber/10 border-brand-amber shadow-[0_0_20px_rgba(245,166,35,0.3)]";
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
        <p className="text-muted">Loading Match Game...</p>
      </div>
    );
  }

  if (cards.length < 4) { // Less than 2 pairs
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-md mx-auto">
        <h2 className="text-2xl font-bold mb-2">Not enough cards</h2>
        <p className="text-muted mb-8">You need at least 2 cards in this set to play Match.</p>
        <button onClick={() => router.back()} className="px-6 py-3 bg-surface border border-white/10 rounded-xl hover:bg-white/5 transition-colors">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto flex flex-col min-h-[85vh]">
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => router.back()} className="text-muted hover:text-foreground text-sm font-medium flex items-center gap-1.5 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Exit Game
        </button>
        <span className="font-bold text-lg">{sessionSetTitle} - Match</span>
        <div className="font-mono text-xl font-bold w-24 text-right">
          {timeElapsed.toFixed(1)}s
        </div>
      </div>

      {!isPlaying && !isFinished && (
        <div className="flex-1 flex flex-col items-center justify-center">
           <div className="max-w-md text-center bg-surface border border-white/10 rounded-3xl p-10 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-brand-amber/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
             <Gamepad2 className="w-16 h-16 text-brand-amber mx-auto mb-6" />
             <h2 className="text-3xl font-bold mb-4">Ready to Play?</h2>
             <p className="text-muted mb-8 text-lg">Make everything disappear! Drag corresponding items onto each other to make them disappear.</p>
             <button 
               onClick={startGame}
               className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-brand-amber hover:bg-brand-amber/90 text-white rounded-xl font-bold text-lg shadow-[0_0_20px_rgba(245,166,35,0.4)] transition-all hover:scale-105"
             >
               <Play className="w-5 h-5 fill-current" />
               Start Game
             </button>
           </div>
        </div>
      )}

      {isFinished && (
        <div className="flex-1 flex flex-col items-center justify-center">
           <motion.div 
             initial={{ scale: 0.9, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             className="max-w-md w-full text-center bg-surface border border-brand-amber/20 rounded-3xl p-10 shadow-[0_0_40px_rgba(245,166,35,0.1)] relative overflow-hidden"
           >
             <Trophy className="w-20 h-20 text-brand-amber mx-auto mb-6 drop-shadow-lg" />
             <h2 className="text-4xl font-bold mb-2">You won!</h2>
             <p className="text-6xl font-black text-brand-amber font-mono my-6 drop-shadow-md">
               {finalTime.toFixed(1)}s
             </p>
             {bestTime && bestTime === finalTime && (
                <div className="inline-block px-4 py-1.5 bg-brand-amber/20 text-brand-amber font-bold rounded-full mb-8 animate-pulse text-sm uppercase tracking-wider">
                  New Best Time!
                </div>
             )}
             <div className="flex gap-4">
               <button 
                 onClick={() => { initGame(); startGame(); }}
                 className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-surface border border-white/10 rounded-xl font-bold hover:bg-white/5 transition-all"
               >
                 <RotateCcw className="w-5 h-5" /> Play Again
               </button>
               <Link 
                 href={`/dashboard/vaults/${params.id}`}
                 className="flex-1 flex items-center justify-center px-6 py-4 bg-brand-amber hover:bg-brand-amber/90 text-white rounded-xl font-bold shadow-lg shadow-brand-amber/20 transition-all"
               >
                 Done
               </Link>
             </div>
           </motion.div>
        </div>
      )}

      {isPlaying && (
        <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-fr">
          <AnimatePresence>
            {cards.map((card) => (
              <motion.button
                key={card.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: card.isMatched ? 0 : 1, scale: card.isMatched ? 0.8 : 1 }}
                onClick={() => handleCardClick(card)}
                className={`p-6 rounded-2xl border text-left overflow-y-auto flex items-center justify-center transition-all duration-300 min-h-[160px] ${getCardClasses(card)}`}
                disabled={card.isMatched || isWrongMatch || (selectedCards.length === 2 && !selectedCards.find(c => c.id === card.id))}
              >
                <div className="text-xl font-medium w-full text-center text-balance overflow-hidden pointer-events-none break-words">
                  {card.text}
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
