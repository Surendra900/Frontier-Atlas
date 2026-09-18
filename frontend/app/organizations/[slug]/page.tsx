import OrganizationDetailClient from "@/components/domain/organizations/OrganizationDetailClient";

export const runtime = "edge";

export default async function OrganizationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <OrganizationDetailClient slug={slug} />;
}
