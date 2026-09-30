import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://neondb_owner:npg_nX6E8qZiDTPB@ep-jolly-dust-ao1w94qg-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";

const sql = neon(DATABASE_URL);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = (searchParams.get("slug") || "all").toLowerCase().trim();

  try {
    if (slug === "all" || slug === "models" || slug === "") {
      const res = (await sql.query("SELECT COUNT(*) as cnt FROM models")) as Array<{ cnt: string }>;
      return NextResponse.json({
        status: "success",
        data: {
          slug: "all",
          title: "All AI Models",
          type: "catalog",
          description: "Browse and compare 460+ foundational and fine-tuned AI models across pricing, context windows, capabilities, and underlying research papers.",
          totalModels: parseInt(res[0]?.cnt || "0", 10),
        },
      });
    }

    // 1. Try matching Vendor
    const vendorRes = (await sql.query(
      `SELECT vendor, COUNT(*) as cnt FROM models 
       WHERE LOWER(vendor) = $1 OR LOWER(REPLACE(vendor, ' ', '-')) = $1 
       GROUP BY vendor`,
      [slug]
    )) as Array<{ vendor: string; cnt: string }>;
    if (vendorRes.length > 0) {
      const vendorName = vendorRes[0].vendor;
      return NextResponse.json({
        status: "success",
        data: {
          slug,
          title: `${vendorName} Models`,
          type: "vendor",
          description: `Comprehensive specifications, token pricing, context lengths, and academic papers for models built by ${vendorName}.`,
          totalModels: parseInt(vendorRes[0].cnt, 10),
        },
      });
    }

    // 2. Try matching Model Family
    const familyRes = (await sql.query(
      `SELECT model_family, COUNT(*) as cnt FROM models 
       WHERE LOWER(model_family) = $1 OR LOWER(REPLACE(model_family, ' ', '-')) = $1 
       GROUP BY model_family`,
      [slug]
    )) as Array<{ model_family: string; cnt: string }>;
    if (familyRes.length > 0) {
      const familyName = familyRes[0].model_family;
      return NextResponse.json({
        status: "success",
        data: {
          slug,
          title: `${familyName} Models`,
          type: "family",
          description: `All variants, generations, and context lengths belonging to the ${familyName} architecture family mapped to research papers.`,
          totalModels: parseInt(familyRes[0].cnt, 10),
        },
      });
    }

    // 3. Try matching Capability
    const capRes = (await sql.query(
      `SELECT COUNT(*) as cnt FROM models WHERE capabilities @> to_jsonb(ARRAY[$1]::text[])`,
      [slug]
    )) as Array<{ cnt: string }>;
    const capCount = parseInt(capRes[0]?.cnt || "0", 10);
    if (capCount > 0) {
      const formattedTitle = slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, " ");
      return NextResponse.json({
        status: "success",
        data: {
          slug,
          title: `${formattedTitle} Models`,
          type: "capability",
          description: `Compare state-of-the-art models specialized in ${formattedTitle}, featuring real-world performance metrics, costs, and papers.`,
          totalModels: capCount,
        },
      });
    }

    // 4. Try matching Category
    const catRes = (await sql.query(
      `SELECT category, COUNT(*) as cnt FROM models 
       WHERE LOWER(category) = $1 OR LOWER(REPLACE(category, ' ', '-')) = $1 
       GROUP BY category`,
      [slug]
    )) as Array<{ category: string; cnt: string }>;
    if (catRes.length > 0) {
      const catName = catRes[0].category;
      return NextResponse.json({
        status: "success",
        data: {
          slug,
          title: `${catName} Models`,
          type: "category",
          description: `Leading AI models in the ${catName} domain, ranked by benchmark performance and community adoption.`,
          totalModels: parseInt(catRes[0].cnt, 10),
        },
      });
    }

    // 5. Try matching individual Model
    const modelRes = (await sql.query(
      `SELECT name, vendor, description FROM models WHERE slug = $1`,
      [slug]
    )) as Array<{ name: string; vendor: string; description: string }>;
    if (modelRes.length > 0) {
      const m = modelRes[0];
      return NextResponse.json({
        status: "success",
        data: {
          slug,
          title: m.name,
          type: "model",
          description: m.description,
          totalModels: 1,
        },
      });
    }

    // Fallback default
    const formattedTitle = slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, " ");
    return NextResponse.json({
      status: "success",
      data: {
        slug,
        title: `${formattedTitle} AI Models`,
        type: "general",
        description: `Explore frontier AI models, pricing specifications, and mapped research papers for ${formattedTitle}.`,
        totalModels: 0,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ status: "error", message: msg }, { status: 500 });
  }
}

