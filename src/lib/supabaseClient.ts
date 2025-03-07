import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://yudjbwdzxnprhqcozbyj.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1ZGpid2R6eG5wcmhxY296YnlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEyODYxMzgsImV4cCI6MjA1Njg2MjEzOH0.LbIcoNkH-EK5-lBNGk0rl2O4b6Fu7dFIDzEFEbQl23Q';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,
  },
});