"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import { useVaultStore } from "@/stores/vaultStore";

interface CreateStudySetModalProps {
  isOpen: boolean;
  onClose: () => void;
  collectionId: string;
}

export default function CreateStudySetModal({ isOpen, onClose, collectionId }: CreateStudySetModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(false);
  
  const createStudySet = useVaultStore((state) => state.createStudySet);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    await createStudySet({
      collection_id: collectionId,
      title,
      description,
      card_count: 0
    });

    setLoading(false);
    onClose();
    setTitle("");
    setDescription("");
    setTags("");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md bg-surface border border-white/10 rounded-2xl shadow-2xl overflow-hidden relative"
          >
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h2 className="text-xl font-bold">New Study Set</h2>
              <button onClick={onClose} className="text-muted hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Set Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Cellular Respiration"
                  className="w-full px-4 py-2.5 rounded-xl bg-background border border-white/10 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Description (Optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What topics does this set cover?"
                  className="w-full px-4 py-2.5 rounded-xl bg-background border border-white/10 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all min-h-[80px]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl font-medium hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-xl font-medium transition-all shadow-[0_0_20px_rgba(108,99,255,0.3)]"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Create Study Set
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
