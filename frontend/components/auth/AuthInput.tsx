"use client";

import { InputHTMLAttributes } from "react";

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export default function AuthInput({
  label,
  ...props
}: AuthInputProps) {
  return (
    <div className="space-y-2">
      <label className="block text-[14px] font-semibold text-[#111111]">
        {label}
      </label>

      <input
        {...props}
        className="
          w-full
          h-[42px]
          rounded-xl
          border
          border-[#DED9CF]
          bg-[#F8F6EF]
          px-4
          text-[15px]
          outline-none
          transition-all
          placeholder:text-[#A7A29A]
          focus:border-[#F55036]
          focus:ring-2
          focus:ring-[#F55036]/20
        "
      />
    </div>
  );
}