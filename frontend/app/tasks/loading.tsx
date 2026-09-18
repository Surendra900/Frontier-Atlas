import Navbar from "@/components/Navbar";

export default function Loading() {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#F8F7F2] text-[#111111]">
      <Navbar />
      <div className="flex-1 overflow-y-auto overflow-x-hidden hide-scroll flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F55036]" />
      </div>
    </div>
  );
}
