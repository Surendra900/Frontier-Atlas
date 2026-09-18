import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";

import {
  AuthError,
  getCurrentUser,
  updateUserProfile,
  loginUser,
  logoutUser,
  refreshUserToken,
  signupUser,
  upsertGoogleUser,
  upsertGithubUser,
} from "../services/auth.service.js";

import {
  ACCESS_TOKEN_COOKIE,
  ACCESS_TOKEN_MAX_AGE_SECONDS,
  REFRESH_TOKEN_COOKIE,
  REFRESH_TOKEN_MAX_AGE_SECONDS,
} from "../utils/jwt.js";

import { createOAuthState, OAUTH_STATE_COOKIE, sanitizeRedirectPath, verifyOAuthState } from "../utils/oauth-state.js";

import {
  loginSchema,
  refreshSchema,
  signupSchema,
} from "../validators/auth.validator.js";

type AuthContext = Context<{
  Variables: {
    prisma: any;
    userId: string;
  };
}>;

const getCookieOptions = (c: Context) => {
  // The production frontend and API use different origins. A Lax cookie is
  // stored on login but is not sent with its subsequent cross-origin fetch to
  // /auth/me, which leaves every authenticated request looking anonymous.
  // `SameSite=None` requires `Secure`, so retain Lax for local HTTP development.
  const secure = new URL(c.req.url).protocol === "https:";

  return {
    httpOnly: true,
    secure,
    sameSite: secure ? "None" : "Lax",
    path: "/",
  } as const;
};

const setAuthCookies = (
  c: Context,
  accessToken: string,
  refreshToken: string,
  rememberMe: boolean = true
) => {
  setCookie(c, ACCESS_TOKEN_COOKIE, accessToken, {
    ...getCookieOptions(c),
    ...(rememberMe ? { maxAge: ACCESS_TOKEN_MAX_AGE_SECONDS } : {}),
  });

  setCookie(c, REFRESH_TOKEN_COOKIE, refreshToken, {
    ...getCookieOptions(c),
    ...(rememberMe ? { maxAge: REFRESH_TOKEN_MAX_AGE_SECONDS } : {}),
  });
};

const clearAuthCookies = (c: Context) => {
  deleteCookie(c, ACCESS_TOKEN_COOKIE, {
    ...getCookieOptions(c),
  });

  deleteCookie(c, REFRESH_TOKEN_COOKIE, {
    ...getCookieOptions(c),
  });
};

const setOAuthStateCookie = (c: Context, nonce: string) => {
  const secure = new URL(c.req.url).protocol === "https:";
  setCookie(c, OAUTH_STATE_COOKIE, nonce, {
    httpOnly: true,
    secure,
    sameSite: "Lax",
    path: "/",
    maxAge: 10 * 60,
  });
};

const clearOAuthStateCookie = (c: Context) => {
  const secure = new URL(c.req.url).protocol === "https:";
  deleteCookie(c, OAUTH_STATE_COOKIE, {
    httpOnly: true,
    secure,
    sameSite: "Lax",
    path: "/",
  });
};

const getOAuthStateSecret = (c: Context) =>
  (c.env as any)?.OAUTH_STATE_SECRET ||
  (typeof process !== "undefined" ? process.env?.OAUTH_STATE_SECRET : undefined);

const parseJsonBody = async (c: Context) => {
  try {
    return await c.req.json();
  } catch {
    return {};
  }
};

const handleAuthError = (
  c: Context,
  error: unknown
) => {
  if (error instanceof AuthError) {
    return c.json(
      {
        success: false,
        message: error.message,
      },
      error.statusCode as ContentfulStatusCode
    );
  }

  console.error(error);

  return c.json(
    {
      success: false,
      message: "Internal server error",
    },
    500
  );
};

export const githubLogin = async (c: Context) => {
  try {
    const clientIdRaw = (c.env as any)?.GITHUB_CLIENT_ID || (typeof process !== "undefined" ? process.env?.GITHUB_CLIENT_ID : undefined);
    if (!clientIdRaw) return c.text("Error: Missing GITHUB_CLIENT_ID in environment", 500);
    const clientId = clientIdRaw.trim().replace(/^"|"$/g, "");

    const isDev = (c.env as any)?.NODE_ENV === "development" || (typeof process !== "undefined" ? process.env?.NODE_ENV === "development" : false);
    const backendBase = isDev ? "http://localhost:8787" : "https://frontieratlas-backend.morningsignal-india.workers.dev";
    const redirectUri = `${backendBase}/api/v1/auth/github/callback`;

    const stateSecret = getOAuthStateSecret(c);
    if (!stateSecret) return c.text("Error: Missing OAUTH_STATE_SECRET in environment", 500);

    const { state, nonce } = await createOAuthState(
      stateSecret,
      "github",
      c.req.query("redirect")
    );
    setOAuthStateCookie(c, nonce);

    const authUrl = new URL("https://github.com/login/oauth/authorize");
    authUrl.searchParams.set("client_id", clientId);
    authUrl.searchParams.set("redirect_uri", redirectUri);
    authUrl.searchParams.set("scope", "user:email");
    authUrl.searchParams.set("state", state);

    return c.redirect(authUrl.toString());
  } catch (error: any) {
    console.error("githubLogin error:", error);
    return c.text(`githubLogin Crash: ${error.message}`, 500);
  }
};

export const githubCallback = async (c: AuthContext) => {
  const code = c.req.query("code");
  const state = c.req.query("state");
  if (!code) return c.json({ error: "Missing authorization code" }, 400);
  if (!state) return c.json({ error: "Missing OAuth state" }, 400);

  const rawClientId = (c.env as any)?.GITHUB_CLIENT_ID || (typeof process !== "undefined" ? process.env?.GITHUB_CLIENT_ID : undefined);
  const rawClientSecret = (c.env as any)?.GITHUB_CLIENT_SECRET || (typeof process !== "undefined" ? process.env?.GITHUB_CLIENT_SECRET : undefined);
  const clientId = rawClientId?.trim().replace(/^"|"$/g, "");
  const clientSecret = rawClientSecret?.trim().replace(/^"|"$/g, "");
  const stateSecret = getOAuthStateSecret(c);
  const expectedNonce = getCookie(c, OAUTH_STATE_COOKIE);

  try {
    if (!stateSecret || !expectedNonce) throw new Error("Invalid OAuth state");
    const oauthState = await verifyOAuthState(stateSecret, state, "github", expectedNonce);
    clearOAuthStateCookie(c);
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
    });

    const tokenData: any = await tokenRes.json();
    if (!tokenRes.ok || tokenData.error) throw new Error("GitHub token exchange failed");

    const userRes = await fetch("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${tokenData.access_token}`, "User-Agent": "FrontierAtlas-Auth" },
    });

    const userData: any = await userRes.json();

    let primaryEmail = userData.email;
    if (!primaryEmail) {
      const emailRes = await fetch("https://api.github.com/user/emails", {
        headers: { Authorization: `Bearer ${tokenData.access_token}`, "User-Agent": "FrontierAtlas-Auth" },
      });
      const emails: any = await emailRes.json();
      primaryEmail = emails.find((e: any) => e.primary)?.email || emails[0]?.email;
    }

    if (!primaryEmail) throw new Error("Failed extracting email from GitHub");
    userData.email = primaryEmail;

    const result = await upsertGithubUser(c.var.prisma, userData);
    setAuthCookies(c, result.accessToken, result.refreshToken, true);

    const isDev = (c.env as any)?.NODE_ENV === "development" || (typeof process !== "undefined" ? process.env?.NODE_ENV === "development" : false);
    const frontendBase = isDev ? "http://localhost:3000" : "https://frontieratlas.co";
    return c.redirect(`${frontendBase}${oauthState.redirect}`);
  } catch (error: any) {
    clearOAuthStateCookie(c);
    console.error(error);
    const isDev = (c.env as any)?.NODE_ENV === "development" || (typeof process !== "undefined" ? process.env?.NODE_ENV === "development" : false);
    const frontendBase = isDev ? "http://localhost:3000" : "https://frontieratlas.co";
    const safeRedirect = sanitizeRedirectPath(c.req.query("redirect"));
    return c.redirect(`${frontendBase}/login?error=GitHub_Auth_Failed&redirect=${encodeURIComponent(safeRedirect)}`);
  }
};

export const googleLogin = async (c: Context) => {
  try {
    const clientIdRaw = (c.env as any)?.GOOGLE_CLIENT_ID || (typeof process !== "undefined" ? process.env?.GOOGLE_CLIENT_ID : undefined);
    if (!clientIdRaw) return c.text("Error: Missing GOOGLE_CLIENT_ID in environment", 500);
    const clientId = clientIdRaw.trim().replace(/^"|"$/g, "");

    const isDev = (c.env as any)?.NODE_ENV === "development" || (typeof process !== "undefined" ? process.env?.NODE_ENV === "development" : false);
    const backendBase = isDev ? "http://localhost:8787" : "https://frontieratlas-backend.morningsignal-india.workers.dev";
    const redirectUri = `${backendBase}/api/v1/auth/google/callback`;

    const stateSecret = getOAuthStateSecret(c);
    if (!stateSecret) return c.text("Error: Missing OAUTH_STATE_SECRET in environment", 500);

    const { state, nonce } = await createOAuthState(
      stateSecret,
      "google",
      c.req.query("redirect")
    );
    setOAuthStateCookie(c, nonce);

    const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    authUrl.searchParams.set("client_id", clientId);
    authUrl.searchParams.set("redirect_uri", redirectUri);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("scope", "openid email profile");
    authUrl.searchParams.set("access_type", "offline");
    authUrl.searchParams.set("prompt", "consent");
    authUrl.searchParams.set("state", state);

    return c.redirect(authUrl.toString());
  } catch (error: any) {
    console.error("googleLogin error:", error);
    return c.text(`googleLogin Crash: ${error.message}`, 500);
  }
};

export const googleCallback = async (c: AuthContext) => {
  const code = c.req.query("code");
  const state = c.req.query("state");
  if (!code) return c.json({ error: "Missing authorization code" }, 400);
  if (!state) return c.json({ error: "Missing OAuth state" }, 400);

  const rawClientId = (c.env as any)?.GOOGLE_CLIENT_ID || (typeof process !== "undefined" ? process.env?.GOOGLE_CLIENT_ID : undefined);
  const rawClientSecret = (c.env as any)?.GOOGLE_CLIENT_SECRET || (typeof process !== "undefined" ? process.env?.GOOGLE_CLIENT_SECRET : undefined);
  const clientId = rawClientId?.trim().replace(/^"|"$/g, "");
  const clientSecret = rawClientSecret?.trim().replace(/^"|"$/g, "");

  const isDev = (c.env as any)?.NODE_ENV === "development" || (typeof process !== "undefined" ? process.env?.NODE_ENV === "development" : false);
  const backendBase = isDev ? "http://localhost:8787" : "https://frontieratlas-backend.morningsignal-india.workers.dev";
  const redirectUri = `${backendBase}/api/v1/auth/google/callback`;
  const stateSecret = getOAuthStateSecret(c);
  const expectedNonce = getCookie(c, OAUTH_STATE_COOKIE);

  try {
    if (!stateSecret || !expectedNonce) throw new Error("Invalid OAuth state");
    const oauthState = await verifyOAuthState(stateSecret, state, "google", expectedNonce);
    clearOAuthStateCookie(c);
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId!,
        client_secret: clientSecret!,
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok) throw new Error("Google token exchange failed");

    const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const userData = await userRes.json();
    if (!userRes.ok) throw new Error("Failed connecting to Google profile");

    const result = await upsertGoogleUser(c.var.prisma, userData);

    setAuthCookies(c, result.accessToken, result.refreshToken, true);

    const isDev = (c.env as any)?.NODE_ENV === "development" || (typeof process !== "undefined" ? process.env?.NODE_ENV === "development" : false);
    const frontendBase = isDev ? "http://localhost:3000" : "https://frontieratlas.co";
    return c.redirect(`${frontendBase}${oauthState.redirect}`);
  } catch (error) {
    clearOAuthStateCookie(c);
    console.error(error);
    const isDev = (c.env as any)?.NODE_ENV === "development" || (typeof process !== "undefined" ? process.env?.NODE_ENV === "development" : false);
    const frontendBase = isDev ? "http://localhost:3000" : "https://frontieratlas.co";
    const safeRedirect = sanitizeRedirectPath(c.req.query("redirect"));
    return c.redirect(`${frontendBase}/login?error=Google_Auth_Failed&redirect=${encodeURIComponent(safeRedirect)}`);
  }
};

export const signup = async (
  c: AuthContext
) => {
  const parsed = signupSchema.safeParse(
    await parseJsonBody(c)
  );

  if (!parsed.success) {
    return c.json(
      {
        success: false,
        message: "Validation failed",
        errors:
          parsed.error.flatten().fieldErrors,
      },
      400
    );
  }

  try {
    const result = await signupUser(
      c.var.prisma,
      parsed.data
    );

    setAuthCookies(
      c,
      result.accessToken,
      result.refreshToken
    );

    return c.json(
      {
        success: true,
        message: "Signup successful",
        user: result.user,
      },
      201
    );
  } catch (error) {
    return handleAuthError(c, error);
  }
};

export const login = async (
  c: AuthContext
) => {
  const parsed = loginSchema.safeParse(
    await parseJsonBody(c)
  );

  if (!parsed.success) {
    return c.json(
      {
        success: false,
        message: "Validation failed",
        errors:
          parsed.error.flatten().fieldErrors,
      },
      400
    );
  }

  try {
    const result = await loginUser(
      c.var.prisma,
      parsed.data
    );

    setAuthCookies(
      c,
      result.accessToken,
      result.refreshToken,
      parsed.data.rememberMe
    );

    return c.json({
      success: true,
      message: "Login successful",
      user: result.user,
    });
  } catch (error) {
    return handleAuthError(c, error);
  }
};
export const logout = async (
  c: AuthContext
) => {
  try {

    await logoutUser(
      c.var.prisma,
      getCookie(c, REFRESH_TOKEN_COOKIE)
    );

    clearAuthCookies(c);

    return c.json({
      success: true,
      message: "Logout successful",
    });

  } catch (error) {
    return handleAuthError(c, error);
  }
};

export const refresh = async (
  c: AuthContext
) => {

  const parsed = refreshSchema.safeParse({
    refreshToken: getCookie(c, REFRESH_TOKEN_COOKIE),
  });

  if (!parsed.success) {
    return c.json(
      {
        success: false,
        message: "Validation failed",
        errors:
          parsed.error.flatten()
            .fieldErrors,
      },
      400
    );
  }

  try {

    const result =
      await refreshUserToken(
        c.var.prisma,
        parsed.data
      );

    setAuthCookies(
      c,
      result.accessToken,
      result.refreshToken,
      result.rememberMe
    );

    return c.json({
      success: true,
      message: "Token refreshed",
      user: result.user,
    });

  } catch (error) {

    clearAuthCookies(c);

    return handleAuthError(c, error);

  }
};

export const me = async (
  c: AuthContext
) => {

  try {

    const user =
      await getCurrentUser(
        c.var.prisma,
        c.get("userId")
      );

    return c.json({
      success: true,
      user,
    });

  } catch (error) {

    return handleAuthError(
      c,
      error
    );

  }

};

export const updateProfile = async (
  c: AuthContext
) => {
  try {
    const userId = c.get("userId");
    if (!userId) {
      return c.json({ success: false, message: "Unauthorized" }, 401);
    }
    const body = await c.req.json();
    const updated = await updateUserProfile(c.var.prisma, userId, body);
    return c.json({
      success: true,
      message: "Profile updated successfully",
      user: updated,
    });
  } catch (error) {
    return handleAuthError(c, error);
  }
};

