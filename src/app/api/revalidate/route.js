import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path') || '/';

    revalidatePath(path);
    revalidatePath('/', 'page');
    revalidatePath('/about', 'page');
    revalidatePath('/services', 'page');
    revalidatePath('/pricing', 'page');
    revalidatePath('/projects', 'page');

    return NextResponse.json({
      revalidated: true,
      now: Date.now(),
      message: `Revalidated paths including ${path}`
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
