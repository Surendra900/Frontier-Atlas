"use client";

import { Github } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";

export default function SocialButtons() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");
  const targetRedirect = pathname === "/login"
    ? (redirectParam && redirectParam.startsWith("/") && !redirectParam.startsWith("//") ? redirectParam : "/")
    : `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
  const redirectQuery = `?redirect=${encodeURIComponent(targetRedirect)}`;
  const apiBase = process.env.NODE_ENV === "development"
    ? "http://localhost:8787"
    : (process.env.NEXT_PUBLIC_API_URL || "https://frontieratlas-backend.morningsignal-india.workers.dev");

  return (
    <div className="grid grid-cols-2 gap-3">
      <a
        href={`${apiBase}/api/v1/auth/google${redirectQuery}`}
        className="h-11 rounded-xl border border-[#DDD8CE] bg-white hover:bg-[#FAFAFA] transition flex items-center justify-center gap-2 font-semibold text-[#111]"
      >
        <img
          src="https://www.svgrepo.com/show/475656/google-color.svg"
          alt="Google"
          className="w-5 h-5"
        />

        Google
      </a>

      <a
        href={`${apiBase}/api/v1/auth/github${redirectQuery}`}
        className="h-11 rounded-xl border border-[#DDD8CE] bg-white hover:bg-[#FAFAFA] transition flex items-center justify-center gap-2 font-semibold text-[#111]"
      >
        <Github size={18} />

        GitHub
      </a>
    </div>
  );
}