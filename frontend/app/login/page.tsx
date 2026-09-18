import { Suspense } from "react";
import AuthCard from "@/components/auth/AuthCard";

export default function LoginPage() {
  return (
    <main className="h-screen overflow-hidden bg-[#F7F4EC] flex items-center justify-center px-6">
      <Suspense fallback={<div className="w-full max-w-[400px] text-center text-[#666]">Loading...</div>}>
        <AuthCard />
      </Suspense>
    </main>
  );
}
