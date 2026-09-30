const defaultApiUrl = process.env.NODE_ENV === "development"
  ? "http://127.0.0.1:8787"
  : "https://frontieratlas-backend.morningsignal-india.workers.dev";

function getApiBase(): string {
  // If explicitly set via environment variable, use it
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "");
  }
  // In browser, use same-origin relative path so Next.js rewrites proxy requests with 0 CORS issues
  if (typeof window !== "undefined") {
    return "";
  }
  // In Vercel SSR, use current deployment URL
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  // In development SSR, directly connect to 127.0.0.1:8787
  if (process.env.NODE_ENV === "development") {
    return "http://127.0.0.1:8787";
  }
  return defaultApiUrl;
}

export async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const base = getApiBase();
  const url = `${base}${path}`;
  
  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      credentials: "include",
      next: { revalidate: 120 },
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    } as any);
  } catch (fetchErr) {
    // If direct external call failed (e.g. CORS preflight on preview domains), fallback to same-origin /api rewrite
    if (typeof window !== "undefined" && url.startsWith("http") && !url.startsWith(window.location.origin)) {
      try {
        response = await fetch(path, {
          ...options,
          credentials: "include",
          headers: {
            'Content-Type': 'application/json',
            ...options.headers,
          },
        } as any);
      } catch {
        throw fetchErr;
      }
    } else {
      throw fetchErr;
    }
  }

  if (!response.ok) {
    let errorDetail = '';
    try {
      const errJson = await response.json();
      errorDetail = errJson?.detail || errJson?.message || JSON.stringify(errJson);
    } catch {
      try {
        errorDetail = await response.text();
      } catch {}
    }
    const message = `API error: ${response.status} ${response.statusText}${errorDetail ? ` - ${errorDetail}` : ''}`;
    throw new Error(message);
  }

  const text = await response.text();
  try {
    return JSON.parse(text) as T;
  } catch (error) {
    const preview = text.length > 500 ? `${text.slice(0, 500)}…` : text;
    if (process.env.NODE_ENV === "development") {
      console.error(`[fetchApi] JSON parse error on ${url}. Status: ${response.status}. Body preview: "${preview}"`);
    }
    throw new Error(`Invalid JSON response from API: ${url}`, { cause: error });
  }
}
