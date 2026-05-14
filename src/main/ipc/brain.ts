import { ipcMain } from 'electron';
import { getSupabaseServiceClient } from '../services/supabase-server';
import { generateEmbedding } from '../services/embeddings';
import type {
  BrainDocument,
  BrainSearchResult,
  BrainEdge,
  IngestPayload,
} from '../../shared/brain-types';

function pickUserId(payload: { userId?: string }): string {
  if (!payload.userId) throw new Error('userId é obrigatório (usuário não autenticado)');
  return payload.userId;
}

export function registerBrainIpc(): void {
  ipcMain.handle(
    'brain:ingest',
    async (_event, payload: IngestPayload & { userId: string }): Promise<BrainDocument> => {
      const userId = pickUserId(payload);
      const embedding = await generateEmbedding(payload.content);
      const client = getSupabaseServiceClient();
      const { data, error } = await client
        .from('brain_documents')
        .insert({
          user_id: userId,
          title: payload.title,
          source_path: payload.sourcePath ?? null,
          content: payload.content,
          tags: payload.tags ?? [],
          embedding,
        })
        .select('id, title, source_path, content, tags, created_at')
        .single();
      if (error) throw new Error(error.message);
      return data as BrainDocument;
    },
  );

  ipcMain.handle(
    'brain:list',
    async (_event, payload: { userId: string }): Promise<BrainDocument[]> => {
      const userId = pickUserId(payload);
      const client = getSupabaseServiceClient();
      const { data, error } = await client
        .from('brain_documents')
        .select('id, title, source_path, content, tags, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      return (data ?? []) as BrainDocument[];
    },
  );

  ipcMain.handle(
    'brain:delete',
    async (_event, payload: { userId: string; id: string }): Promise<void> => {
      const userId = pickUserId(payload);
      const client = getSupabaseServiceClient();
      const { error } = await client
        .from('brain_documents')
        .delete()
        .eq('user_id', userId)
        .eq('id', payload.id);
      if (error) throw new Error(error.message);
    },
  );

  ipcMain.handle(
    'brain:search',
    async (
      _event,
      payload: { userId: string; query: string; threshold?: number; limit?: number },
    ): Promise<BrainSearchResult[]> => {
      pickUserId(payload);
      const embedding = await generateEmbedding(payload.query);
      const client = getSupabaseServiceClient();
      const { data, error } = await client.rpc('match_brain', {
        query_embedding: embedding,
        match_threshold: payload.threshold ?? 0.5,
        match_count: payload.limit ?? 8,
      });
      if (error) throw new Error(error.message);
      return (data ?? []) as BrainSearchResult[];
    },
  );

  ipcMain.handle(
    'brain:listEdges',
    async (_event, payload: { userId: string }): Promise<BrainEdge[]> => {
      const userId = pickUserId(payload);
      const client = getSupabaseServiceClient();
      const { data, error } = await client
        .from('brain_edges')
        .select('id, from_id, to_id, relation, weight')
        .eq('user_id', userId);
      if (error) throw new Error(error.message);
      return (data ?? []) as BrainEdge[];
    },
  );

  ipcMain.handle(
    'brain:addEdge',
    async (
      _event,
      payload: { userId: string; fromId: string; toId: string; relation?: string },
    ): Promise<BrainEdge> => {
      const userId = pickUserId(payload);
      const client = getSupabaseServiceClient();
      const { data, error } = await client
        .from('brain_edges')
        .insert({
          user_id: userId,
          from_id: payload.fromId,
          to_id: payload.toId,
          relation: payload.relation ?? null,
        })
        .select('id, from_id, to_id, relation, weight')
        .single();
      if (error) throw new Error(error.message);
      return data as BrainEdge;
    },
  );
}
