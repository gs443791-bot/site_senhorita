import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export const CONFIGURED_SUPABASE_URL = 'https://cofvneyvztbmvgghciyz.supabase.co';
export const CONFIGURED_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvZnZuZXl2enRibXZnZ2hjaXl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI2MjQ1MzIsImV4cCI6MjEwODIwMDUzMn0.8OrIC3KvxlQZ6W6OA1t_kYmniY6WTiDpbqMa92NlhaM';

export function getSupabaseCredentials(): SupabaseConfig {
  // 1. Check runtime environment variables
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (
    envUrl &&
    envKey &&
    envUrl !== 'https://sua-url-de-projeto.supabase.co' &&
    envKey !== 'sua-chave-anon-publica'
  ) {
    return { url: envUrl, anonKey: envKey };
  }

  // 2. Check localStorage (allows user to configure in Admin UI without editing .env or terminal)
  try {
    const saved = localStorage.getItem('senhorita_supabase_config');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.url && parsed.anonKey) {
        return { url: parsed.url, anonKey: parsed.anonKey };
      }
    }
  } catch {
    // fallback
  }

  return { url: CONFIGURED_SUPABASE_URL, anonKey: CONFIGURED_SUPABASE_ANON_KEY };
}

export function saveSupabaseCredentials(url: string, anonKey: string): void {
  localStorage.setItem(
    'senhorita_supabase_config',
    JSON.stringify({ url: url.trim(), anonKey: anonKey.trim() })
  );
  currentClient = null;
}

export function clearSupabaseCredentials(): void {
  localStorage.removeItem('senhorita_supabase_config');
  currentClient = null;
}

let currentClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (currentClient) return currentClient;
  const { url, anonKey } = getSupabaseCredentials();
  if (url && anonKey) {
    try {
      currentClient = createClient(url, anonKey);
      return currentClient;
    } catch (e) {
      console.warn('Failed to initialize Supabase client:', e);
      return null;
    }
  }
  return null;
}

export const isSupabaseConfigured = (): boolean => {
  const { url, anonKey } = getSupabaseCredentials();
  return Boolean(url && anonKey);
};

export async function testSupabaseConnection(
  url: string,
  anonKey: string
): Promise<{ success: boolean; message: string }> {
  try {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return { success: false, message: 'A URL do Supabase deve começar com https://' };
    }
    const tempClient = createClient(url.trim(), anonKey.trim());
    const { error } = await tempClient.from('store_settings').select('*').limit(1);

    if (error) {
      // If table doesn't exist yet, connection itself is valid!
      if (
        error.message.toLowerCase().includes('relation') ||
        error.message.toLowerCase().includes('does not exist')
      ) {
        return {
          success: true,
          message:
            'Conectado ao Supabase com sucesso! As credenciais estão corretas. Agora execute o Script SQL abaixo para criar as tabelas.',
        };
      }
      return { success: false, message: `Erro retornado pelo Supabase: ${error.message}` };
    }
    return { success: true, message: 'Conexão e tabelas verificadas com sucesso no Supabase! ✨' };
  } catch (err: any) {
    return { success: false, message: `Falha ao tentar conectar: ${err?.message || 'Verifique sua URL e Chave Anon'}` };
  }
}
