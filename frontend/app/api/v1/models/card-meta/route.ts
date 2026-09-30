import { NextRequest, NextResponse } from "next/server";
import { getCardMetaFromDb } from "@/lib/models-db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = (searchParams.get("slug") || "all").toLowerCase().trim();

  try {
    const data = await getCardMetaFromDb(slug);
    return NextResponse.json({
      status: "success",
      data,
    }, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600",
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal Server Error";
    console.error("Card Meta API Error:", msg);
    return NextResponse.json(
      { status: "error", message: msg },
      { status: 500 }
    );
  }
}
