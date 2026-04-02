"use client";

import { useState } from "react";
import { Loader2, Plus, Save, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface CardEditorProps {
  setId: string;
  onCardAdded: () => void;
  onCancel: () => void;
}

export default function CardEditor({ setId, onCardAdded, onCancel }: CardEditorProps) {
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!front.trim() || !back.trim()) return;
    
    setSaving(true);
    const supabase = createClient();
    
    // Add missing SM-2 fields here, so we don't need a strict DB migration right now if we just pass defaults
    // Note: The schema needs updating for these defaults if we select/read them without defaults.
    const { error } = await supabase.from("cards").insert({
      set_id: setId,
      front_content: { text: front },
      back_content: { text: back },
      card_type: "basic"
    });
    
    if (!error) {
      // Also increment card_count in study_sets (using raw SQL/RPC or passing it. Here we just update the client view using onCardAdded)
      onCardAdded();
      setFront("");
      setBack("");
    }
    setSaving(false);
  };

  return (
    <div className="bg-surface border border-white/5 rounded-2xl p-6 relative group">
      <div className="flex gap-4 mb-4">
        <div className="flex-1 space-y-2">
          <label className="text-xs font-semibold text-muted uppercase tracking-wider">Front (Term / Question)</label>
          <textarea
            value={front}
            onChange={(e) => setFront(e.target.value)}
            placeholder="Enter term or question..."
            className="w-full px-4 py-3 min-h-[100px] rounded-xl bg-background border border-white/10 focus:border-accent outline-none"
          />
        </div>
        <div className="flex-1 space-y-2">
          <label className="text-xs font-semibold text-muted uppercase tracking-wider">Back (Definition / Answer)</label>
          <textarea
            value={back}
            onChange={(e) => setBack(e.target.value)}
            placeholder="Enter definition or answer..."
            className="w-full px-4 py-3 min-h-[100px] rounded-xl bg-background border border-white/10 focus:border-accent outline-none"
          />
        </div>
      </div>
      <div className="flex justify-between items-center">
        <button
          onClick={onCancel}
          className="text-xs font-medium text-muted hover:text-foreground flex items-center gap-1 transition-colors"
        >
          <X className="w-4 h-4" /> Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving || !front.trim() || !back.trim()}
          className="px-6 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Add Card
        </button>
      </div>
    </div>
  );
}
