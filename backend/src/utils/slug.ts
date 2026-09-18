export function buildDeterministicSlug(title: string, disambiguator?: string): string {
  const base = title
    .toLowerCase()
    .normalize("NFKD").replace(/[\u0300-\u036f]/g, "") // strip accents
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .substring(0, 80);
  return disambiguator ? `${base}-${disambiguator}` : base;
}

export function normalizeArxivId(id?: string | null): string | null {
  if (!id) return null;
  return id.trim().replace(/v\d+$/i, "");
}

export function hashDisambiguator(title: string | undefined | null, paperUrl: string | undefined | null, suffix: string = ""): string {
  const strToHash = `${title || ""}:${paperUrl || ""}${suffix ? ':' + suffix : ''}`;
  let hash = 0;
  for (let i = 0; i < strToHash.length; i++) {
    hash = ((hash << 5) - hash) + strToHash.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}
