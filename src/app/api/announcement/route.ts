import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { sanityWriteClient, queries, fetchSanity } from '@/lib/sanity';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { isActive, text, link, linkText, expiresAt } = await req.json();

    // Fetch the single siteSettings document
    const settings = await fetchSanity<any>(queries.siteSettings);
    if (!settings?._id) {
      return NextResponse.json({ error: 'Site Settings document not found in Sanity' }, { status: 404 });
    }

    // Patch the announcement field
    await sanityWriteClient
      .patch(settings._id)
      .set({
        announcement: {
          isActive: !!isActive,
          text: text || '',
          link: link || '',
          linkText: linkText || 'Read More',
          expiresAt: expiresAt || null,
        }
      })
      .commit();

    // Force Next.js to drop its cache for the homepage immediately
    revalidatePath('/', 'page');
    revalidatePath('/admin', 'page');
    revalidatePath('/crew', 'page');

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to update announcement:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const settings = await fetchSanity<any>(queries.siteSettings);
    const ann = settings?.announcement;
    const isExpired = ann?.expiresAt && new Date(ann.expiresAt) < new Date();
    return NextResponse.json({
      isActive: isExpired ? false : (ann?.isActive || false),
      text: ann?.text || '',
      link: ann?.link || '',
      expiresAt: ann?.expiresAt || null,
    });
  } catch (error: any) {
    return NextResponse.json({ isActive: false, text: '', link: '' });
  }
}
