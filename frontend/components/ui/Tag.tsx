const colorMap: Record<string, string> = {
  purple: 'bg-[#EDE9FE] text-[#6D28D9]',
  blue:   'bg-[#DBEAFE] text-[#1D4ED8]',
  green:  'bg-[#D1FAE5] text-[#065F46]',
  orange: 'bg-[#FFEDD5] text-[#9A3412]',
  red:    'bg-[#FEE2E2] text-[#B91C1C]',
  gray:   'bg-[#F3F4F6] text-[#374151]',
}

export function Tag({ label, color = 'gray' }: { label: string; color?: string }) {
  return (
    <span className={`text-[11px] font-medium px-2.5 py-[3px] rounded-full cursor-pointer hover:opacity-80 transition-opacity ${colorMap[color]}`}>
      {label}
    </span>
  )
}
