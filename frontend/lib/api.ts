const defaultApiUrl = process.env.NODE_ENV === "development"
  ? "http://localhost:8787"
  : "https://frontieratlas-backend.morningsignal-india.workers.dev";
const API_BASE = (process.env.NEXT_PUBLIC_API_URL || defaultApiUrl).replace(/\/$/, "");
export async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  let url = `${API_BASE}${path}`;
  
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
    // If local dev server was not reachable, fallback to production backend worker
    if (API_BASE.includes("localhost")) {
      url = `https://frontieratlas-backend.morningsignal-india.workers.dev${path}`;
      response = await fetch(url, {
        ...options,
        credentials: "include",
        next: { revalidate: 120 },
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      } as any);
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
