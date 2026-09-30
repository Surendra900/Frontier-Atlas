import { NextResponse } from "next/server";
import { getHubFacetsFromDb } from "@/lib/models-db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const facets = await getHubFacetsFromDb();
    return NextResponse.json(
      {
        status: "success",
        data: facets,
      },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=1200",
        },
      }
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal Server Error";
    console.error("Models Facets API Error:", msg);
    return NextResponse.json(
      { status: "error", message: msg },
      { status: 500 }
    );
  }
}
