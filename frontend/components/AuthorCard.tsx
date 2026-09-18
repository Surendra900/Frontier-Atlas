"use client";

import { Calendar, User } from "lucide-react";
import type { AuthorItem } from "@/lib/authors";
import Link from "next/link";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export default function AuthorCard({ author }: { author: AuthorItem }) {
  const createdDate = new Date(author.createdAt);
  const isNew = Date.now() - createdDate.getTime() < THIRTY_DAYS_MS;

  return (
    <Link
      href={`/authors/${author.slug}`}
      className="ds-card p-5 flex flex-col gap-3 hover:shadow-soft transition-shadow duration-200 group no-underline"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#EBEBE6] flex items-center justify-center shrink-0">
          <User size={18} className="text-[#8B8B8B]" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-[16px] font-semibold text-[#111111] group-hover:text-[#F55036] transition-colors leading-snug truncate">
              {author.name}
            </h3>
            {isNew && (
              <span className="shrink-0 ds-chip text-[10px] px-2 py-0.5">
                New
              </span>
            )}
          </div>
          <span className="text-[11px] text-[#8B8B8B]">
            {author.slug}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4 text-[13px] text-[#555555]">
        <span className="flex items-center gap-1.5">
          <Calendar size={14} className="text-[#8B8B8B]" />
          {createdDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      </div>
    </Link>
  );
}
