"use client";

import { useEffect, useState } from "react";
import { FolderOpen, Plus, Search, LayoutGrid, List } from "lucide-react";
import { useVaultStore } from "@/stores/vaultStore";
import Link from "next/link";
import CreateVaultModal from "@/components/CreateVaultModal";
import { motion } from "framer-motion";

export default function VaultsPage() {
  const { vaults, fetchVaults, loading } = useVaultStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"recent" | "alphabetical">("recent");

  useEffect(() => {
    fetchVaults();
  }, [fetchVaults]);

  let displayVaults = [...vaults];

  if (activeTab === "Recent") {
    displayVaults = displayVaults.slice(0, 4);
  } else if (activeTab === "Public") {
    displayVaults = displayVaults.filter(v => v.is_public);
  }

  displayVaults = displayVaults.filter(v => 
    v.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (v.description && v.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (sortBy === "alphabetical") {
    displayVaults.sort((a, b) => a.name.localeCompare(b.name));
  } else {
    displayVaults.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Vaults</h1>
          <p className="text-muted">Manage all your knowledge bases in one place.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-xl font-semibold transition-all shadow-[0_0_20px_rgba(108,99,255,0.3)] shrink-0"
        >
          <Plus className="w-5 h-5" />
          Create Vault
        </button>
      </div>

      <div className="flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between border-b border-white/5 pb-4">
        <div className="flex items-center gap-6 w-full xl:w-auto border-b sm:border-none border-white/5 pb-2 sm:pb-0 overflow-x-auto scrollbar-hide">
          {["All", "Recent", "Public"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative pb-3 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab ? "text-foreground" : "text-muted hover:text-foreground/80"
              }`}
            >
              {tab}
              {activeTab === tab && (
                <motion.div
                  layoutId="activeTabVaults"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent"
                />
              )}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-3 w-full xl:w-auto">
          <div className="relative flex-1 sm:w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder="Search vaults..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-surface border border-white/5 focus:border-accent outline-none transition-colors text-sm"
            />
          </div>

          <div className="flex items-center bg-surface border border-white/5 rounded-lg p-1 shrink-0">
            <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? "bg-white/10 text-foreground" : "text-muted hover:text-foreground"}`}>
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? "bg-white/10 text-foreground" : "text-muted hover:text-foreground"}`}>
              <List className="w-4 h-4" />
            </button>
          </div>
          
          <div className="relative shrink-0">
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value as any)}
              className="appearance-none bg-surface border border-white/5 rounded-lg pl-3 pr-8 py-2 text-sm outline-none cursor-pointer hover:border-white/10 transition-colors focus:border-accent"
            >
              <option value="recent">Recent</option>
              <option value="alphabetical">A-Z</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : displayVaults.length === 0 ? (
        <div className="bg-surface border border-white/5 rounded-2xl p-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-4">
            <FolderOpen className="w-8 h-8 text-accent" />
          </div>
          <h3 className="text-xl font-bold mb-2">No vaults found</h3>
          <p className="text-muted mb-6">Create a new vault or adjust your search filters.</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-surface border border-white/10 hover:bg-raised text-foreground rounded-xl font-medium transition-all"
          >
            Create Vault
          </button>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" : "flex flex-col gap-3"}>
          {displayVaults.map((vault) => (
            <motion.div key={vault.id} whileHover={viewMode === 'grid' ? { y: -4 } : { x: 4 }}>
              {viewMode === 'grid' ? (
                <Link
                  href={`/dashboard/vaults/${vault.id}`}
                  className="block h-full p-6 bg-surface border border-white/5 hover:border-accent/40 rounded-2xl transition-all group"
                >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                    <FolderOpen className="w-6 h-6 text-accent" />
                  </div>
                  {vault.exam_type && (
                    <span className="text-xs font-semibold px-2.5 py-1 bg-brand-amber/10 text-brand-amber rounded-full">
                      {vault.exam_type}
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-accent transition-colors">{vault.name}</h3>
                <p className="text-muted text-sm line-clamp-2 mb-4">
                  {vault.description || "No description provided."}
                </p>
                <div className="flex items-center gap-3 text-xs font-medium text-muted">
                  <span className="flex items-center gap-1">
                    {vault.is_public ? "Public" : "Private"}
                  </span>
                  <span>•</span>
                  <span>{new Date(vault.created_at).toLocaleDateString()}</span>
                </div>
              </Link>
              ) : (
              <Link
                href={`/dashboard/vaults/${vault.id}`}
                className="flex items-center justify-between p-4 bg-surface border border-white/5 hover:border-accent/40 rounded-xl transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 shrink-0 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
                    <FolderOpen className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold group-hover:text-accent transition-colors">{vault.name}</h3>
                      {vault.exam_type && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 bg-brand-amber/10 text-brand-amber rounded-full">
                          {vault.exam_type}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs font-medium text-muted">
                      <span>{vault.is_public ? "Public" : "Private"}</span>
                      <span>•</span>
                      <span>{new Date(vault.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="hidden sm:block text-sm text-muted max-w-[300px] truncate">
                  {vault.description || "No description provided."}
                </div>
              </Link>
              )}
            </motion.div>
          ))}
        </div>
      )}

      <CreateVaultModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
