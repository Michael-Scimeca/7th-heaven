-- Site settings for admin toggles (auto-blast, etc.)
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SMS blast log to track which shows have been auto-blasted
CREATE TABLE IF NOT EXISTS sms_blast_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  show_id TEXT NOT NULL,
  venue TEXT,
  date TEXT,
  sent_count INTEGER DEFAULT 0,
  blasted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Default: auto-blast ON, 3 days before
INSERT INTO site_settings (key, value) VALUES ('sms_auto_blast', 'on') ON CONFLICT (key) DO NOTHING;
INSERT INTO site_settings (key, value) VALUES ('sms_auto_blast_days', '3') ON CONFLICT (key) DO NOTHING;
