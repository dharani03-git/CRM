import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://sbcmxazpmgaeriwgtqsy.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNiY214YXpwbWdhZXJpd2d0cXN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUzMTc3ODMsImV4cCI6MjEwMDg5Mzc4M30.l7L2V3D3Zc-zR9X4kJ7YchQrztJ9VI6eNzs5g3ACRM4";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
