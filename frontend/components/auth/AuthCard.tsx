"use client";

import { useState } from "react";
import Image from "next/image";

import AuthTabs from "./AuthTabs";
import SignInForm from "./SignInForm";
import SignUpForm from "./SignUpForm";

export default function AuthCard() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  return (
    <div className="mx-auto flex w-full max-w-[400px] flex-col items-center">
      {/* Logo */}
      <div className="mb-0 flex justify-center">
        <img
          src="https://frontieratlas.pages.dev/logo.png"
          alt="FrontierAtlas"
          width={165}
          height={34}
        />
      </div>

      {/* Card */}
      <div
        className={`w-full rounded-[26px] border border-[#E6E2D8] bg-white shadow-sm ${
          mode === "signin"
            ? "px-8 py-6"
            : "px-7 py-4"
        }`}
      >
        <h1
          className={`font-bold leading-tight tracking-[-0.03em] text-[#111] ${
            mode === "signin"
              ? "text-[31px]"
              : "text-[27px]"
          }`}
        >
          {mode === "signin"
            ? "Welcome back"
            : "Create your account"}
        </h1>

        <p
          className={`mt-2 text-[#666] ${
            mode === "signin"
              ? "text-[15px] leading-6"
              : "text-[14px] leading-5"
          }`}
        >
          {mode === "signin"
            ? "Sign in to keep tracking papers, methods, and citations."
            : "Join FrontierAtlas to track methods, papers, and research trends."}
        </p>

        <div className={mode === "signin" ? "mt-5" : "mt-3"}>
          <AuthTabs mode={mode} setMode={setMode} />
        </div>

        <div className={mode === "signin" ? "mt-6" : "mt-4"}>
          {mode === "signin" ? <SignInForm /> : <SignUpForm />}
        </div>
      </div>

      {/* Footer */}
      <p className="mt-3 whitespace-nowrap text-center text-[11px] text-[#8D8A84]">
        By continuing, you agree to FrontierAtlas&apos;s{" "}
        <button className="underline underline-offset-2 hover:text-black">
          Terms
        </button>{" "}
        and{" "}
        <button className="underline underline-offset-2 hover:text-black">
          Privacy policy
        </button>
        .
      </p>
    </div>
  );
}