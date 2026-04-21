SUPABASE_URL="https://acfzdcyqdskrmfuuoesb.supabase.co"
SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjZnpkY3lxZHNrcm1mdXVvZXNiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjA0MjU2OCwiZXhwIjoyMDkxNjE4NTY4fQ.fxcoKdzPMaPOEVLxkH99uMukzzIzMkw1Ue1ukqpcmfY"

# Insert dummy profiles with valid format (but we can't easily insert into auth.users, only public.profiles if we bypass foreign key? Wait, profiles has `id uuid references auth.users`)
# Ah, if profiles references auth.users, we can't easily insert profiles directly!
