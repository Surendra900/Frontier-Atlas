import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');

  if (!url) {
    return new NextResponse('Missing URL parameter', { status: 400 });
  }

  // Reject disabled Cloudinary account immediately to prevent proxy delay and 401s
  if (url.includes('cloudinary.com/xipefqle')) {
    return new NextResponse('Asset host disabled', { status: 404 });
  }

  try {
    const imageRes = await fetch(url, {
      headers: {
        // A generic user agent prevents external servers from rejecting the request
        'User-Agent': 'Mozilla/5.0 (compatible; FrontierAtlas/1.0)',
      },
    });

    if (!imageRes.ok) {
      return new NextResponse('Failed to fetch image', { status: imageRes.status });
    }

    const contentType = imageRes.headers.get('content-type');
    const arrayBuffer = await imageRes.arrayBuffer();

    return new NextResponse(arrayBuffer, {
      headers: {
        'Content-Type': contentType || 'image/jpeg',
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=43200',
      },
    });
  } catch (error) {
    console.error('Image proxy error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}