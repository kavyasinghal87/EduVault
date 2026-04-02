"use client";

import { Copy, Trash } from "lucide-react";

interface FlashcardPreviewProps {
  front: string;
  back: string;
  onDelete?: () => void;
}

export default function FlashcardPreview({ front, back, onDelete }: FlashcardPreviewProps) {
  return (
    <div className="bg-surface border border-white/5 rounded-2xl p-6 group hover:border-white/10 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 border-r border-white/5 pr-4 mr-4">
          <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Front</h4>
          <p className="whitespace-pre-wrap">{front}</p>
        </div>
        <div className="flex-1">
          <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Back</h4>
          <p className="whitespace-pre-wrap">{back}</p>
        </div>
      </div>
      {onDelete && (
        <div className="flex justify-end pt-4 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onDelete} className="p-2 text-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
            <Trash className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
