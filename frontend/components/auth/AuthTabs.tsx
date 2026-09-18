"use client";

interface Props {
  mode: "signin" | "signup";
  setMode: (mode: "signin" | "signup") => void;
}

export default function AuthTabs({
  mode,
  setMode,
}: Props) {
  return (
    <div className="bg-[#F3F0E8] rounded-full p-1 flex">
      <button
        onClick={() => setMode("signin")}
        className={`flex-1 h-12 rounded-full text-sm font-semibold transition-all ${
          mode === "signin"
            ? "bg-[#171717] text-white shadow"
            : "text-[#666]"
        }`}
      >
        Sign in
      </button>

      <button
        onClick={() => setMode("signup")}
        className={`flex-1 h-12 rounded-full text-sm font-semibold transition-all ${
          mode === "signup"
            ? "bg-[#171717] text-white shadow"
            : "text-[#666]"
        }`}
      >
        Sign up
      </button>
    </div>
  );
}