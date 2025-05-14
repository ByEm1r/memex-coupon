import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error("VITE_SUPABASE_URL is not defined in .env");
}

if (!supabaseKey) {
  throw new Error("VITE_SUPABASE_ANON_KEY is not defined in .env");
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Helper function to check auth status
export const checkAuth = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) {
    console.error('Error checking auth status:', error);
    return null;
  }
  return session;
};

// Helper function to ensure app settings exist
const ensureAppSettings = async () => {
  const defaultSettings = {
    id: 1,
    memex_amount: 50000000,
    memex_address: 'xTSNVy4GLEDETscV2HFQ8HoThzpWWmxArP'
  };

  try {
    // Try to insert default settings if they don't exist
    const { error: upsertError } = await supabase
      .from('app_settings')
      .upsert([defaultSettings])
      .select();

    if (upsertError) throw upsertError;
  } catch (error) {
    console.error('Error ensuring app settings:', error);
  }
};

// Helper function to fetch app settings
export const fetchAppSettings = async () => {
  try {
    // First ensure settings exist
    await ensureAppSettings();

    // Then fetch the settings
    const { data, error } = await supabase
      .from('app_settings')
      .select('*')
      .eq('id', 1)
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error fetching app settings:', error);
    // Return default settings on error
    return {
      id: 1,
      memex_amount: 50000000,
      memex_address: 'xTSNVy4GLEDETscV2HFQ8HoThzpWWmxArP'
    };
  }
};

// Helper function to update app settings
export const updateAppSettings = async (settings: { memex_amount?: number; memex_address?: string }) => {
  try {
    // Ensure settings exist before updating
    await ensureAppSettings();

    const { data, error } = await supabase
      .from('app_settings')
      .update({
        ...settings,
        updated_at: new Date().toISOString()
      })
      .eq('id', 1)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating app settings:', error);
    throw error;
  }
};