interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  rightLabel?: string;
}

export default function SectionHeader({
  title,
  subtitle,
  rightLabel,
}: SectionHeaderProps) {
  return (
    <div className="mb-6">
      <div className="flex items-end justify-between gap-4 border-b border-[#ECECEC] pb-3">
        <div>
          <h2 className="text-[24px] font-black text-[#111111]">
            {title}
          </h2>

          {subtitle && (
            <p className="mt-2 text-[14px] text-[#6B7280]">
              {subtitle}
            </p>
          )}
        </div>

        {rightLabel && (
          <span className="text-[14px] uppercase tracking-wide text-[#9CA3AF]">
            {rightLabel}
          </span>
        )}
      </div>
    </div>
  );
}