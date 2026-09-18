"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import AuthInput from "./AuthInput";
import { FcGoogle } from "react-icons/fc";
import { FaGithub, FaLinkedin } from "react-icons/fa";

export default function SignUpForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [github, setGithub] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentQuery = searchParams.toString();
  const redirect = `${pathname}${currentQuery ? `?${currentQuery}` : ""}`;
  const redirectQuery = `?redirect=${encodeURIComponent(redirect)}`;

  const defaultApiUrl = "https://frontieratlas-backend.morningsignal-india.workers.dev";
  const API_BASE = process.env.NODE_ENV === "development"
    ? ""
    : (process.env.NEXT_PUBLIC_API_URL || defaultApiUrl).replace(/\/$/, "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // The username explicitly mirrors the email address
      const username = email;

      const res = await fetch(`${API_BASE}/api/v1/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          username,
          email,
          password,
          displayName: name || "New User",
          github,
          linkedin,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Signup failed. Please try again.");
      }

      window.dispatchEvent(new Event("authchange"));
      router.push("/");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-1" onSubmit={handleSubmit}>
      {error && (
        <div className="text-[#F55036] text-[13px] font-medium text-center bg-[#F55036]/10 py-1.5 rounded-lg mb-2">
          {error}
        </div>
      )}

      <AuthInput
        label="Full name"
        type="text"
        placeholder="Ada Lovelace"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        disabled={loading}
      />

      <AuthInput
        label="Email"
        type="email"
        placeholder="you@university.edu"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        disabled={loading}
      />

      {/* Github + Linkedin */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-[13px] font-semibold">
            GitHub
          </label>

          <div className="flex h-9 items-center gap-2 rounded-xl border border-[#DDD4C5] bg-[#F8F5ED] px-3">
            <FaGithub className="text-[15px] text-[#555]" />

            <input
              type="text"
              value={github}
              onChange={(e) => setGithub(e.target.value)}
              placeholder="username"
              className="w-full bg-transparent text-[14px] outline-none placeholder:text-[#A79C8A]"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-[13px] font-semibold">
            LinkedIn
          </label>

          <div className="flex h-9 items-center gap-2 rounded-xl border border-[#DDD4C5] bg-[#F8F5ED] px-3">
            <FaLinkedin className="text-[15px] text-[#0A66C2]" />

            <input
              type="text"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              placeholder="profile-name"
              className="w-full bg-transparent text-[14px] outline-none placeholder:text-[#A79C8A]"
            />
          </div>
        </div>
      </div>

      <AuthInput
        label="Password"
        type="password"
        placeholder="Enter your password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        disabled={loading}
      />

      <button
        type="submit"
        disabled={loading}
        className="mt-1 h-10 w-full rounded-xl bg-[#F05A28] font-semibold text-white transition hover:bg-[#E65220] disabled:opacity-50"
      >
        {loading ? "Creating account..." : "Create account"}
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3 pt-1">
        <div className="h-px flex-1 bg-[#E5E5E5]" />
        <span className="text-[13px] text-[#666]">
          or continue with
        </span>
        <div className="h-px flex-1 bg-[#E5E5E5]" />
      </div>

      {/* Social */}
      <div className="grid grid-cols-2 gap-3">
        <a
          href={`${API_BASE}/api/v1/auth/google${redirectQuery}`}
          className="flex h-9 items-center justify-center gap-2 rounded-xl border border-[#DDD4C5] font-semibold"
        >
          <FcGoogle size={18} />
          Google
        </a>

        <a
          href={`${API_BASE}/api/v1/auth/github${redirectQuery}`}
          className="flex h-9 items-center justify-center gap-2 rounded-xl border border-[#DDD4C5] font-semibold"
        >
          <FaGithub size={17} />
          GitHub
        </a>
      </div>

      <p className="pt-1 text-center text-[13px] text-[#555]">
        Already have an account?{" "}
        <button
          type="button"
          className="font-semibold text-[#F05A28] hover:underline"
          onClick={() => {
            const tabs = document.querySelectorAll('button');
            const signinTab = Array.from(tabs).find(t => t.textContent === 'Sign in');
            if (signinTab) signinTab.click();
          }}
        >
          Sign in
        </button>
      </p>
    </form>
  );
}
