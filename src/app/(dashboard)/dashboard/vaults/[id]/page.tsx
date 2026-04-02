"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { FolderOpen, Plus, Library, Layers, Trash2 } from "lucide-react";
import { useVaultStore } from "@/stores/vaultStore";
import CreateCollectionModal from "@/components/CreateCollectionModal";
import CreateStudySetModal from "@/components/CreateStudySetModal";
import Link from "next/link";
import { motion } from "framer-motion";

export default function VaultDetailPage() {
  const params = useParams();
  const vaultId = params.id as string;
  const router = useRouter();
  const { selectedVault, collections, studySets, fetchVaultDetails, loading, deleteVault, deleteCollection } = useVaultStore();
  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);
  const [isStudySetModalOpen, setIsStudySetModalOpen] = useState(false);
  const [activeCollectionId, setActiveCollectionId] = useState<string | null>(null);

  const handleDeleteVault = async () => {
    if (confirm("Are you sure you want to delete this vault? All data will be lost.")) {
      const success = await deleteVault(vaultId);
      if (success) router.push("/dashboard/vaults");
    }
  };

  const handleDeleteCollection = async (collectionId: string) => {
    if (confirm("Are you sure you want to delete this collection and all its study sets?")) {
      await deleteCollection(collectionId);
      fetchVaultDetails(vaultId);
    }
  };

  useEffect(() => {
    fetchVaultDetails(vaultId);
  }, [vaultId, fetchVaultDetails]);

  if (loading || !selectedVault) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Group study sets by collection
  const setsByCollection = collections.reduce((acc, collection) => {
    acc[collection.id] = studySets.filter(set => set.collection_id === collection.id);
    return acc;
  }, {} as Record<string, typeof studySets>);

  const handleCreateStudySet = (collectionId: string) => {
    setActiveCollectionId(collectionId);
    setIsStudySetModalOpen(true);
  };

  return (
    <div className="space-y-8">
      {/* Vault Header */}
      <div className="p-8 bg-surface border border-white/5 rounded-3xl relative overflow-hidden flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 blur-[80px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 w-full">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-accent/20 rounded-lg">
              <FolderOpen className="w-6 h-6 text-accent" />
            </div>
            {selectedVault.exam_type && (
              <span className="text-xs font-semibold px-2.5 py-1 bg-brand-amber/10 text-brand-amber rounded-full">
                {selectedVault.exam_type}
              </span>
            )}
            {selectedVault.is_public && (
              <span className="text-xs font-semibold px-2.5 py-1 bg-white/10 text-white rounded-full">
                Public
              </span>
            )}
          </div>
          <h1 className="text-4xl font-bold mb-2">{selectedVault.name}</h1>
          <p className="text-muted max-w-2xl text-lg">{selectedVault.description || "No description provided."}</p>
        </div>
        <button
          onClick={handleDeleteVault}
          className="relative z-10 shrink-0 flex items-center justify-center gap-1.5 px-4 py-2 mt-2 md:mt-0 font-medium text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-all"
        >
          <Trash2 className="w-4 h-4" /> Delete Vault
        </button>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Library className="w-6 h-6 text-accent" />
          Collections
        </h2>
        <button
          onClick={() => setIsCollectionModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-surface border border-white/10 hover:bg-white/5 text-foreground rounded-xl text-sm font-semibold transition-all"
        >
          <Plus className="w-4 h-4" />
          New Collection
        </button>
      </div>

      {collections.length === 0 ? (
        <div className="text-center p-12 bg-surface/50 border border-white/5 rounded-2xl border-dashed">
          <p className="text-muted mb-4">This vault is empty. Create a collection to organize your study sets.</p>
          <button
            onClick={() => setIsCollectionModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent-hover transition-colors"
          >
            Create Collection
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {collections.map(collection => (
            <div key={collection.id} className="bg-surface border border-white/5 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: collection.color || '#6C63FF' }} />
                  <h3 className="text-xl font-bold">{collection.name}</h3>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleCreateStudySet(collection.id)}
                    className="flex items-center gap-1.5 text-sm text-muted hover:text-accent font-medium transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Set
                  </button>
                  <button
                    onClick={() => handleDeleteCollection(collection.id)}
                    className="flex items-center gap-1.5 text-sm text-muted hover:text-red-500 font-medium transition-colors ml-4"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {setsByCollection[collection.id]?.map((set) => (
                  <motion.div key={set.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Link
                      href={`/dashboard/vaults/${vaultId}/sets/${set.id}`}
                      className="block h-full p-5 bg-background border border-white/5 hover:border-accent/40 rounded-2xl transition-all group relative overflow-hidden flex flex-col"
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-full blur-xl -translate-y-1/2 translate-x-1/2 group-hover:bg-accent/10 transition-colors" />
                      
                      <div className="flex items-start justify-between mb-3 relative z-10">
                        <span className="text-xs font-semibold px-2.5 py-1 bg-white/5 rounded-full text-muted flex items-center gap-1.5 border border-white/5">
                          <Layers className="w-3 h-3 text-brand-mint" />
                          {set.card_count} Terms
                        </span>
                        <div className="w-7 h-7 rounded-full bg-surface border border-white/10 flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-muted">U</span>
                        </div>
                      </div>
                      
                      <h4 className="font-bold text-lg mb-1 group-hover:text-accent transition-colors relative z-10 line-clamp-1">
                        {set.title}
                      </h4>
                      {set.description && (
                         <p className="text-sm text-muted line-clamp-2 mb-4 relative z-10">{set.description}</p>
                      )}

                      <div className="mt-auto pt-4 relative z-10">
                        <div className="flex justify-between text-xs font-medium mb-1.5">
                          <span className="text-muted">Mastery</span>
                          <span className="text-foreground">0%</span>
                        </div>
                        <div className="w-full h-1.5 bg-surface rounded-full overflow-hidden">
                          <div className="h-full bg-accent w-0 rounded-full" />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
                {(!setsByCollection[collection.id] || setsByCollection[collection.id].length === 0) && (
                  <div className="col-span-full text-center py-6 text-sm text-muted">
                    No study sets in this collection.
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <CreateCollectionModal 
        isOpen={isCollectionModalOpen} 
        onClose={() => setIsCollectionModalOpen(false)} 
        vaultId={vaultId}
      />
      {activeCollectionId && (
        <CreateStudySetModal
          isOpen={isStudySetModalOpen}
          onClose={() => setIsStudySetModalOpen(false)}
          collectionId={activeCollectionId}
        />
      )}
    </div>
  );
}
