import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

const PROD_BACKEND = "https://frontieratlas-backend.morningsignal-india.workers.dev";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug: rawSlug } = await context.params;
  const slug = decodeURIComponent(rawSlug || "");

  if (!slug) {
    return NextResponse.json({ status: "error", message: "Slug is required" }, { status: 400 });
  }

  // 1. Try fetching directly from the backend worker
  try {
    const upstreamUrl = `${PROD_BACKEND}/api/v1/research-papers/${encodeURIComponent(slug)}`;
    const res = await fetch(upstreamUrl, {
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 60 },
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.status === "success" && data.data) {
        return NextResponse.json(data, {
          status: 200,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
          },
        });
      }
    }
  } catch (err) {
    console.warn(`Upstream fetch for slug "${slug}" failed:`, err);
  }

  // 2. Fallback: Search among available papers in case slug format differs
  try {
    const listUrl = `${PROD_BACKEND}/api/v1/research-papers?limit=100&period=all`;
    const listRes = await fetch(listUrl, { headers: { "Content-Type": "application/json" } });
    if (listRes.ok) {
      const listJson = await listRes.json();
      const papers: any[] = listJson?.data?.papers || [];
      const lowerSlug = slug.toLowerCase();
      const match = papers.find(
        (p) =>
          p.slug === slug ||
          p.slug?.toLowerCase() === lowerSlug ||
          (p.arxivId && lowerSlug.includes(p.arxivId.toLowerCase())) ||
          (p.id && String(p.id) === slug)
      );

      if (match) {
        return NextResponse.json(
          {
            status: "success",
            data: {
              ...match,
              abstract: match.abstract || "Abstract available in the full publication.",
              authors: match.authors || [],
              tasks: match.tasks || [],
              methods: match.methods || [],
              models: match.models || [],
              datasets: match.datasets || [],
              conferences: match.conferences || [],
              rankings: match.rankings || [],
              sotaClaims: match.sotaClaims || [],
              repositories: match.repositories || [],
            },
          },
          {
            status: 200,
            headers: {
              "Access-Control-Allow-Origin": "*",
              "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
            },
          }
        );
      }
    }
  } catch {}

  return NextResponse.json(
    { status: "error", message: "Paper not found", is404: true },
    { status: 404 }
  );
}
