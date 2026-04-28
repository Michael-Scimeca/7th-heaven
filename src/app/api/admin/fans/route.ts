/**
 * Fan Analytics API
 * Returns fan signup metrics, growth trends, and top fans.
 */
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    // Get all fan profiles
    const { data: fans, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, role, tier, points, shows_attended, created_at')
      .eq('role', 'fan')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const allFans = fans || [];
    const total = allFans.length;

    // Growth: signups per day (last 30 days)
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const dailySignups: Record<string, number> = {};
    for (let d = new Date(thirtyDaysAgo); d <= now; d.setDate(d.getDate() + 1)) {
      dailySignups[d.toISOString().split('T')[0]] = 0;
    }
    allFans.forEach(f => {
      const day = new Date(f.created_at).toISOString().split('T')[0];
      if (dailySignups[day] !== undefined) dailySignups[day]++;
    });

    // This week vs last week
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const thisWeek = allFans.filter(f => new Date(f.created_at) >= oneWeekAgo).length;
    const lastWeek = allFans.filter(f => {
      const d = new Date(f.created_at);
      return d >= twoWeeksAgo && d < oneWeekAgo;
    }).length;

    // Tier breakdown
    const tierBreakdown = { Bronze: 0, Silver: 0, Gold: 0, Platinum: 0 };
    allFans.forEach(f => { if (tierBreakdown[f.tier as keyof typeof tierBreakdown] !== undefined) tierBreakdown[f.tier as keyof typeof tierBreakdown]++; });

    // Top fans by points
    const topFans = [...allFans]
      .sort((a, b) => (b.points || 0) - (a.points || 0))
      .slice(0, 10)
      .map(f => ({
        name: f.full_name || 'Anonymous',
        email: f.email,
        points: f.points || 0,
        tier: f.tier,
        shows: f.shows_attended || 0,
        joined: f.created_at,
      }));

    // Recent signups (last 10)
    const recentSignups = allFans.slice(0, 10).map(f => ({
      name: f.full_name || 'Anonymous',
      email: f.email,
      tier: f.tier,
      joined: f.created_at,
    }));

    // Newsletter subscribers count
    let newsletterCount = 0;
    try {
      const { count } = await supabase
        .from('newsletter_subscribers')
        .select('*', { count: 'exact', head: true })
        .eq('subscribed', true);
      newsletterCount = count || 0;
    } catch {}

    return NextResponse.json({
      total,
      thisWeek,
      lastWeek,
      growthPct: lastWeek > 0 ? Math.round(((thisWeek - lastWeek) / lastWeek) * 100) : thisWeek > 0 ? 100 : 0,
      tierBreakdown,
      dailySignups,
      topFans,
      recentSignups,
      newsletterSubscribers: newsletterCount,
    });
  } catch (err: any) {
    console.error('Fan analytics error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
