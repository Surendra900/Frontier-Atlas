import { Suspense } from "react";
import SearchPageContent from "./SearchPageContent";

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8F7F2] text-[#111111]">Loading...</div>}>
      <SearchPageContent />
    </Suspense>
  );
}
