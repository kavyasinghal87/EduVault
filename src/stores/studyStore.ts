import { create } from "zustand";

interface Card {
  id: string;
  front_content: { text: string };
  back_content: { text: string };
  easiness_factor?: number;
  interval?: number;
  repetitions?: number;
  next_review_at?: string;
}

interface StudySessionStats {
  totalStudied: number;
  correctCount: number;
  incorrectCount: number;
}

interface StudyStore {
  cards: Card[];
  currentIndex: number;
  isFlipped: boolean;
  isFinished: boolean;
  stats: StudySessionStats;
  
  startSession: (cards: Card[]) => void;
  flipCard: () => void;
  nextCard: (rating: number) => { cardToUpdate: Card, newIndex: number, isFinished: boolean };
  resetSession: () => void;
}

export const useStudyStore = create<StudyStore>((set, get) => ({
  cards: [],
  currentIndex: 0,
  isFlipped: false,
  isFinished: false,
  stats: {
    totalStudied: 0,
    correctCount: 0,
    incorrectCount: 0,
  },

  startSession: (cardsToStudy) => {
    set({
      cards: cardsToStudy,
      currentIndex: 0,
      isFlipped: false,
      isFinished: cardsToStudy.length === 0,
      stats: { totalStudied: 0, correctCount: 0, incorrectCount: 0 }
    });
  },

  flipCard: () => {
    set({ isFlipped: true });
  },

  nextCard: (rating) => {
    const state = get();
    const currentCard = state.cards[state.currentIndex];
    
    // Update stats
    const isCorrect = rating >= 3;
    const newStats = {
      totalStudied: state.stats.totalStudied + 1,
      correctCount: state.stats.correctCount + (isCorrect ? 1 : 0),
      incorrectCount: state.stats.incorrectCount + (!isCorrect ? 1 : 0),
    };

    const nextIndex = state.currentIndex + 1;
    const finished = nextIndex >= state.cards.length;

    set({
      currentIndex: nextIndex,
      isFlipped: false,
      isFinished: finished,
      stats: newStats
    });

    return { cardToUpdate: currentCard, newIndex: nextIndex, isFinished: finished };
  },

  resetSession: () => {
    set({
      currentIndex: 0,
      isFlipped: false,
      isFinished: get().cards.length === 0,
      stats: { totalStudied: 0, correctCount: 0, incorrectCount: 0 }
    });
  }
}));
