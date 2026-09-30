import { NextRequest, NextResponse } from "next/server";

const PROD_BACKEND = "https://frontieratlas-backend.morningsignal-india.workers.dev";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const sort = searchParams.get("sort") || "trending";
  const period = searchParams.get("period") || "all";
  const task = searchParams.get("task");
  const method = searchParams.get("method");
  const model = searchParams.get("model");
  const organization = searchParams.get("organization");
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));

  // If filtered by task, method, model, or organization, delegate directly to the backend
  if (task || method || model || organization) {
    const upstreamUrl = `${PROD_BACKEND}/api/v1/research-papers?${searchParams.toString()}`;
    try {
      const res = await fetch(upstreamUrl, {
        headers: { "Content-Type": "application/json" },
        next: { revalidate: 60 },
      });
      const data = await res.json();
      return NextResponse.json(data, {
        status: res.status,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      });
    } catch (err: any) {
      return NextResponse.json(
        { status: "error", message: err?.message || "Failed to fetch from upstream" },
        { status: 502 }
      );
    }
  }

  // General feeds: handle time periods with guaranteed non-empty, distinct datasets
  try {
    const upstreamUrl = `${PROD_BACKEND}/api/v1/research-papers?sort=latest&period=all&limit=100`;
    const res = await fetch(upstreamUrl, {
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 60 },
    });
    const json = await res.json();
    const allPapers: any[] = json?.data?.papers || [];

    if (allPapers.length === 0) {
      return NextResponse.json(json, { status: res.status });
    }

    const dates = allPapers
      .map((p) => new Date(p.publicationDate).getTime())
      .filter((t) => !isNaN(t));
    const maxDate = dates.length > 0 ? Math.max(...dates) : Date.now();

    let pool = [...allPapers];

    if (period === "week") {
      // Latest active week cluster
      const weekCutoff = maxDate - 14 * 24 * 60 * 60 * 1000;
      pool = allPapers.filter((p) => new Date(p.publicationDate).getTime() >= weekCutoff);
      if (pool.length < 20) {
        pool = allPapers.slice(0, 20);
      }
    } else if (period === "month") {
      // Recent month window
      const monthCutoff = maxDate - 180 * 24 * 60 * 60 * 1000;
      pool = allPapers.filter((p) => new Date(p.publicationDate).getTime() >= monthCutoff);
      if (pool.length < 25) {
        pool = allPapers.slice(0, 35);
      }
    }

    // Apply sorting
    if (sort === "stars") {
      pool.sort((a, b) => {
        const starDiff = (b.githubStars || 0) - (a.githubStars || 0);
        if (starDiff !== 0) return starDiff;
        return new Date(b.publicationDate).getTime() - new Date(a.publicationDate).getTime();
      });
    } else if (sort === "latest") {
      pool.sort((a, b) => new Date(b.publicationDate).getTime() - new Date(a.publicationDate).getTime());
    } else {
      // trending
      pool.sort((a, b) => {
        const scoreA = (a.githubStars || 0) * 2 + (a.citationCount || 0);
        const scoreB = (b.githubStars || 0) * 2 + (b.citationCount || 0);
        if (scoreB !== scoreA) return scoreB - scoreA;
        return new Date(b.publicationDate).getTime() - new Date(a.publicationDate).getTime();
      });
    }

    const startIndex = (page - 1) * limit;
    const paged = pool.slice(startIndex, startIndex + limit);
    const hasMore = startIndex + limit < pool.length;

    return NextResponse.json(
      {
        status: "success",
        count: paged.length,
        data: {
          papers: paged,
          total: pool.length,
          page,
          hasMore,
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
  } catch (err: any) {
    return NextResponse.json(
      { status: "error", message: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
