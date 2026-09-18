import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_REDIRECTS = 2;

const ALLOWED_HOSTS = new Set([
  'image.thum.io',
  'cdn-thumbnails.huggingface.co',
  'arxiv.org',
  'res.cloudinary.com',
]);

const isAllowedHost = (hostname: string) => {
  const host = hostname.toLowerCase().replace(/\.$/, '');

  return (
    ALLOWED_HOSTS.has(host) ||
    host.endsWith('.supabase.co') ||
    host.endsWith('.supabase.in')
  );
};

const validateImageUrl = (value: string) => {
  let url: URL;

  try {
    url = new URL(value);
  } catch {
    return null;
  }

  if (url.protocol !== 'https:') return null;
  if (url.username || url.password) return null;
  if (url.port && url.port !== '443') return null;
  if (!isAllowedHost(url.hostname)) return null;

  return url;
};

async function fetchAllowedImage(url: URL, redirectsRemaining: number): Promise<Response> {
  const response = await fetch(url.toString(), {
    redirect: 'manual',
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; FrontierAtlas/1.0)',
      Accept: 'image/avif,image/webp,image/png,image/jpeg,image/gif,*/*;q=0.1',
    },
  });

  if (response.status >= 300 && response.status < 400) {
    if (redirectsRemaining <= 0) {
      return new Response('Too many image redirects', { status: 502 });
    }

    const location = response.headers.get('location');
    const redirectUrl = location ? validateImageUrl(new URL(location, url).toString()) : null;

    if (!redirectUrl) {
      return new Response('Image redirect target is not allowed', { status: 403 });
    }

    return fetchAllowedImage(redirectUrl, redirectsRemaining - 1);
  }

  return response;
}

export async function GET(req: NextRequest) {
  const rawUrl = req.nextUrl.searchParams.get('url');

  if (!rawUrl) {
    return new NextResponse('Missing URL parameter', { status: 400 });
  }

  const imageUrl = validateImageUrl(rawUrl);
  if (!imageUrl) {
    return new NextResponse('Image host is not allowed', { status: 403 });
  }

  try {
    const imageRes = await fetchAllowedImage(imageUrl, MAX_REDIRECTS);

    if (!imageRes.ok) {
      return new NextResponse('Failed to fetch image', { status: imageRes.status });
    }

    const contentType = imageRes.headers.get('content-type')?.split(';', 1)[0]?.trim().toLowerCase();
    const allowedContentTypes = new Set([
      'image/avif',
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
    ]);

    if (!contentType || !allowedContentTypes.has(contentType)) {
      return new NextResponse('Upstream resource is not a supported image', { status: 415 });
    }

    const contentLength = Number(imageRes.headers.get('content-length') || 0);
    if (contentLength > MAX_IMAGE_BYTES) {
      return new NextResponse('Image is too large', { status: 413 });
    }

    const arrayBuffer = await imageRes.arrayBuffer();
    if (arrayBuffer.byteLength > MAX_IMAGE_BYTES) {
      return new NextResponse('Image is too large', { status: 413 });
    }

    return new NextResponse(arrayBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': String(arrayBuffer.byteLength),
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=43200',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('Image proxy error:', error);
    return new NextResponse('Internal Server Error', { status: 502 });
  }
}
