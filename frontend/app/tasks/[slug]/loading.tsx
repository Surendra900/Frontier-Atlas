import Navbar from "@/components/Navbar";

export default function Loading() {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#F8F7F2] text-[#111111]">
      <Navbar />
      <div className="flex-1 overflow-y-auto overflow-x-hidden hide-scroll flex flex-col">
        <div className="w-full max-w-[1600px] mx-auto px-6 md:px-10 xl:px-14 py-8">
          {/* Breadcrumb skeleton */}
          <div className="flex items-center gap-2 mb-8">
            <div className="h-4 w-10 bg-[#EFEDE6] rounded animate-pulse" />
            <span className="text-[#ccc]">/</span>
            <div className="h-4 w-12 bg-[#EFEDE6] rounded animate-pulse" />
            <span className="text-[#ccc]">/</span>
            <div className="h-4 w-28 bg-[#EFEDE6] rounded animate-pulse" />
          </div>

          {/* Hero skeleton */}
          <div className="max-w-[720px]">
            <div className="h-4 w-12 bg-[#EFEDE6] rounded animate-pulse mb-3" />
            <div className="h-[72px] w-[400px] max-w-full bg-[#EFEDE6] rounded animate-pulse mb-8" />
            <div className="space-y-2 mb-10">
              <div className="h-4 w-full bg-[#EFEDE6] rounded animate-pulse" />
              <div className="h-4 w-11/12 bg-[#EFEDE6] rounded animate-pulse" />
              <div className="h-4 w-9/12 bg-[#EFEDE6] rounded animate-pulse" />
            </div>
            <div className="flex gap-12">
              <div className="h-5 w-24 bg-[#EFEDE6] rounded animate-pulse" />
              <div className="h-5 w-28 bg-[#EFEDE6] rounded animate-pulse" />
            </div>
          </div>
        </div>

        {/* Papers skeleton */}
        <div className="w-full px-8 md:px-12 xl:px-16 pt-4 pb-12">
          <div className="flex gap-2 mb-6">
            <div className="h-9 w-24 bg-[#EFEDE6] rounded-md animate-pulse" />
            <div className="h-9 w-24 bg-[#EFEDE6] rounded-md animate-pulse" />
          </div>
          <div className="flex flex-col gap-0">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col xl:flex-row gap-4 xl:gap-5 p-3 sm:p-4 xl:pt-2 xl:pb-2 border-b border-[#E5E5E0] animate-pulse">
                <div className="flex-1 min-w-0 flex flex-col">
                  <div className="h-5 bg-[#EFEDE6] rounded mb-2 w-10/12" />
                  <div className="h-4 bg-[#EFEDE6] rounded mb-2 w-7/12" />
                  <div className="h-4 bg-[#EFEDE6] rounded mb-2 w-full" />
                  <div className="h-4 bg-[#EFEDE6] rounded mb-4 w-9/12" />
                  <div className="flex gap-2">
                    <div className="h-6 w-20 bg-[#EFEDE6] rounded" />
                    <div className="h-6 w-28 bg-[#EFEDE6] rounded" />
                  </div>
                </div>
                <div className="w-[150px] sm:w-[180px] xl:w-[200px] aspect-[4/5] shrink-0 bg-[#EFEDE6] order-first xl:order-last" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
