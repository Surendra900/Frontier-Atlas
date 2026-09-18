# FrontierAtlas — P1 Security Status

This package contains the final P1 hardening pass applied to the supplied FrontierAtlas P1-Hardened source.

## P1 controls

- [x] OAuth CSRF protection for Google and GitHub
  - short-lived signed state
  - provider binding
  - safe internal redirect validation
  - cryptographic nonce bound to an HttpOnly `SameSite=Lax` cookie
  - callback rejects missing/mismatched state or nonce before code exchange
- [x] Refresh tokens protected at rest
  - only SHA-256 digests are stored in `refresh_tokens.token`
  - rotation deletes the old digest and stores the new digest atomically
  - refresh endpoint accepts the token from the HttpOnly cookie only
- [x] Image proxy SSRF controls
  - HTTPS only
  - no userinfo or non-443 ports
  - explicit hostname allowlist
  - redirect targets are revalidated and limited
  - supported image MIME types only
  - 10 MiB response limit
  - `X-Content-Type-Options: nosniff`
- [x] Credential hygiene in committed examples
  - `.env.example` and `.dev.vars.example` contain placeholders only
  - dedicated `OAUTH_STATE_SECRET` is documented
- [x] Next.js login build blocker from `useSearchParams()`
  - `AuthCard` is rendered inside a `Suspense` boundary on `/login`

## Production migration

Before deploying this package:

1. Configure a strong random `OAUTH_STATE_SECRET` in the Cloudflare Worker environment.
2. Configure the existing `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` as strong random secrets.
3. Run `npm run security:revoke-refresh-tokens` once against production to invalidate any refresh-token rows created before hashing was deployed.
4. Do not commit real database URLs, OAuth client secrets, JWT secrets, or API keys.

## Validation performed on this package

- Modified TypeScript/TSX files were transpile-parsed successfully with TypeScript 5.x tooling available in the validation environment.
- Static checks confirmed there is no JSON-body refresh-token fallback and no OAuth-state use of `JWT_ACCESS_SECRET`.
- Repository scan found no credential-bearing PostgreSQL URLs, private keys, AWS access keys, GitHub PATs, or obvious API-key literals outside placeholder examples.
- A full `npm run build` could not be completed in the isolated validation environment because dependency installation was unavailable; this is an environment limitation, not a reported source error.
