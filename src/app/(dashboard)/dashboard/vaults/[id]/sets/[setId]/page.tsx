"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { BookOpen, Layers, Plus, ArrowLeft, Trash2, BrainCircuit, Gamepad2 } from "lucide-react";
import { useVaultStore } from "@/stores/vaultStore";
import Link from "next/link";
import CardEditor from "@/components/CardEditor";
import FlashcardPreview from "@/components/FlashcardPreview";

// Fetch type wrapper
interface SetDetails {
  id: string;
  title: string;
  description: string;
  vault_id: string;
}

export default function StudySetPage() {
  const params = useParams();
  const router = useRouter();
  const setId = params.setId as string;
  const vaultId = params.id as string;
  
  const [studySet, setStudySet] = useState<SetDetails | null>(null);
  const { deleteStudySet } = useVaultStore();
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const supabase = createClient();
    
    const { data: setDetails } = await supabase
      .from("study_sets")
      .select("*")
      .eq("id", setId)
      .single();
      
    if (setDetails) {
      setStudySet(setDetails);
    }

    const { data: cardsData } = await supabase
      .from("cards")
      .select("*")
      .eq("set_id", setId)
      .order("created_at", { ascending: true });
      
    setCards(cardsData || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [setId]);

  const handleDeleteCard = async (cardId: string) => {
    const supabase = createClient();
    await supabase.from("cards").delete().eq("id", cardId);
    fetchData();
  };

  const handleDeleteSet = async () => {
    if (confirm("Are you sure you want to delete this study set? All cards will be lost.")) {
      const success = await deleteStudySet(setId);
      if (success) {
        router.push(`/dashboard/vaults/${vaultId}`);
      }
    }
  };

  if (loading || !studySet) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link href={`/dashboard/vaults/${vaultId}`} className="text-sm font-medium text-muted hover:text-foreground flex items-center gap-1 w-fit">
        <ArrowLeft className="w-4 h-4" /> Back to Vault
      </Link>
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">{studySet.title}</h1>
          <p className="text-muted">{studySet.description || "No description."}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleDeleteSet}
            className="flex items-center justify-center p-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-xl transition-all"
            title="Delete Study Set"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Study Modes Grid */}
      <div className="mt-8 mb-10">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
           <BookOpen className="w-5 h-5 text-accent" />
           Study Modes
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href={`/dashboard/study/${setId}`} className="flex flex-col p-6 bg-surface border border-white/5 hover:border-accent/40 rounded-2xl transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-accent/10 transition-colors" />
            <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform relative z-10">
               <Layers className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-xl font-bold mb-1 group-hover:text-accent transition-colors relative z-10">Flashcards</h3>
            <p className="text-sm text-muted relative z-10">Review terms and definitions at your own pace.</p>
          </Link>

          <Link href={`/dashboard/study/${setId}/learn`} className="flex flex-col p-6 bg-surface border border-white/5 hover:border-brand-mint/40 rounded-2xl transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-mint/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-brand-mint/10 transition-colors" />
            <div className="w-12 h-12 bg-brand-mint/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform relative z-10">
               <BrainCircuit className="w-6 h-6 text-brand-mint" />
            </div>
            <h3 className="text-xl font-bold mb-1 group-hover:text-brand-mint transition-colors relative z-10">Learn</h3>
            <p className="text-sm text-muted relative z-10">Test your knowledge with multiple choice questions.</p>
          </Link>

          <Link href={`/dashboard/study/${setId}/match`} className="flex flex-col p-6 bg-surface border border-white/5 hover:border-brand-amber/40 rounded-2xl transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-amber/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-brand-amber/10 transition-colors" />
            <div className="w-12 h-12 bg-brand-amber/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform relative z-10">
               <Gamepad2 className="w-6 h-6 text-brand-amber" />
            </div>
            <h3 className="text-xl font-bold mb-1 group-hover:text-brand-amber transition-colors relative z-10">Match Game</h3>
            <p className="text-sm text-muted relative z-10">Race against the clock to match terms and definitions.</p>
          </Link>
        </div>
      </div>

      <div className="flex items-center justify-between mt-10 mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Layers className="w-5 h-5 text-accent" />
          Terms in this set ({cards.length})
        </h2>
        {!showEditor && (
          <button
            onClick={() => setShowEditor(true)}
            className="flex items-center gap-1.5 text-sm font-semibold text-foreground bg-surface border border-white/5 hover:bg-white/5 px-4 py-2 rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Card
          </button>
        )}
      </div>

      <div className="space-y-4">
        {showEditor && (
          <CardEditor
            setId={setId}
            onCardAdded={() => {
              setShowEditor(false);
              fetchData();
            }}
            onCancel={() => setShowEditor(false)}
          />
        )}
        
        {cards.length === 0 && !showEditor ? (
           <div className="text-center p-12 bg-surface/50 border border-white/5 rounded-2xl border-dashed">
            <p className="text-muted mb-4">No cards in this set yet. Start adding terms and definitions.</p>
            <button
              onClick={() => setShowEditor(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent/10 text-accent font-semibold rounded-xl hover:bg-accent/20 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add First Card
            </button>
          </div>
        ) : (
          cards.map(card => (
            <FlashcardPreview
              key={card.id}
              front={card.front_content.text}
              back={card.back_content.text}
              onDelete={() => handleDeleteCard(card.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
