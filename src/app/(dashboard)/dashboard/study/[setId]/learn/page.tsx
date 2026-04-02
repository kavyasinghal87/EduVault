"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Loader2, CheckCircle2, XCircle, BrainCircuit, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Card {
  id: string;
  front_content: { text: string };
  back_content: { text: string };
  easiness_factor?: number;
}

interface Question {
  card_id: string;
  prompt: string; // The front
  correctAnswer: string; // The back
  options: string[]; // Options
}

export default function LearnModePage() {
  const params = useParams();
  const router = useRouter();
  const setId = params.setId as string;

  const [loading, setLoading] = useState(true);
  const [sessionSetTitle, setSessionSetTitle] = useState("Learn Mode");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  
  // Stats
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  
  const initLearnMode = useCallback(async () => {
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

    if (!cardsData || cardsData.length < 4) {
      setLoading(false);
      return;
    }

    // Prepare questions
    // Select cards randomly or by lowest easiness_factor (simplified for MVP: all cards shuffled)
    const shuffledCards: Card[] = [...cardsData].sort(() => 0.5 - Math.random());
    
    const qs: Question[] = shuffledCards.map(targetCard => {
      // Pick 3 random distractors
      const distractors = shuffledCards
        .filter(c => c.id !== targetCard.id)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3)
        .map(c => c.back_content.text);
        
      const options = [...distractors, targetCard.back_content.text].sort(() => 0.5 - Math.random());
      
      return {
        card_id: targetCard.id,
        prompt: targetCard.front_content.text,
        correctAnswer: targetCard.back_content.text,
        options,
      };
    });

    setQuestions(qs);
    setLoading(false);
    setCurrentIndex(0);
    setCorrectCount(0);
    setIncorrectCount(0);
    setSelectedAnswer(null);
    setIsFinished(false);
  }, [setId]);

  useEffect(() => {
    initLearnMode();
  }, [initLearnMode]);

  const handleAnswer = (option: string) => {
    if (selectedAnswer !== null) return; // Prevent multiple clicks
    
    setSelectedAnswer(option);
    
    const isCorrect = option === questions[currentIndex].correctAnswer;
    if (isCorrect) setCorrectCount(prev => prev + 1);
    else setIncorrectCount(prev => prev + 1);
    
    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setSelectedAnswer(null);
      } else {
        setIsFinished(true);
      }
    }, 1200);
  };

  const getOptionClasses = (option: string) => {
    if (selectedAnswer === null) return "bg-surface border-white/5 hover:bg-white/5 hover:border-brand-mint/40";
    
    const currentQ = questions[currentIndex];
    
    if (option === currentQ.correctAnswer) {
      return "bg-brand-mint/10 border-brand-mint text-brand-mint shadow-[0_0_20px_rgba(61,214,160,0.2)]";
    }
    
    if (option === selectedAnswer && option !== currentQ.correctAnswer) {
      return "bg-red-500/10 border-red-500 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)]";
    }
    
    return "bg-surface border-white/5 opacity-50";
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
        <p className="text-muted">Preparing learning materials...</p>
      </div>
    );
  }

  if (questions.length < 4) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-md mx-auto">
        <BrainCircuit className="w-16 h-16 text-brand-mint mx-auto mb-6 opacity-50" />
        <h2 className="text-2xl font-bold mb-2">Not enough cards</h2>
        <p className="text-muted mb-8">Learn mode requires at least 4 term-definition pairs to generate multiple choice questions. Please add more cards to this set.</p>
        <button onClick={() => router.back()} className="px-6 py-3 bg-surface border border-white/10 rounded-xl hover:bg-white/5 transition-colors">
          Go Back
        </button>
      </div>
    );
  }

  if (isFinished) {
    const accuracy = Math.round((correctCount / questions.length) * 100);

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
        
        <h2 className="text-3xl font-bold mb-3">Learn Session Complete!</h2>
        <p className="text-muted text-lg mb-10">You&apos;ve completed this learn session for {sessionSetTitle}.</p>

        <div className="grid grid-cols-3 gap-4 w-full mb-10">
          <div className="bg-surface border border-white/5 rounded-2xl p-6">
            <TrendingUp className="w-6 h-6 text-brand-mint mb-3 mx-auto" />
            <p className="text-3xl font-bold mb-1">{accuracy}%</p>
            <p className="text-sm text-muted">Accuracy</p>
          </div>
          <div className="bg-surface border border-white/5 rounded-2xl p-6">
            <CheckCircle2 className="w-6 h-6 text-brand-mint mb-3 mx-auto" />
            <p className="text-3xl font-bold mb-1 text-brand-mint">{correctCount}</p>
            <p className="text-sm text-muted">Correct</p>
          </div>
          <div className="bg-surface border border-red-500/10 rounded-2xl p-6">
            <XCircle className="w-6 h-6 text-red-500 mb-3 mx-auto" />
            <p className="text-3xl font-bold mb-1 text-red-500">{incorrectCount}</p>
            <p className="text-sm text-muted">Incorrect</p>
          </div>
        </div>

        <div className="flex gap-4 w-full">
          <button 
            onClick={initLearnMode}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-surface border border-white/10 rounded-xl font-semibold hover:bg-white/5 transition-colors"
          >
             Study Again
          </button>
          <button 
            onClick={() => router.back()}
            className="flex-1 px-6 py-4 bg-brand-mint hover:bg-brand-mint/90 text-background rounded-xl font-semibold shadow-[0_0_20px_rgba(61,214,160,0.3)] transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const progressPercentage = ((currentIndex) / questions.length) * 100;

  return (
    <div className="max-w-4xl mx-auto flex flex-col min-h-[85vh]">
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => router.back()} className="text-muted hover:text-foreground text-sm font-medium flex items-center gap-1.5 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Exit Learn
        </button>
        <span className="font-bold text-lg">{sessionSetTitle} - Learn</span>
        <span className="text-sm text-muted font-mono">{currentIndex + 1} / {questions.length}</span>
      </div>

      <div className="w-full bg-surface border border-white/5 rounded-full h-2 mb-12 overflow-hidden flex">
        <motion.div 
          className="bg-brand-mint h-full rounded-r-full"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-3xl"
          >
            <div className="mb-10 p-10 sm:p-14 bg-surface border border-brand-mint/20 rounded-3xl shadow-[0_0_30px_rgba(61,214,160,0.05)] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-mint/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                <span className="text-xs uppercase tracking-widest text-muted font-bold absolute top-6">Term</span>
                <h3 className="text-3xl sm:text-4xl leading-relaxed text-balance font-medium mt-2 relative z-10">
                  {currentQ.prompt}
                </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {currentQ.options.map((option, i) => (
                <button
                  key={`${currentIndex}-opt-${i}`}
                  onClick={() => handleAnswer(option)}
                  disabled={selectedAnswer !== null}
                  className={`p-6 text-left rounded-2xl border transition-all duration-200 text-lg ${getOptionClasses(option)}`}
                >
                  <div className="flex items-start gap-4">
                    <span className="w-8 h-8 rounded-full bg-black/20 flex items-center justify-center shrink-0 font-mono text-sm opacity-50">
                      {i + 1}
                    </span>
                    <span className="flex-1 mt-0.5">{option}</span>
                  </div>
                </button>
              ))}
            </div>
            
            {/* Feedback message */}
            <div className="h-16 mt-6 flex items-center justify-center text-lg font-medium">
               <AnimatePresence>
                 {selectedAnswer && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={selectedAnswer === currentQ.correctAnswer ? "text-brand-mint" : "text-red-500"}
                    >
                      {selectedAnswer === currentQ.correctAnswer ? "Correct!" : "Incorrect. Moving to next..."}
                    </motion.div>
                 )}
               </AnimatePresence>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
