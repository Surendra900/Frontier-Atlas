import { sign, verify } from "hono/jwt";

export type OAuthProvider = "google" | "github";

export type OAuthStatePayload = {
  provider: OAuthProvider;
  redirect: string;
  nonce: string;
  exp: number;
};

const STATE_TTL_SECONDS = 10 * 60;

export const OAUTH_STATE_COOKIE = "oauth_state";

export const sanitizeRedirectPath = (value?: string | null) => {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/";
  }

  return value;
};

export const createOAuthState = async (
  secret: string,
  provider: OAuthProvider,
  redirect?: string | null
) => {
  const nonce = crypto.randomUUID();
  const payload: OAuthStatePayload = {
    provider,
    redirect: sanitizeRedirectPath(redirect),
    nonce,
    exp: Math.floor(Date.now() / 1000) + STATE_TTL_SECONDS,
  };

  return {
    state: await sign(payload, secret, "HS256"),
    nonce,
  };
};

export const verifyOAuthState = async (
  secret: string,
  state: string,
  provider: OAuthProvider,
  expectedNonce: string
) => {
  const payload = await verify(state, secret, "HS256");

  if (
    payload.provider !== provider ||
    typeof payload.redirect !== "string" ||
    typeof payload.nonce !== "string" ||
    payload.nonce !== expectedNonce
  ) {
    throw new Error("Invalid OAuth state");
  }

  return {
    provider,
    redirect: sanitizeRedirectPath(payload.redirect),
  };
};
