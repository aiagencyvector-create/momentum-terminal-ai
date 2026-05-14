import { ipcMain } from 'electron';
import { getSupabaseServiceClient } from '../services/supabase-server';
import type { StudioDesign, StudioDesignData } from '../../shared/studio-types';

function requireUserId(payload: { userId?: string }): string {
  if (!payload.userId) throw new Error('userId é obrigatório');
  return payload.userId;
}

export function registerStudioIpc(): void {
  ipcMain.handle(
    'studio:list',
    async (_event, payload: { userId: string }): Promise<StudioDesign[]> => {
      const userId = requireUserId(payload);
      const client = getSupabaseServiceClient();
      const { data, error } = await client
        .from('studio_designs')
        .select('id, name, data, created_at, updated_at')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });
      if (error) throw new Error(error.message);
      return (data ?? []) as StudioDesign[];
    },
  );

  ipcMain.handle(
    'studio:save',
    async (
      _event,
      payload: { userId: string; name: string; data: StudioDesignData },
    ): Promise<StudioDesign> => {
      const userId = requireUserId(payload);
      const client = getSupabaseServiceClient();
      const { data, error } = await client
        .from('studio_designs')
        .upsert(
          {
            user_id: userId,
            name: payload.name,
            data: payload.data,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,name' },
        )
        .select('id, name, data, created_at, updated_at')
        .single();
      if (error) throw new Error(error.message);
      return data as StudioDesign;
    },
  );

  ipcMain.handle(
    'studio:delete',
    async (_event, payload: { userId: string; id: string }): Promise<void> => {
      const userId = requireUserId(payload);
      const client = getSupabaseServiceClient();
      const { error } = await client
        .from('studio_designs')
        .delete()
        .eq('user_id', userId)
        .eq('id', payload.id);
      if (error) throw new Error(error.message);
    },
  );
}
