import { ipcMain } from 'electron';
import {
  getSupabasePublic,
  setPublicSettings,
  setSupabaseServiceKey,
  setOpenAiKey,
  hasOpenAiKey,
  hasSupabaseServiceKey,
} from '../services/secrets';
import { clearSupabaseClientCache } from '../services/supabase-server';
import type { AppSettings } from '../../shared/brain-types';

export function registerSettingsIpc(): void {
  ipcMain.handle('settings:get', (): AppSettings => {
    const pub = getSupabasePublic();
    return {
      supabaseUrl: pub.url,
      supabaseAnonKey: pub.anonKey,
      hasOpenAiKey: hasOpenAiKey(),
      hasSupabaseServiceKey: hasSupabaseServiceKey(),
    };
  });

  ipcMain.handle(
    'settings:setPublic',
    (_event, payload: { url: string; anonKey: string }) => {
      setPublicSettings(payload);
      clearSupabaseClientCache();
    },
  );

  ipcMain.handle('settings:setSupabaseServiceKey', (_event, key: string) => {
    setSupabaseServiceKey(key);
    clearSupabaseClientCache();
  });

  ipcMain.handle('settings:setOpenAiKey', (_event, key: string) => {
    setOpenAiKey(key);
  });
}
