import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
const getAdmin = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    persistSession: false
  }
});
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      action,
      title,
      streamId,
      activeRaffleId,
      raffleData
    } = body;
    const supabase = getAdmin();
    if (action === 'create_stream') {
      const {
        data,
        error
      } = await supabase.from('live_streams').insert({
        title: title || 'Crew Broadcast',
        status: 'live',
        viewer_count: 0
      }).select('id').single();
      if (error) return NextResponse.json({
        error: error.message
      }, {
        status: 500
      });
      return NextResponse.json({
        id: data.id
      });
    }
    if (action === 'end_stream') {
      if (streamId) {
        await supabase.from('live_streams').update({
          status: 'ended'
        }).eq('id', streamId);
      } else {
        await supabase.from('live_streams').update({
          status: 'ended'
        }).eq('status', 'live');
      }
      return NextResponse.json({
        success: true
      });
    }
    if (action === 'sync_raffle') {
      if (activeRaffleId) {
        await supabase.from('raffles').update(raffleData).eq('id', activeRaffleId);
        return NextResponse.json({
          success: true
        });
      } else {
        const {
          data,
          error
        } = await supabase.from('raffles').insert(raffleData).select('id').single();
        if (error) return NextResponse.json({
          error: error.message
        }, {
          status: 500
        });
        return NextResponse.json({
          id: data.id
        });
      }
    }
    return NextResponse.json({
      error: 'Unknown action'
    }, {
      status: 400
    });
  } catch (err: any) {
    return NextResponse.json({
      error: err.message
    }, {
      status: 500
    });
  }
}