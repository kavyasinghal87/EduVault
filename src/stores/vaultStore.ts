import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";

interface Vault {
  id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  exam_type: string | null;
  created_at: string;
}

interface Collection {
  id: string;
  vault_id: string;
  name: string;
  color: string | null;
  icon: string | null;
  order_index: number;
}

interface StudySet {
  id: string;
  collection_id: string;
  title: string;
  description: string | null;
  card_count: number;
}

interface VaultStore {
  vaults: Vault[];
  selectedVault: Vault | null;
  collections: Collection[];
  studySets: StudySet[];
  loading: boolean;
  fetchVaults: () => Promise<void>;
  fetchVaultDetails: (vaultId: string) => Promise<void>;
  createVault: (vaultData: Partial<Vault>) => Promise<{ data: Vault | null; error: any }>;
  createCollection: (collectionData: Partial<Collection>) => Promise<Collection | null>;
  createStudySet: (setData: Partial<StudySet>) => Promise<StudySet | null>;
  deleteVault: (id: string) => Promise<boolean>;
  deleteCollection: (id: string) => Promise<boolean>;
  deleteStudySet: (id: string) => Promise<boolean>;
}

export const useVaultStore = create<VaultStore>((set, get) => ({
  vaults: [],
  selectedVault: null,
  collections: [],
  studySets: [],
  loading: false,

  fetchVaults: async () => {
    set({ loading: true });
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { data } = await supabase
        .from("vaults")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
        
      set({ vaults: data || [], loading: false });
    } else {
      set({ vaults: [], loading: false });
    }
  },

  fetchVaultDetails: async (vaultId: string) => {
    set({ loading: true, selectedVault: null, collections: [], studySets: [] });
    const supabase = createClient();
    
    const { data: vault } = await supabase
      .from("vaults")
      .select("*")
      .eq("id", vaultId)
      .single();
      
    if (vault) {
      const { data: cols } = await supabase
        .from("collections")
        .select("*")
        .eq("vault_id", vaultId)
        .order("order_index", { ascending: true });
        
      const colIds = cols?.map(c => c.id) || [];
      let sets: StudySet[] = [];
      
      if (colIds.length > 0) {
        const { data: ss } = await supabase
          .from("study_sets")
          .select("*")
          .in("collection_id", colIds);
        sets = ss || [];
      }
      
      set({ selectedVault: vault, collections: cols || [], studySets: sets, loading: false });
    } else {
      set({ loading: false });
    }
  },

  createVault: async (vaultData) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return { data: null, error: new Error("User not authenticated") };

    // Fortify user profile existence before attempting to create constrained records
    await supabase.from("users").upsert({
      id: user.id,
      email: user.email || "",
      name: user.user_metadata?.name || "User",
    }, { onConflict: 'id' });

    const { data, error } = await supabase
      .from("vaults")
      .insert({
        ...vaultData,
        user_id: user.id
      })
      .select()
      .single();

    if (!error && data) {
      set((state) => ({ vaults: [data, ...state.vaults] }));
      return { data, error: null };
    }
    return { data: null, error };
  },

  createCollection: async (collectionData) => {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from("collections")
      .insert(collectionData)
      .select()
      .single();

    if (error) {
      console.error("Error creating collection:", error.message);
      alert(`Failed to create collection: ${error.message}\nIf this is an RLS issue, make sure to add the necessary RLS policies to the collections table.`);
    }

    if (!error && data) {
      set((state) => ({ collections: [...state.collections, data] }));
      return data;
    }
    return null;
  },

  createStudySet: async (setData) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;

    const { data, error } = await supabase
      .from("study_sets")
      .insert({
        ...setData,
        user_id: user.id
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating study set:", error.message);
      alert(`Failed to create study set: ${error.message}\nMake sure RLS policies are properly set.`);
    }

    if (!error && data) {
      set((state) => ({ studySets: [...state.studySets, data] }));
      return data;
    }
    return null;
  },

  deleteVault: async (id) => {
    const supabase = createClient();
    const { error } = await supabase.from("vaults").delete().eq("id", id);
    if (!error) {
      set((state) => ({ vaults: state.vaults.filter((v) => v.id !== id) }));
      return true;
    }
    return false;
  },

  deleteCollection: async (id) => {
    const supabase = createClient();
    const { error } = await supabase.from("collections").delete().eq("id", id);
    if (!error) {
      set((state) => ({ collections: state.collections.filter((c) => c.id !== id) }));
      return true;
    }
    return false;
  },

  deleteStudySet: async (id) => {
    const supabase = createClient();
    const { error } = await supabase.from("study_sets").delete().eq("id", id);
    if (!error) {
      set((state) => ({ studySets: state.studySets.filter((s) => s.id !== id) }));
      return true;
    }
    return false;
  }
}));
