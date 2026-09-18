import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

export default function Loading() {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#F8F7F2] text-[#111111]">
      <Navbar />
      <div className="flex-1 overflow-y-auto overflow-x-hidden hide-scroll flex flex-col">
        {/* Hero placeholder */}
        <div className="w-full max-w-[1600px] mx-auto px-4 md:px-8 xl:px-12 pt-6">
          <div className="w-full h-[180px] rounded-[16px] bg-[#EFEDE6] animate-pulse border border-[#E5E5E0]" />
        </div>
        <div className="w-full max-w-[1600px] mx-auto px-4 md:px-8 xl:px-12 pt-6 pb-20 flex items-start gap-4 xl:gap-5">
          <div className="hidden xl:block w-[240px] shrink-0 sticky top-3 h-[calc(100vh-80px)]">
            <Sidebar initialActive="Loading..." />
          </div>
          <main className="flex-1 min-w-0 xl:max-w-[1380px]">
            {/* Period tabs skeleton */}
            <div className="flex items-center gap-2 mb-6">
              <div className="h-9 w-24 bg-[#EFEDE6] rounded-md animate-pulse" />
              <div className="h-9 w-24 bg-[#EFEDE6] rounded-md animate-pulse" />
            </div>
            {/* Paper card skeletons */}
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
          </main>
        </div>
      </div>
    </div>
  );
}
