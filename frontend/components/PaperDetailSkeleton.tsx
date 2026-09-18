export default function PaperDetailSkeleton() {
  return (
    <div className="min-h-screen bg-[#F8F7F2] text-[#171717] tracking-tight">
      <div className="mx-auto w-full max-w-[1440px] px-4 py-5 sm:px-6 md:px-12 lg:px-16 lg:py-6">
        {/* Breadcrumb */}
        <div className="mb-5 lg:mb-6 flex items-center gap-2">
          <div className="h-3 w-12 bg-[#E4E0D8] rounded animate-pulse" />
          <span className="text-[#DCDCD7]">/</span>
          <div className="h-3 w-14 bg-[#E4E0D8] rounded animate-pulse" />
          <span className="text-[#DCDCD7]">/</span>
          <div className="h-3 w-16 bg-[#E4E0D8] rounded animate-pulse" />
        </div>

        {/* Grid: Main + Sidebar */}
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1fr_320px] xl:gap-10">
          {/* ===== MAIN CONTENT ===== */}
          <main className="space-y-8 lg:space-y-10 min-w-0">

            {/* HEADER */}
            <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex-1 space-y-4">
                {/* Badge row */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="h-6 w-20 bg-[#E4E0D8] rounded-full animate-pulse" />
                  <div className="h-6 w-28 bg-[#E4E0D8] rounded-full animate-pulse" />
                </div>

                {/* Title */}
                <div className="space-y-2.5">
                  <div className="h-[38px] bg-[#E4E0D8] rounded w-[92%] animate-pulse" />
                  <div className="h-[38px] bg-[#E4E0D8] rounded w-[72%] animate-pulse" />
                  <div className="h-[38px] bg-[#E4E0D8] rounded w-[54%] animate-pulse" />
                </div>

                {/* Authors */}
                <div className="flex flex-wrap items-center gap-x-2">
                  <div className="h-4 w-28 bg-[#E4E0D8] rounded animate-pulse" />
                  <span className="text-[#DCDCD7]">·</span>
                  <div className="h-4 w-24 bg-[#E4E0D8] rounded animate-pulse" />
                  <span className="text-[#DCDCD7]">·</span>
                  <div className="h-4 w-20 bg-[#E4E0D8] rounded animate-pulse" />
                  <div className="h-4 w-16 bg-[#E4E0D8] rounded ml-1 animate-pulse" />
                </div>

                {/* Stats bar */}
                <div className="flex flex-wrap items-center gap-x-5 pt-1">
                  <div className="h-5 w-28 bg-[#E4E0D8] rounded animate-pulse" />
                  <div className="h-5 w-24 bg-[#E4E0D8] rounded animate-pulse" />
                  <div className="h-5 w-20 bg-[#E4E0D8] rounded animate-pulse" />
                  <div className="h-5 w-24 bg-[#E4E0D8] rounded animate-pulse" />
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <div className="h-11 w-28 bg-[#E4E0D8] rounded-full animate-pulse" />
                  <div className="h-11 w-24 bg-[#E4E0D8] rounded-full animate-pulse" />
                  <div className="h-11 w-28 bg-[#E4E0D8] rounded-full animate-pulse" />
                  <div className="h-11 w-36 bg-[#E4E0D8] rounded-full animate-pulse" />
                  <div className="h-11 w-11 bg-[#E4E0D8] rounded-full animate-pulse" />
                  <div className="h-11 w-11 bg-[#E4E0D8] rounded-full animate-pulse" />
                </div>
              </div>

              {/* Preview thumbnail */}
              <div className="block w-full lg:w-[220px] shrink-0">
                <div className="aspect-[3/4] bg-[#EFECE6] rounded overflow-hidden animate-pulse" />
              </div>
            </div>

            {/* ABSTRACT */}
            <div className="flex flex-col gap-3">
              <div className="h-[14px] w-28 bg-[#E4E0D8] rounded animate-pulse" />
              <div className="space-y-2">
                <div className="h-[18px] bg-[#E4E0D8] rounded w-full animate-pulse" />
                <div className="h-[18px] bg-[#E4E0D8] rounded w-full animate-pulse" />
                <div className="h-[18px] bg-[#E4E0D8] rounded w-[88%] animate-pulse" />
                <div className="h-[18px] bg-[#E4E0D8] rounded w-[94%] animate-pulse" />
                <div className="h-[18px] bg-[#E4E0D8] rounded w-[72%] animate-pulse" />
                <div className="h-[18px] bg-[#E4E0D8] rounded w-[96%] animate-pulse" />
                <div className="h-[18px] bg-[#E4E0D8] rounded w-[64%] animate-pulse" />
              </div>
            </div>

            {/* RESEARCH TAXONOMY */}
            <div className="flex flex-col gap-5">
              <div className="h-[14px] w-56 bg-[#E4E0D8] rounded animate-pulse" />

              {/* TASKS */}
              <div className="flex flex-col gap-3">
                <div className="h-3 w-16 bg-[#E4E0D8] rounded animate-pulse" />
                <div className="flex flex-wrap gap-1.5">
                  <div className="h-6 w-28 bg-[#E4E0D8] rounded-[4px] animate-pulse" />
                  <div className="h-6 w-36 bg-[#E4E0D8] rounded-[4px] animate-pulse" />
                  <div className="h-6 w-24 bg-[#E4E0D8] rounded-[4px] animate-pulse" />
                  <div className="h-6 w-20 bg-[#E4E0D8] rounded-[4px] animate-pulse" />
                </div>
              </div>

              {/* METHODS */}
              <div className="flex flex-col gap-3">
                <div className="h-3 w-20 bg-[#E4E0D8] rounded animate-pulse" />
                <div className="flex flex-wrap gap-1.5">
                  <div className="h-6 w-32 bg-[#E4E0D8] rounded-[4px] animate-pulse" />
                  <div className="h-6 w-24 bg-[#E4E0D8] rounded-[4px] animate-pulse" />
                  <div className="h-6 w-28 bg-[#E4E0D8] rounded-[4px] animate-pulse" />
                </div>
              </div>

              {/* MODELS */}
              <div className="flex flex-col gap-3">
                <div className="h-3 w-16 bg-[#E4E0D8] rounded animate-pulse" />
                <div className="flex flex-wrap gap-1.5">
                  <div className="h-6 w-40 bg-[#E4E0D8] rounded-[4px] animate-pulse" />
                  <div className="h-6 w-28 bg-[#E4E0D8] rounded-[4px] animate-pulse" />
                  <div className="h-6 w-20 bg-[#E4E0D8] rounded-[4px] animate-pulse" />
                </div>
              </div>

              {/* DATASETS */}
              <div className="flex flex-col gap-3">
                <div className="h-3 w-20 bg-[#E4E0D8] rounded animate-pulse" />
                <div className="flex flex-wrap gap-1.5">
                  <div className="h-6 w-36 bg-[#E4E0D8] rounded-[4px] animate-pulse" />
                  <div className="h-6 w-24 bg-[#E4E0D8] rounded-[4px] animate-pulse" />
                  <div className="h-6 w-32 bg-[#E4E0D8] rounded-[4px] animate-pulse" />
                </div>
              </div>
            </div>

            {/* BENCHMARKS */}
            <div className="flex flex-col gap-3">
              <div className="h-[14px] w-32 bg-[#E4E0D8] rounded animate-pulse" />
              <div className="border border-[#EDE8DF] rounded-lg overflow-hidden">
                <div className="bg-[#EFECE6] p-3">
                  <div className="h-3 w-36 bg-[#E4E0D8] rounded animate-pulse" />
                </div>
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-6 p-3 border-t border-[#EDE8DF]">
                    <div className="h-[15px] w-14 bg-[#E4E0D8] rounded animate-pulse shrink-0" />
                    <div className="h-[15px] w-44 bg-[#E4E0D8] rounded animate-pulse" />
                    <div className="h-[15px] w-20 bg-[#E4E0D8] rounded animate-pulse ml-auto" />
                  </div>
                ))}
              </div>
            </div>

            {/* RELATED PAPERS */}
            <div className="border-t border-[#ECE7DD] pt-6">
              <div className="h-[14px] w-44 bg-[#E4E0D8] rounded mb-3.5 animate-pulse" />
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex flex-col border border-[#EDE8DF] bg-white overflow-hidden">
                    <div className="w-full aspect-[3/2] bg-[#EFECE6] animate-pulse" />
                    <div className="p-3.5 space-y-2">
                      <div className="h-3 bg-[#E4E0D8] rounded w-full animate-pulse" />
                      <div className="h-3 bg-[#E4E0D8] rounded w-[70%] animate-pulse" />
                      <div className="h-2.5 bg-[#E4E0D8] rounded w-[45%] animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Back link */}
            <div className="border-t border-[#E5E5E0] pt-3.5">
              <div className="h-3 w-28 bg-[#E4E0D8] rounded animate-pulse" />
            </div>
          </main>

          {/* ===== SIDEBAR ===== */}
          <aside className="space-y-5 xl:sticky xl:top-6 self-start">
            {/* Repository Panel */}
            <div className="border border-[#EDE8DF] rounded-lg bg-white p-4 space-y-3">
              <div className="h-[14px] w-28 bg-[#E4E0D8] rounded animate-pulse" />
              <div className="space-y-1.5">
                <div className="h-3 bg-[#E4E0D8] rounded w-full animate-pulse" />
                <div className="h-3 bg-[#E4E0D8] rounded w-[65%] animate-pulse" />
              </div>
              <div className="h-10 w-full bg-[#E4E0D8] rounded-lg animate-pulse" />
              <div className="h-3 bg-[#E4E0D8] rounded w-[55%] animate-pulse" />
            </div>

            {/* Citation Panel */}
            <div className="border border-[#EDE8DF] rounded-lg bg-white p-4 space-y-3">
              <div className="h-[14px] w-20 bg-[#E4E0D8] rounded animate-pulse" />
              <div className="h-8 w-full bg-[#E4E0D8] rounded-lg animate-pulse" />
              <div className="h-8 w-full bg-[#E4E0D8] rounded-lg animate-pulse" />
              <div className="h-3 w-1/2 bg-[#E4E0D8] rounded animate-pulse" />
            </div>

            {/* Metadata Panel */}
            <div className="border border-[#EDE8DF] rounded-lg bg-white divide-y divide-[#EDE8DF]">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3">
                  <div className="h-3 w-16 bg-[#E4E0D8] rounded animate-pulse" />
                  <div className="h-3 w-24 bg-[#E4E0D8] rounded animate-pulse" />
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
