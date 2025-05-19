import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://eceninunjaaiobphwxwx.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjZW5pbnVuamFhaW9icGh3eHd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2NTg2NDUsImV4cCI6MjA2MzIzNDY0NX0.gO7bnH2DHOGwSBN9imrLXx1oeJuk9M8uRcVuJXPSKUY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,
  },
});
