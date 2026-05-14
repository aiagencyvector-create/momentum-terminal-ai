export type BrainDocument = {
  id: string;
  title: string;
  source_path: string | null;
  content: string;
  tags: string[];
  created_at: string;
};

export type BrainSearchResult = {
  id: string;
  title: string;
  source_path: string | null;
  content: string;
  tags: string[];
  similarity: number;
};

export type BrainEdge = {
  id: string;
  from_id: string;
  to_id: string;
  relation: string | null;
  weight: number;
};

export type IngestPayload = {
  title: string;
  content: string;
  sourcePath?: string;
  tags?: string[];
};

export type AppSettings = {
  supabaseUrl: string;
  supabaseAnonKey: string;
  hasOpenAiKey: boolean;
  hasSupabaseServiceKey: boolean;
};
