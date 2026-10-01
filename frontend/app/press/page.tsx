import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Newspaper, Mail, Download, ArrowUpRight } from "lucide-react";

export const metadata = {
  title: "Press & Media Kit | FrontierAtlas",
  description: "Press releases, media assets, and news inquiries for FrontierAtlas.",
};

export default function PressPage() {
  return (
    <div className="min-h-screen bg-[#F8F7F2] text-[#111111] flex flex-col justify-between">
      <Navbar />
      <main className="max-w-[1100px] w-full mx-auto px-5 md:px-10 lg:px-16 py-12 md:py-16 flex-1">
        <div className="max-w-2xl mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFECE5] text-[#FF5A1F] text-xs font-bold mb-4">
            <Newspaper size={14} />
            <span>Press & Media</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4 text-[#111827]">
            Press & Brand Resources
          </h1>
          <p className="text-base sm:text-lg text-[#6B7280]">
            News, official statements, and media assets for journalists, researchers, and media partners covering FrontierAtlas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Media Contact Card */}
          <div className="bg-white rounded-2xl border border-[#E5E5E0] p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
            <div className="w-10 h-10 rounded-xl bg-[#FAF9F5] border border-[#E5E5E0] flex items-center justify-center text-[#FF5A1F] mb-4">
              <Mail size={20} />
            </div>
            <h2 className="text-xl font-bold text-[#111827] mb-2">Media Inquiries</h2>
            <p className="text-sm text-[#6B7280] mb-6 leading-relaxed">
              For interviews, quotes, benchmark data access, and press questions, reach out directly to our communications team.
            </p>
            <a
              href="mailto:press@frontieratlas.org"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#111827] text-white font-semibold text-xs hover:bg-[#374151] transition-colors"
            >
              <span>press@frontieratlas.org</span>
              <ArrowUpRight size={14} />
            </a>
          </div>

          {/* Brand Assets Card */}
          <div className="bg-white rounded-2xl border border-[#E5E5E0] p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
            <div className="w-10 h-10 rounded-xl bg-[#FAF9F5] border border-[#E5E5E0] flex items-center justify-center text-[#FF5A1F] mb-4">
              <Download size={20} />
            </div>
            <h2 className="text-xl font-bold text-[#111827] mb-2">Brand Assets & Logos</h2>
            <p className="text-sm text-[#6B7280] mb-6 leading-relaxed">
              Download high-resolution logos, brand guidelines, and official FrontierAtlas design assets for editorial publication.
            </p>
            <a
              href="/about"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FAF9F5] border border-[#E5E5E0] text-[#111827] font-semibold text-xs hover:border-[#FF5A1F] transition-colors"
            >
              <span>View Brand Overview</span>
              <ArrowUpRight size={14} />
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
