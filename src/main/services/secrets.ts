import Store from 'electron-store';

type Schema = {
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseServiceKey: string;
  openAiKey: string;
};

const store = new Store<Schema>({
  name: 'momentum-secrets',
  defaults: {
    supabaseUrl: '',
    supabaseAnonKey: '',
    supabaseServiceKey: '',
    openAiKey: '',
  },
  clearInvalidConfig: true,
});

export function getSupabasePublic(): { url: string; anonKey: string } {
  return {
    url: store.get('supabaseUrl'),
    anonKey: store.get('supabaseAnonKey'),
  };
}

export function getSupabaseServiceKey(): string {
  return store.get('supabaseServiceKey');
}

export function getOpenAiKey(): string {
  return store.get('openAiKey');
}

export function hasOpenAiKey(): boolean {
  return Boolean(store.get('openAiKey'));
}

export function hasSupabaseServiceKey(): boolean {
  return Boolean(store.get('supabaseServiceKey'));
}

export function setPublicSettings(payload: { url: string; anonKey: string }): void {
  store.set('supabaseUrl', payload.url.trim());
  store.set('supabaseAnonKey', payload.anonKey.trim());
}

export function setSupabaseServiceKey(key: string): void {
  store.set('supabaseServiceKey', key.trim());
}

export function setOpenAiKey(key: string): void {
  store.set('openAiKey', key.trim());
}
