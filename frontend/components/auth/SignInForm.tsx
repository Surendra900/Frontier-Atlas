"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthInput from "./AuthInput";
import SocialButtons from "./SocialButton";
import Link from "next/link";

export default function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");
  const redirectPath = redirectParam && redirectParam.startsWith("/") && !redirectParam.startsWith("//")
    ? redirectParam
    : "/";
  const oauthError = searchParams.get("error");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const defaultApiUrl = "https://frontieratlas-backend.morningsignal-india.workers.dev";
      const API_BASE = process.env.NODE_ENV === "development"
        ? ""
        : (process.env.NEXT_PUBLIC_API_URL || defaultApiUrl).replace(/\/$/, "");

      const res = await fetch(`${API_BASE}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password, rememberMe }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Login failed. Please check your credentials.");
      }

      window.dispatchEvent(new Event("authchange"));
      router.push(redirectPath);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      {oauthError && !error && (
        <div className="text-[#F55036] text-[14px] font-medium text-center bg-[#F55036]/10 py-2 rounded-xl">
          {oauthError === "Google_Auth_Failed"
            ? "Google sign-in failed. Please try again."
            : oauthError === "GitHub_Auth_Failed"
              ? "GitHub sign-in failed. Please try again."
              : "Sign-in failed. Please try again."}
        </div>
      )}

      {error && (
        <div className="text-[#F55036] text-[14px] font-medium text-center bg-[#F55036]/10 py-2 rounded-xl">
          {error}
        </div>
      )}

      <AuthInput
        label="Email"
        type="email"
        placeholder="you@university.edu"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        disabled={loading}
      />

      <AuthInput
        label="Password"
        type="password"
        placeholder="Enter your password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        disabled={loading}
      />

      <div className="flex items-center justify-between text-[14px]">
        <label className="flex items-center gap-2 text-[#555555] cursor-pointer">
          <input
            type="checkbox"
            className="w-4 h-4 rounded border-[#CFC8BC]"
            disabled={loading}
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          Remember me
        </label>

        <button
          type="button"
          className="text-[#F55036] hover:underline font-medium"
        >
          Forgot password?
        </button>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full h-12 rounded-xl bg-[#F55036] hover:bg-[#E0462D] text-white font-semibold transition-colors disabled:opacity-50"
      >
        {loading ? "Signing in..." : "Sign in"}
      </button>

      {/* Divider */}

      <div className="flex items-center gap-4 pt-1">
        <div className="flex-1 h-px bg-[#E5E5E0]" />

        <span className="text-[14px] text-[#666666] whitespace-nowrap">
          or continue with
        </span>

        <div className="flex-1 h-px bg-[#E5E5E0]" />
      </div>

      {/* Social Login */}

      <SocialButtons />

      {/* Footer */}

      <p className="text-center text-[14px] text-[#555555]">
        Don't have an account?{" "}
        <button
          type="button"
          className="text-[#F55036] font-semibold hover:underline"
          onClick={() => {
            const tabs = document.querySelectorAll('button');
            const signupTab = Array.from(tabs).find(t => t.textContent === 'Sign up');
            if (signupTab) signupTab.click();
          }}
        >
          Sign up
        </button>
      </p>
    </form>
  );
}
