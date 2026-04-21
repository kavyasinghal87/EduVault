"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Loader2,
  Upload,
  FileText,
  Image as ImageIcon,
  File,
  CheckCircle2,
  AlertCircle,
  CloudUpload,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/AuthContext";

interface UploadMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete?: () => void;
}

interface VaultOption {
  id: string;
  name: string;
}

const ACCEPTED_TYPES: Record<string, string[]> = {
  "application/pdf": [".pdf"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
  "text/plain": [".txt"],
  "image/png": [".png"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/webp": [".webp"],
};

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

function getFileTypeLabel(mime: string): string {
  if (mime === "application/pdf") return "pdf";
  if (mime.includes("wordprocessingml")) return "docx";
  if (mime === "text/plain") return "txt";
  if (mime.startsWith("image/")) return "image";
  return "other";
}

function getFileIcon(mime: string) {
  if (mime === "application/pdf") return <FileText className="w-6 h-6 text-red-400" />;
  if (mime.includes("wordprocessingml")) return <FileText className="w-6 h-6 text-blue-400" />;
  if (mime === "text/plain") return <FileText className="w-6 h-6 text-emerald-400" />;
  if (mime.startsWith("image/")) return <ImageIcon className="w-6 h-6 text-purple-400" />;
  return <File className="w-6 h-6 text-muted" />;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function UploadMaterialModal({
  isOpen,
  onClose,
  onUploadComplete,
}: UploadMaterialModalProps) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [selectedVaultId, setSelectedVaultId] = useState("");
  const [vaults, setVaults] = useState<VaultOption[]>([]);

  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Fetch vaults on open
  useEffect(() => {
    if (!isOpen || !user) return;
    const fetchVaults = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("vaults")
        .select("id, name")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setVaults(data || []);
    };
    fetchVaults();
  }, [isOpen, user]);

  const resetState = () => {
    setFile(null);
    setDescription("");
    setSelectedVaultId("");
    setError(null);
    setSuccess(false);
    setProgress(0);
  };

  const handleClose = () => {
    if (uploading) return;
    resetState();
    onClose();
  };

  const validateFile = (f: File): string | null => {
    if (!Object.keys(ACCEPTED_TYPES).includes(f.type)) {
      return "Unsupported file type. Please upload a PDF, DOCX, TXT, or image file.";
    }
    if (f.size > MAX_FILE_SIZE) {
      return `File is too large. Maximum size is ${formatSize(MAX_FILE_SIZE)}.`;
    }
    return null;
  };

  const handleFileSelection = (f: File) => {
    const validationError = validateFile(f);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setFile(f);
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file || !user) return;

    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      const supabase = createClient();
      const fileExt = file.name.split(".").pop() || "";
      const uniqueName = `${crypto.randomUUID()}_${file.name}`;
      const storagePath = `${user.id}/${uniqueName}`;

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 85) {
            clearInterval(progressInterval);
            return 85;
          }
          return prev + Math.random() * 15;
        });
      }, 200);

      // Upload to Supabase Storage
      const { error: storageError } = await supabase.storage
        .from("study-materials")
        .upload(storagePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      clearInterval(progressInterval);

      if (storageError) {
        setError(`Upload failed: ${storageError.message}`);
        setUploading(false);
        setProgress(0);
        return;
      }

      setProgress(90);

      // Insert record in study_materials table
      const { error: dbError } = await supabase.from("study_materials").insert({
        user_id: user.id,
        vault_id: selectedVaultId || null,
        file_name: file.name,
        file_type: getFileTypeLabel(file.type),
        file_size: file.size,
        storage_path: storagePath,
        description: description || null,
      });

      if (dbError) {
        setError(`Record failed: ${dbError.message}`);
        setUploading(false);
        setProgress(0);
        return;
      }

      setProgress(100);
      setSuccess(true);
      onUploadComplete?.();

      // Auto close after success
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setUploading(false);
    }
  };

  const acceptString = Object.entries(ACCEPTED_TYPES)
    .flatMap(([mime, exts]) => [mime, ...exts])
    .join(",");

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-full max-w-lg bg-surface border border-white/10 rounded-2xl shadow-2xl overflow-hidden relative"
          >
            {/* Glow effect */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-40 bg-accent/20 blur-[80px] rounded-full pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/5 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                  <CloudUpload className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Upload Study Material</h2>
                  <p className="text-xs text-muted">PDF, DOCX, TXT, or images up to 25MB</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                disabled={uploading}
                className="text-muted hover:text-foreground transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 relative z-10">
              {/* Success State */}
              {success ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center py-8"
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                  </div>
                  <h3 className="text-lg font-bold mb-1">Upload Complete!</h3>
                  <p className="text-sm text-muted">Your study material has been saved.</p>
                </motion.div>
              ) : (
                <>
                  {/* Drag & Drop Zone */}
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-300 ${
                      dragActive
                        ? "border-accent bg-accent/5 scale-[1.01]"
                        : file
                        ? "border-accent/30 bg-accent/5"
                        : "border-white/10 hover:border-white/20 hover:bg-white/[0.02]"
                    }`}
                  >
                    {/* Animated border glow on drag */}
                    {dragActive && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 rounded-2xl shadow-[inset_0_0_30px_rgba(108,99,255,0.15)] pointer-events-none"
                      />
                    )}

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept={acceptString}
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    {file ? (
                      <div className="flex items-center gap-4 p-5">
                        <div className="w-14 h-14 rounded-xl bg-background border border-white/10 flex items-center justify-center shrink-0">
                          {getFileIcon(file.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">{file.name}</p>
                          <p className="text-sm text-muted">
                            {formatSize(file.size)} •{" "}
                            {getFileTypeLabel(file.type).toUpperCase()}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setFile(null);
                            setError(null);
                          }}
                          className="text-muted hover:text-foreground transition-colors p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center py-10 px-6">
                        <motion.div
                          animate={dragActive ? { y: -5, scale: 1.1 } : { y: 0, scale: 1 }}
                          transition={{ type: "spring", stiffness: 300, damping: 25 }}
                          className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mb-4"
                        >
                          <Upload className="w-7 h-7 text-accent" />
                        </motion.div>
                        <p className="font-semibold mb-1">
                          {dragActive ? "Drop your file here" : "Drag & drop your file here"}
                        </p>
                        <p className="text-sm text-muted">
                          or{" "}
                          <span className="text-accent font-medium">click to browse</span>{" "}
                          from your computer
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Error Message */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20"
                    >
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      <p className="text-sm text-red-400">{error}</p>
                    </motion.div>
                  )}

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Description{" "}
                      <span className="text-muted font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="e.g., Chapter 5 — Organic Chemistry Notes"
                      className="w-full px-4 py-2.5 rounded-xl bg-background border border-white/10 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all text-sm"
                    />
                  </div>

                  {/* Vault Association */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Link to Vault{" "}
                      <span className="text-muted font-normal">(Optional)</span>
                    </label>
                    <div className="relative">
                      <select
                        value={selectedVaultId}
                        onChange={(e) => setSelectedVaultId(e.target.value)}
                        className="w-full appearance-none px-4 py-2.5 rounded-xl bg-background border border-white/10 focus:border-accent outline-none transition-all text-sm cursor-pointer"
                      >
                        <option value="">No vault (standalone)</option>
                        {vaults.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.name}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg
                          className="w-4 h-4 text-muted"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Upload Progress */}
                  {uploading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-2"
                    >
                      <div className="flex justify-between text-sm">
                        <span className="text-muted">Uploading...</span>
                        <span className="font-medium text-accent">
                          {Math.round(progress)}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-background rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          className="h-full bg-gradient-to-r from-accent to-[#8B84FF] rounded-full"
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* Actions */}
                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleClose}
                      disabled={uploading}
                      className="px-5 py-2.5 rounded-xl font-medium hover:bg-white/5 transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUpload}
                      disabled={!file || uploading}
                      className="flex items-center gap-2 px-6 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-xl font-medium transition-all shadow-[0_0_20px_rgba(108,99,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {uploading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                      {uploading ? "Uploading..." : "Upload"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
