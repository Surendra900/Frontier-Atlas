import { NextRequest, NextResponse } from "next/server";
import { resolvePaperBySlug } from "@/lib/paper-resolver";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug: rawSlug } = await context.params;
  const slug = decodeURIComponent(rawSlug || "");

  if (!slug) {
    return NextResponse.json({ status: "error", message: "Slug is required" }, { status: 400 });
  }

  const paper = await resolvePaperBySlug(slug);

  if (paper) {
    return NextResponse.json(
      {
        status: "success",
        data: paper,
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

  return NextResponse.json(
    { status: "error", message: "Paper not found", is404: true },
    { status: 404 }
  );
}
