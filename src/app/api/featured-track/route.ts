import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { requireAdmin } from '@/lib/api-utils';

export const dynamic = 'force-dynamic';

// Supabase admin client that bypasses RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/featured-track
 * Retrieves the currently active, non-expired featured drop (Album/EP) and its songs.
 * Gated by visibility: if the drop is for fans only, it checks session.
 */
export async function GET() {
  try {
    const now = new Date().toISOString();
    
    // Fetch latest active drop
    const { data: drops, error } = await supabaseAdmin
      .from('featured_drops')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn("Error fetching featured drops (table may not exist yet):", error);
      return NextResponse.json({ track: null });
    }

    if (!drops || drops.length === 0) {
      return NextResponse.json({ track: null });
    }

    const activeDrop = drops[0];

    // Check expiration
    if (activeDrop.expires_at && new Date(activeDrop.expires_at) < new Date()) {
      return NextResponse.json({ track: null });
    }

    // Check visibility
    if (activeDrop.visibility === 'fans') {
      const { createClient: createServerClient } = await import('@/lib/supabase/server');
      const supabase = await createServerClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        // Locked: drop exists but is only for logged-in fans
        return NextResponse.json({ 
          locked: true, 
          visibility: 'fans',
          title: activeDrop.title 
        });
      }
    }

    // Fetch songs for this drop
    const { data: songs, error: songsError } = await supabaseAdmin
      .from('featured_drop_songs')
      .select('*')
      .eq('drop_id', activeDrop.id)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true });

    if (songsError) {
      console.error("Error fetching drop songs:", songsError);
      return NextResponse.json({ track: { ...activeDrop, songs: [] } });
    }

    return NextResponse.json({ track: { ...activeDrop, songs } });
  } catch (err) {
    console.error("GET /api/featured-track error:", err);
    return NextResponse.json({ track: null });
  }
}

/**
 * POST /api/featured-track
 * Uploads multiple songs under an album/drop title and sets it as active.
 * Restricted to admins and crew.
 */
export async function POST(request: Request) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const formData = await request.formData();
    const title = formData.get('title') as string; // Album / Drop Name
    const visibility = formData.get('visibility') as 'everyone' | 'fans';
    const expiresAt = formData.get('expires_at') as string; // nullable
    const compression = formData.get('compression') as 'superb' | 'standard' | 'high' | 'none' || 'standard';
    const normalize = formData.get('normalize') === 'true';


    if (!title || !visibility) {
      return NextResponse.json({ error: 'Missing required parameters (title/visibility)' }, { status: 400 });
    }

    // Ensure upload directory exists
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'featured');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const processedSongs: { title: string; audioUrl: string }[] = [];

    // Parse sequential indexed tracks (audio_0, title_0, audio_1, title_1...)
    for (let i = 0; i < 50; i++) {
      const file = formData.get(`audio_${i}`) as File | null;
      const songTitle = formData.get(`title_${i}`) as string | null;

      if (!file || !songTitle) {
        // If we hit a gap, check if there's any later index, or break
        if (i > 0 && !formData.get(`audio_${i + 1}`)) {
          break;
        }
        continue;
      }

      // Validate file type
      const isAudio = file.type.startsWith('audio/') || 
                      ['.mp3', '.wav', '.ogg', '.m4a', '.aac'].some(ext => file.name.toLowerCase().endsWith(ext));
      if (!isAudio) {
        return NextResponse.json({ error: `File for track ${i + 1} ("${songTitle}") must be a valid audio file` }, { status: 400 });
      }

      // Limit audio file size to 50MB
      const maxAudioSize = 50 * 1024 * 1024;
      if (file.size > maxAudioSize) {
        return NextResponse.json({ error: `Audio file for track ${i + 1} ("${songTitle}") must be smaller than 50MB` }, { status: 400 });
      }

      // Write original to temporary file first
      const origExt = file.name.split('.').pop() || 'mp3';
      const tempFilename = `temp_${Date.now()}_${i}_${Math.random().toString(36).slice(2, 8)}.${origExt}`;
      const tempPath = path.join(uploadDir, tempFilename);
      const buffer = Buffer.from(await file.arrayBuffer());
      fs.writeFileSync(tempPath, buffer);

      let finalFilename = '';
      let compressed = false;

      // Determine final extension
      const finalExt = compression === 'none' ? origExt : 'mp3';
      const finalOutputFilename = `featured_${Date.now()}_${i}_${Math.random().toString(36).slice(2, 8)}.${finalExt}`;
      const finalOutputPath = path.join(uploadDir, finalOutputFilename);

      // If compression is 'none' and no loudness optimization is requested, we can bypass FFmpeg entirely
      if (compression === 'none' && !normalize) {
        try {
          fs.renameSync(tempPath, finalOutputPath);
          compressed = true;
          finalFilename = finalOutputFilename;
        } catch (renameErr) {
          console.error("Failed to rename temp file, copying instead:", renameErr);
          fs.writeFileSync(finalOutputPath, buffer);
          try { fs.unlinkSync(tempPath); } catch {}
          compressed = true;
          finalFilename = finalOutputFilename;
        }
      } else {
        // Run compression/normalization with FFmpeg
        try {
          const { execSync } = require("child_process");
          
          let filterOption = '';
          if (normalize) {
            filterOption = '-af "acompressor=threshold=-16dB:ratio=4:attack=50:release=300,loudnorm"';
          }

          let codecOption = '';
          if (compression !== 'none') {
            const bitrates = { superb: '320k', standard: '192k', high: '128k' };
            const br = bitrates[compression] || '192k';
            codecOption = `-codec:a libmp3lame -b:a ${br}`;
          }

          const ffmpegCmd = `/opt/homebrew/bin/ffmpeg -y -i "${tempPath}" ${codecOption} ${filterOption} "${finalOutputPath}"`;
          execSync(ffmpegCmd, { stdio: "ignore" });
          compressed = true;
          finalFilename = finalOutputFilename;
        } catch (err) {
          console.error(`FFmpeg audio compression failed for track ${i + 1} ("${songTitle}"):`, err);
        }
      }

      if (compressed) {
        try { fs.unlinkSync(tempPath); } catch {}
      } else {
        // Fallback: Rename temp file to the final filename (keeping original extension)
        finalFilename = `featured_${Date.now()}_${i}_${Math.random().toString(36).slice(2, 8)}.${origExt}`;
        const fallbackPath = path.join(uploadDir, finalFilename);
        try {
          fs.renameSync(tempPath, fallbackPath);
        } catch (renameErr) {
          console.error("Failed to rename temp file, writing directly:", renameErr);
          fs.writeFileSync(fallbackPath, buffer);
          try { fs.unlinkSync(tempPath); } catch {}
        }
      }

      processedSongs.push({
        title: songTitle,
        audioUrl: `/uploads/featured/${finalFilename}`
      });
    }

    if (processedSongs.length === 0) {
      return NextResponse.json({ error: 'At least one valid audio track is required' }, { status: 400 });
    }

    // Deactivate any currently active featured drops
    await supabaseAdmin
      .from('featured_drops')
      .update({ is_active: false })
      .eq('is_active', true);

    // Insert the new drop header
    const { data: newDrop, error: insertDropError } = await supabaseAdmin
      .from('featured_drops')
      .insert({
        title,
        visibility,
        expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
        is_active: true
      })
      .select()
      .single();

    if (insertDropError) {
      console.error("Database insert drop error:", insertDropError);
      // Clean up uploaded files
      processedSongs.forEach(s => {
        try {
          const filePath = path.join(uploadDir, s.audioUrl.replace('/uploads/featured/', ''));
          fs.unlinkSync(filePath);
        } catch {}
      });
      return NextResponse.json({ error: 'Failed to record album drop in database' }, { status: 500 });
    }

    // Insert the drop songs in bulk
    const songRows = processedSongs.map((song, index) => ({
      drop_id: newDrop.id,
      title: song.title,
      audio_url: song.audioUrl,
      sort_order: index
    }));

    const { data: insertedSongs, error: insertSongsError } = await supabaseAdmin
      .from('featured_drop_songs')
      .insert(songRows)
      .select();

    if (insertSongsError) {
      console.error("Database insert songs error:", insertSongsError);
      // Rollback files and the drop header
      processedSongs.forEach(s => {
        try {
          const filePath = path.join(uploadDir, s.audioUrl.replace('/uploads/featured/', ''));
          fs.unlinkSync(filePath);
        } catch {}
      });
      await supabaseAdmin.from('featured_drops').delete().eq('id', newDrop.id);
      return NextResponse.json({ error: 'Failed to record songs in database' }, { status: 500 });
    }

    // Trigger router revalidations to refresh static content
    revalidatePath('/', 'page');
    revalidatePath('/admin/[username]', 'page');

    return NextResponse.json({ success: true, track: { ...newDrop, songs: insertedSongs } });
  } catch (err: any) {
    console.error("POST /api/featured-track error:", err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/featured-track
 * Deactivates (closes) the active featured drop manually.
 * Restricted to admins and crew.
 */
export async function PATCH(request: Request) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const { action } = await request.json();

    if (action !== 'close') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Set all drops to inactive
    const { error } = await supabaseAdmin
      .from('featured_drops')
      .update({ is_active: false })
      .eq('is_active', true);

    if (error) {
      console.error("Database deactivation error:", error);
      return NextResponse.json({ error: 'Failed to deactivate drop' }, { status: 500 });
    }

    // Trigger router revalidations
    revalidatePath('/', 'page');
    revalidatePath('/admin/[username]', 'page');

    return NextResponse.json({ success: true, message: 'Featured drop closed successfully' });
  } catch (err: any) {
    console.error("PATCH /api/featured-track error:", err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
