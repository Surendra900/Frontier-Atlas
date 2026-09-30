"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type ProfileUser = {
  name?: string;
  displayName?: string;
  username?: string;
  email?: string;
  avatarUrl?: string;
  image?: string;
  createdAt?: string;
};

function getApiBase() {
  const defaultApiUrl =
    "https://frontieratlas-backend.morningsignal-india.workers.dev";
  if (process.env.NODE_ENV === "development") return "";
  return (process.env.NEXT_PUBLIC_API_URL || defaultApiUrl).replace(/\/$/, "");
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [needsLogin, setNeedsLogin] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${getApiBase()}/api/v1/auth/me`, {
          credentials: "include",
        });
        if (res.status === 401) {
          setNeedsLogin(true);
          return;
        }
        if (!res.ok) throw new Error("Failed to load profile");
        const data = await res.json();
        setUser(data?.user ?? data?.data ?? data);
      } catch {
        setNeedsLogin(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch(`${getApiBase()}/api/v1/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // ignore — still log out locally
    }
    window.dispatchEvent(new Event("authchange"));
    router.push("/");
    router.refresh();
  };

  const displayName =
    user?.name || user?.displayName || user?.username || "Your profile";
  const initial = (displayName || "U").charAt(0).toUpperCase();

  return (
    <main className="min-h-screen bg-[#F7F4EC] flex items-start md:items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-[#E5E5E0] p-6 md:p-8">
        {loading ? (
          <p className="text-center text-[#666666] text-[14px]">
            Loading profile…
          </p>
        ) : needsLogin || !user ? (
          <div className="text-center space-y-4">
            <h1 className="text-[20px] font-bold text-[#111111]">
              You&apos;re not signed in
            </h1>
            <p className="text-[14px] text-[#666666]">
              Sign in to view your profile.
            </p>
            <Link
              href="/login"
              className="inline-block h-12 px-6 leading-[48px] rounded-xl bg-[#F55036] hover:bg-[#E0462D] text-white font-semibold transition-colors"
            >
              Go to sign in
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-[#F55036] text-white flex items-center justify-center text-[24px] font-bold shrink-0">
                {initial}
              </div>
              <div className="min-w-0">
                <h1 className="text-[20px] font-bold text-[#111111] truncate">
                  {displayName}
                </h1>
                {user.email && (
                  <p className="text-[14px] text-[#666666] truncate">
                    {user.email}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-3 text-[14px]">
              <div className="flex justify-between border-b border-[#EFEFEA] pb-2">
                <span className="text-[#666666]">Name</span>
                <span className="font-medium text-[#111111]">{displayName}</span>
              </div>
              {user.email && (
                <div className="flex justify-between border-b border-[#EFEFEA] pb-2">
                  <span className="text-[#666666]">Email</span>
                  <span className="font-medium text-[#111111]">{user.email}</span>
                </div>
              )}
              {user.createdAt && (
                <div className="flex justify-between border-b border-[#EFEFEA] pb-2">
                  <span className="text-[#666666]">Member since</span>
                  <span className="font-medium text-[#111111]">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Link
                href="/saved"
                className="flex-1 h-12 rounded-xl border border-[#E5E5E0] text-[#111111] font-semibold text-center leading-[48px] hover:bg-[#F8F7F2] transition-colors"
              >
                Saved Papers
              </Link>
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex-1 h-12 rounded-xl bg-[#F55036] hover:bg-[#E0462D] text-white font-semibold transition-colors disabled:opacity-50"
              >
                {loggingOut ? "Signing out…" : "Log out"}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}