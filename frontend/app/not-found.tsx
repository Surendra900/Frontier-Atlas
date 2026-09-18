"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import { atlasUiFont } from "@/lib/fonts";

export default function NotFound() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(2);

  useEffect(() => {
    // Decrease the countdown every second
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    // Redirect when it hits zero
    if (countdown <= 0) {
      router.push("/");
    }

    // Cleanup timer on unmount
    return () => clearInterval(timer);
  }, [countdown, router]);

  return (
    <div className={`${atlasUiFont.className} min-h-screen bg-[#F8F7F2] flex flex-col text-slate-800`}>
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Search size={32} className="text-[#F55036]" />
        </div>
        
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-4">
          Page Not Found
        </h1>
        
        <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
          The research paper, benchmark, or domain you are looking for doesn't exist or has been moved. 
          <br /><br />
          Redirecting you to the home page in <span className="font-bold text-[#F55036] font-mono">{countdown}</span> seconds...
        </p>
        
        <button
          onClick={() => router.push("/")}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white text-sm font-semibold rounded-full hover:bg-gray-800 transition-colors shadow-sm cursor-pointer"
        >
          Go to Home <ArrowRight size={16} />
        </button>
      </main>
    </div>
  );
}