import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://pxpxzasavltypdrkpmdw.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4cHh6YXNhdmx0eXBkcmtwbWR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ4MDQxNzgsImV4cCI6MjEwMDM4MDE3OH0.HqC0jTkWEvUXRb_YPs0H_GQlrzGUnYHKrnz_m0iO_W0";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
