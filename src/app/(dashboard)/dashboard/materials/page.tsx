"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/AuthContext";
import {
  FileText,
  Image as ImageIcon,
  File,
  Search,
  Upload,
  Trash2,
  ExternalLink,
  Download,
  Filter,
  CloudUpload,
  Clock,
  HardDrive,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import UploadMaterialModal from "@/components/UploadMaterialModal";

interface StudyMaterial {
  id: string;
  user_id: string;
  vault_id: string | null;
  file_name: string;
  file_type: string;
  file_size: number;
  storage_path: string;
  description: string | null;
  tags: string[] | null;
  created_at: string;
  vault_name?: string;
}

function getFileIcon(type: string, size: "sm" | "lg" = "sm") {
  const cls = size === "lg" ? "w-7 h-7" : "w-5 h-5";
  switch (type) {
    case "pdf":
      return <FileText className={`${cls} text-red-400`} />;
    case "docx":
      return <FileText className={`${cls} text-blue-400`} />;
    case "txt":
      return <FileText className={`${cls} text-emerald-400`} />;
    case "image":
      return <ImageIcon className={`${cls} text-purple-400`} />;
    default:
      return <File className={`${cls} text-muted`} />;
  }
}

function getFileColor(type: string) {
  switch (type) {
    case "pdf":
      return "bg-red-500/10 border-red-500/20";
    case "docx":
      return "bg-blue-500/10 border-blue-500/20";
    case "txt":
      return "bg-emerald-500/10 border-emerald-500/20";
    case "image":
      return "bg-purple-500/10 border-purple-500/20";
    default:
      return "bg-white/5 border-white/10";
  }
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
} as any;

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 120, damping: 18 },
  },
} as any;

export default function MaterialsPage() {
  const { user, loading: authLoading } = useAuth();
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fetched = useRef(false);

  const fetchMaterials = async () => {
    if (!user) return;
    const supabase = createClient();

    const { data } = await supabase
      .from("study_materials")
      .select("*, vaults(name)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (data) {
      const formatted = data.map((m: any) => ({
        ...m,
        vault_name: m.vaults?.name || null,
      }));
      setMaterials(formatted);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (authLoading || !user || fetched.current) return;
    fetched.current = true;
    fetchMaterials();
  }, [user, authLoading]);

  const handleDelete = async (material: StudyMaterial) => {
    if (!confirm(`Delete "${material.file_name}"? This cannot be undone.`)) return;

    setDeletingId(material.id);
    const supabase = createClient();

    // Delete from storage
    await supabase.storage.from("study-materials").remove([material.storage_path]);

    // Delete from database
    await supabase.from("study_materials").delete().eq("id", material.id);

    setMaterials((prev) => prev.filter((m) => m.id !== material.id));
    setDeletingId(null);
  };

  const handleOpen = async (material: StudyMaterial) => {
    const supabase = createClient();
    const { data } = await supabase.storage
      .from("study-materials")
      .createSignedUrl(material.storage_path, 3600); // 1 hour

    if (data?.signedUrl) {
      window.open(data.signedUrl, "_blank");
    }
  };

  const handleDownload = async (material: StudyMaterial) => {
    const supabase = createClient();
    const { data } = await supabase.storage
      .from("study-materials")
      .createSignedUrl(material.storage_path, 3600);

    if (data?.signedUrl) {
      const a = document.createElement("a");
      a.href = data.signedUrl;
      a.download = material.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  // Filters
  let displayed = [...materials];

  if (filterType !== "all") {
    displayed = displayed.filter((m) => m.file_type === filterType);
  }

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    displayed = displayed.filter(
      (m) =>
        m.file_name.toLowerCase().includes(q) ||
        (m.description && m.description.toLowerCase().includes(q))
    );
  }

  const totalSize = materials.reduce((sum, m) => sum + m.file_size, 0);

  const fileTypeCounts = materials.reduce(
    (acc, m) => {
      acc[m.file_type] = (acc[m.file_type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Header */}
      <motion.div
        variants={fadeUp}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold mb-1">Study Materials</h1>
          <p className="text-muted">
            Upload and manage your notes, PDFs, and documents in one place.
          </p>
        </div>
        <button
          onClick={() => setIsUploadOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-xl font-semibold transition-all shadow-[0_0_20px_rgba(108,99,255,0.3)] shrink-0"
        >
          <Upload className="w-5 h-5" />
          Upload Material
        </button>
      </motion.div>

      {/* Stats Row */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-surface border border-white/5 rounded-2xl flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
            <CloudUpload className="w-5 h-5 text-accent" />
          </div>
          <div>
            <p className="text-2xl font-bold">{materials.length}</p>
            <p className="text-xs text-muted font-medium">Total Files</p>
          </div>
        </div>
        <div className="p-4 bg-surface border border-white/5 rounded-2xl flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-brand-mint/10 border border-brand-mint/20 flex items-center justify-center">
            <HardDrive className="w-5 h-5 text-brand-mint" />
          </div>
          <div>
            <p className="text-2xl font-bold">{formatSize(totalSize)}</p>
            <p className="text-xs text-muted font-medium">Storage Used</p>
          </div>
        </div>
        <div className="p-4 bg-surface border border-white/5 rounded-2xl flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-brand-amber/10 border border-brand-amber/20 flex items-center justify-center">
            <Clock className="w-5 h-5 text-brand-amber" />
          </div>
          <div>
            <p className="text-2xl font-bold">
              {materials.length > 0
                ? formatDate(materials[0].created_at)
                : "—"}
            </p>
            <p className="text-xs text-muted font-medium">Last Upload</p>
          </div>
        </div>
      </motion.div>

      {/* Search & Filter */}
      <motion.div
        variants={fadeUp}
        className="flex flex-col sm:flex-row gap-3 items-start sm:items-center"
      >
        <div className="relative flex-1 w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Search materials..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-surface border border-white/5 focus:border-accent outline-none transition-colors text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted" />
          {["all", "pdf", "docx", "txt", "image"].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterType === type
                  ? "bg-accent/10 text-accent border border-accent/20"
                  : "bg-surface border border-white/5 text-muted hover:text-foreground hover:border-white/10"
              }`}
            >
              {type === "all"
                ? `All (${materials.length})`
                : `${type.toUpperCase()} (${fileTypeCounts[type] || 0})`}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Materials Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : displayed.length === 0 ? (
        <motion.div
          variants={fadeUp}
          className="bg-surface border border-white/5 rounded-2xl p-16 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-4">
            <CloudUpload className="w-8 h-8 text-accent" />
          </div>
          <h3 className="text-xl font-bold mb-2">
            {materials.length === 0
              ? "No materials uploaded yet"
              : "No results found"}
          </h3>
          <p className="text-muted mb-6 max-w-sm mx-auto">
            {materials.length === 0
              ? "Upload your first study material — PDFs, notes, images, and more."
              : "Try adjusting your search or filter."}
          </p>
          {materials.length === 0 && (
            <button
              onClick={() => setIsUploadOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-accent hover:bg-accent-hover text-white rounded-xl text-sm font-semibold transition-all shadow-[0_0_20px_rgba(108,99,255,0.3)]"
            >
              <Upload className="w-4 h-4" />
              Upload Your First Material
            </button>
          )}
        </motion.div>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <AnimatePresence>
            {displayed.map((material) => (
              <motion.div
                key={material.id}
                variants={fadeUp}
                layout
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ y: -3 }}
                className="group"
              >
                <div className="h-full p-5 bg-surface border border-white/5 hover:border-accent/30 rounded-2xl transition-all relative overflow-hidden flex flex-col">
                  {/* Subtle glow on hover */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-accent/0 group-hover:bg-accent/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 transition-colors" />

                  <div className="flex items-start gap-3 mb-3 relative z-10">
                    <div
                      className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 ${getFileColor(
                        material.file_type
                      )}`}
                    >
                      {getFileIcon(material.file_type, "lg")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold truncate group-hover:text-accent transition-colors">
                        {material.file_name}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-muted mt-0.5">
                        <span className="font-semibold uppercase">
                          {material.file_type}
                        </span>
                        <span>•</span>
                        <span>{formatSize(material.file_size)}</span>
                      </div>
                    </div>
                  </div>

                  {material.description && (
                    <p className="text-sm text-muted line-clamp-2 mb-3 relative z-10">
                      {material.description}
                    </p>
                  )}

                  <div className="mt-auto relative z-10">
                    {material.vault_name && (
                      <div className="text-xs text-muted font-medium bg-background px-2.5 py-1.5 rounded-lg border border-white/5 mb-3 truncate">
                        📁 {material.vault_name}
                      </div>
                    )}
                    <div className="flex items-center justify-between text-xs text-muted">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(material.created_at)}
                      </span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleOpen(material)}
                          className="p-1.5 rounded-lg hover:bg-white/5 text-muted hover:text-accent transition-colors"
                          title="Open"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDownload(material)}
                          className="p-1.5 rounded-lg hover:bg-white/5 text-muted hover:text-brand-mint transition-colors"
                          title="Download"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(material)}
                          disabled={deletingId === material.id}
                          className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted hover:text-red-400 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Upload Modal */}
      <UploadMaterialModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadComplete={() => {
          fetched.current = false;
          fetchMaterials();
        }}
      />
    </motion.div>
  );
}
