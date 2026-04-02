"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import { useVaultStore } from "@/stores/vaultStore";
import { useRouter } from "next/navigation";

interface CreateVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateVaultModal({ isOpen, onClose }: CreateVaultModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [examType, setExamType] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const createVault = useVaultStore((state) => state.createVault);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    
    try {
      const result = await createVault({
        name,
        description,
        exam_type: examType || null,
        is_public: isPublic
      });

      if (result && !result.error && result.data) {
        onClose();
        router.push(`/dashboard/vaults/${result.data.id}`);
      } else if (result?.error) {
        setErrorMsg(result.error.message || "Failed to create vault.");
      } else {
        setErrorMsg("An unexpected error occurred.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
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
              <h2 className="text-xl font-bold">Create New Vault</h2>
              <button onClick={onClose} className="text-muted hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm">
                  {errorMsg}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Vault Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Biology 101"
                  className="w-full px-4 py-2.5 rounded-xl bg-background border border-white/10 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Description (Optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What is this vault for?"
                  className="w-full px-4 py-2.5 rounded-xl bg-background border border-white/10 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all min-h-[80px]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Exam Type (Optional)</label>
                <input
                  type="text"
                  value={examType}
                  onChange={(e) => setExamType(e.target.value)}
                  placeholder="e.g., SAT, MCAT, Final Exams"
                  className="w-full px-4 py-2.5 rounded-xl bg-background border border-white/10 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all"
                />
              </div>
              
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="w-4 h-4 rounded border-white/10 text-accent focus:ring-accent accent-accent"
                />
                <label htmlFor="isPublic" className="text-sm text-foreground">Make this vault public</label>
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
                  Create Vault
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
