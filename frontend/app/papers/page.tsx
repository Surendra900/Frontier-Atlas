import HomeContent from "@/components/HomeContent";
import { getPapers } from "@/lib/paperApi";

export const runtime = "edge";
export const dynamic = 'force-dynamic';

export default async function PapersPage() {
  try {
    const initialPapers = await getPapers({ page: 1, sort: "trending", period: "today" });
    return <HomeContent initialPapers={initialPapers} initialPeriod="Today" />;
  } catch (error) {
    console.error("Failed to load initial papers:", error);
    return (
      <HomeContent
        initialPapers={null}
        initialPeriod="Today"
        initialError="Failed to load papers. Please try again later."
      />
    );
  }
}
