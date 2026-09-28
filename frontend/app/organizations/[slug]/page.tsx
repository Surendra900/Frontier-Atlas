import OrganizationDetailClient from "@/components/domain/organizations/OrganizationDetailClient";

export const runtime = "edge";

export default async function OrganizationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const rawSlug = resolvedParams?.slug;
  const safeSlug = typeof rawSlug === "string" ? rawSlug.trim() : "";

  return <OrganizationDetailClient slug={safeSlug} />;
}