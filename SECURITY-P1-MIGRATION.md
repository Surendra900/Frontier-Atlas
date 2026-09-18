# FrontierAtlas — Priority-1 Security Hardening

This update addresses the four Priority-1 security findings identified during the code audit. No production credentials are included in this package.

## Fixed in code

1. **OAuth CSRF protection**
   - Google and GitHub login now use a short-lived signed `state` value.
   - The callback verifies the state, provider, expiry, and a sanitized internal redirect path.

2. **Refresh-token storage**
   - New refresh tokens are stored as SHA-256 digests rather than raw JWTs.
   - Refresh-token rotation and logout hash the supplied token before database lookup/deletion.
   - The raw refresh token is never returned by the refresh API response body.

3. **Image proxy SSRF protection**
   - Only HTTPS URLs from the explicitly allowed image hosts are fetched.
   - Credentials in URLs and non-HTTPS ports are rejected.
   - Redirects are limited and each redirect target is validated against the same allowlist.
   - Only supported image MIME types are returned.
   - A 10 MB response limit is enforced.

4. **Credential exposure in example environment files**
   - Concrete database connection strings were removed from `.env.example` and `.dev.vars.example`.
   - Only placeholders remain.

## One-time production action required

The previous application stored refresh JWTs in plaintext. The new code stores hashes, so existing plaintext refresh-token rows are intentionally invalidated rather than migrated in plaintext.

Before deploying the hardened authentication code, run this command against the intended database:

```bash
cd backend
npm run security:revoke-refresh-tokens
```

This logs out existing sessions and forces users to sign in again. Afterward, all newly issued refresh tokens are stored as SHA-256 digests.

## Required production secrets

Make sure the Worker has valid values for:

- `DATABASE_URL`
- `OAUTH_STATE_SECRET`
- `JWT_REFRESH_SECRET`
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` if Google OAuth is enabled
- `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` if GitHub OAuth is enabled

Do not place these values in Git, `.env.example`, `.dev.vars.example`, screenshots, or issue comments.

## OAuth provider configuration

The Google and GitHub callback URLs remain the existing FrontierAtlas callback endpoints. No provider-side callback URL change is required solely because of the `state` parameter; `state` is supplied dynamically during authorization.


## P1 final deployment requirements

- Set a dedicated `OAUTH_STATE_SECRET` in the backend/Cloudflare Worker environment. Do not reuse the access-token secret.
- Existing refresh-token rows created before this hardening may contain plaintext tokens. Run `npm run security:revoke-refresh-tokens` once against production so all legacy sessions are invalidated.
- Refresh-token rotation now reads the HttpOnly refresh cookie only; clients must not send a refresh token in JSON.
- OAuth uses a signed, short-lived state containing a nonce plus an HttpOnly `SameSite=Lax` nonce cookie. The callback requires both to match before exchanging the authorization code.
- Keep real `.env`, `.dev.vars`, OAuth secrets, database URLs, and API keys out of Git. The committed examples contain placeholders only.
