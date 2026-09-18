"use client";

import { Search } from "lucide-react";

interface ModelSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

export default function ModelSearchInput({ value, onChange, placeholder }: ModelSearchInputProps) {
  return (
    <div className="group relative h-11 rounded-[24px] border border-[#E5E5E0] bg-white transition-all hover:border-[#D8D8D0] hover:shadow-[0_4px_18px_rgba(0,0,0,0.05)] focus-within:border-[#F55036]/30 focus-within:shadow-[0_4px_20px_rgba(245,80,54,0.12)]">
      <Search
        size={18}
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8B8B8B] transition-colors group-hover:text-[#555555] group-focus-within:text-[#F55036]"
      />
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-full w-full bg-transparent pl-11 pr-4 text-[13px] md:text-[14px] text-[#111111] placeholder:text-[#737373] outline-none"
      />
    </div>
  );
}
