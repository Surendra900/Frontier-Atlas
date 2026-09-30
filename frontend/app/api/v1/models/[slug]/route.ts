import { NextRequest, NextResponse } from "next/server";
import { getModelDetailFromDb } from "@/lib/models-db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  if (!slug) {
    return NextResponse.json({ status: "error", message: "Model slug required" }, { status: 400 });
  }

  try {
    const model = await getModelDetailFromDb(slug);
    if (!model) {
      return NextResponse.json({ status: "error", message: "Model not found" }, { status: 404 });
    }

    return NextResponse.json({
      status: "success",
      data: model,
    }, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=1200",
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal Server Error";
    console.error("Single Model API Error:", msg);
    return NextResponse.json(
      { status: "error", message: msg },
      { status: 500 }
    );
  }
}
