const defaultApiUrl = "https://frontieratlas-backend.morningsignal-india.workers.dev";
const API_BASE = (process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === "development" ? "" : defaultApiUrl)).replace(/\/$/, "");

let refreshPromise: Promise<boolean> | null = null;

export async function refreshAuthSession(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const response = await fetch(`${API_BASE}/api/v1/auth/refresh`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });
      return response.ok;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function fetchWithAuthRetry(
  input: RequestInfo | URL,
  init: RequestInit = {}
) {
  const request = () => fetch(input, { ...init, credentials: "include" });
  const response = await request();

  if (response.status !== 401) return response;

  const refreshed = await refreshAuthSession();
  if (!refreshed) return response;

  return request();
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  displayName: string | null;
  avatar: string | null;
  bio: string | null;
  github: string | null;
  linkedin: string | null;
  twitter: string | null;
  website: string | null;
  reputationScore: number;
  createdAt: string;
}

export async function getCurrentUser(): Promise<UserProfile | null> {
  try {
    const response = await fetchWithAuthRetry(`${API_BASE}/api/v1/auth/me`);
    if (!response.ok) return null;
    const data = await response.json();
    return data.user || null;
  } catch {
    return null;
  }
}

export async function updateUserProfile(
  data: Partial<Pick<UserProfile, "displayName" | "avatar" | "bio" | "github" | "linkedin" | "twitter" | "website">>
): Promise<{ success: boolean; message?: string; user?: UserProfile }> {
  const response = await fetchWithAuthRetry(`${API_BASE}/api/v1/auth/profile`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const resData = await response.json();
  if (!response.ok) {
    throw new Error(resData?.message || "Failed to update profile");
  }
  return resData;
}

export async function logoutUser(): Promise<void> {
  try {
    await fetch(`${API_BASE}/api/v1/auth/logout`, {
      method: "POST",
      credentials: "include",
      cache: "no-store",
    });
  } finally {
    window.dispatchEvent(new Event("authchange"));
  }
}
