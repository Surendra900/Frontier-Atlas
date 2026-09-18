import Link from "next/link";

interface SidebarItem {
  label: string;
  href?: string;
  active?: boolean;
  onClick?: () => void;
}

interface SectionSidebarProps {
  title: string;
  items: SidebarItem[];
  children?: React.ReactNode;
}

export default function SectionSidebar({
  title,
  items,
  children,
}: SectionSidebarProps) {
  return (
    <aside
      className="hidden lg:block w-[220px] shrink-0 border-r border-[#ECECEC] pr-6"
      aria-label={`${title} navigation`}
    >
      <div className="sticky top-24">
        <h3 className="mb-6 text-[18px] font-bold uppercase text-[#F55036]">
          {title}
        </h3>

        <nav aria-label={title}>
          <ul className="space-y-4">
            {items.map((item) => (
              <li key={item.label}>
                {item.onClick ? (
                  <button
                    onClick={item.onClick}
                    className={`w-full text-left text-[15px] transition-colors ${
                      item.active
                        ? "font-semibold text-[#F55036]"
                        : "text-[#555555] hover:text-[#F55036]"
                    }`}
                  >
                    {item.label}
                  </button>
                ) : (
                  <Link
                    href={item.href ?? "#"}
                    className={`block text-[15px] transition-colors ${
                      item.active
                        ? "font-semibold text-[#F55036]"
                        : "text-[#555555] hover:text-[#F55036]"
                    }`}
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
           {children}
        </nav>
      </div>
    </aside>
  );
}