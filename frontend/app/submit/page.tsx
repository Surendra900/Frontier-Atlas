"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Github,
  Link as LinkIcon,
  Users,
  Image as ImageIcon,
  Sparkles,
  ArrowRight,
  Info,
} from "lucide-react";
import { ingestPaper, type IngestPaperPayload } from "@/lib/paperApi";

export default function SubmitPaperPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: "",
    arxivIdOrUrl: "",
    paperUrl: "",
    authors: "",
    abstract: "",
    githubUrl: "",
    thumbnailUrl: "",
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successData, setSuccessData] = useState<{
    slug: string;
    paper_id: string;
  } | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const parseArxivId = (input: string): string => {
    const trimmed = input.trim();
    if (!trimmed) return "";
    // e.g. https://arxiv.org/abs/2303.08774 or 2303.08774v1
    const match = trimmed.match(/(?:arxiv\.org\/(?:abs|pdf)\/)?([0-9]{4}\.[0-9]{4,5}(?:v[0-9]+)?)/i);
    if (match) return match[1];
    return trimmed;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!formData.title.trim()) {
      setErrorMsg("Please enter a research paper title.");
      return;
    }

    setLoading(true);

    try {
      const cleanArxivId = parseArxivId(formData.arxivIdOrUrl);
      const paperUrl =
        formData.paperUrl.trim() ||
        (cleanArxivId ? `https://arxiv.org/abs/${cleanArxivId}` : "");

      const payload: IngestPaperPayload = {
        title: formData.title.trim(),
        arxiv_id: cleanArxivId || undefined,
        paper_url: paperUrl || undefined,
        thumbnail_url: formData.thumbnailUrl.trim() || undefined,
        github_url: formData.githubUrl.trim() || undefined,
        abstract: formData.abstract.trim() || undefined,
        authors: formData.authors.trim() || undefined,
        github_stars: 0,
      };

      const res = await ingestPaper(payload);

      if (res.status === "success" && res.slug) {
        setSuccessData({ slug: res.slug, paper_id: res.paper_id });
        // Redirect after a brief moment
        setTimeout(() => {
          router.push(`/papers/${res.slug}`);
        }, 1800);
      } else {
        throw new Error(res.message || "Failed to submit paper");
      }
    } catch (err: any) {
      console.error("Paper submission error:", err);
      setErrorMsg(
        err.message || "An unexpected error occurred during submission. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F7F2] text-[#171717] py-10 px-4 sm:px-6 md:px-12 lg:px-16">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 pb-4 border-b border-[#E5E5E0]">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[rgba(245,80,54,0.08)] text-[#F55036] text-xs font-semibold mb-3">
            <Sparkles size={13} />
            Community Ingestion
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#171717] tracking-tight">
            Submit AI Research Paper
          </h1>
          <p className="text-sm text-[#666] mt-1.5">
            Index a new publication, preprint, or code repository to the FrontierAtlas knowledge graph.
          </p>
        </div>

        {/* Success Alert */}
        {successData && (
          <div className="mb-6 p-6 bg-[#E8F5E9] border border-[#A5D6A7] rounded-2xl flex items-start gap-4 animate-in fade-in">
            <CheckCircle2 size={24} className="text-[#2E7D32] shrink-0 mt-0.5" />
            <div>
              <h3 className="text-base font-bold text-[#2E7D32]">
                Paper Successfully Ingested!
              </h3>
              <p className="text-xs text-[#388E3C] mt-1">
                Your paper is now indexed in FrontierAtlas. Redirecting to paper page...
              </p>
              <Link
                href={`/papers/${successData.slug}`}
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[#2E7D32] hover:underline"
              >
                View Paper Now <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-6 flex items-center gap-3 px-4 py-3 bg-[#FFEBEE] border border-[#FFCDD2] rounded-xl text-xs font-medium text-[#C62828] animate-in fade-in">
            <AlertCircle size={16} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <form
              onSubmit={handleSubmit}
              className="bg-white border border-[#E5E5E0] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6"
            >
              {/* Title */}
              <div>
                <label
                  htmlFor="title"
                  className="block text-xs font-bold text-[#222] mb-1.5"
                >
                  Paper Title <span className="text-[#F55036]">*</span>
                </label>
                <div className="relative">
                  <FileText
                    size={15}
                    className="absolute left-3.5 top-3 text-[#888]"
                  />
                  <input
                    id="title"
                    name="title"
                    type="text"
                    required
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g. Attention Is All You Need"
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs border border-[#E5E5E0] rounded-xl focus:outline-none focus:border-[#F55036] focus:ring-1 focus:ring-[#F55036] transition-colors"
                  />
                </div>
              </div>

              {/* arXiv ID and Paper URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="arxivIdOrUrl"
                    className="block text-xs font-bold text-[#222] mb-1.5"
                  >
                    arXiv ID or URL
                  </label>
                  <div className="relative">
                    <LinkIcon
                      size={15}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#888]"
                    />
                    <input
                      id="arxivIdOrUrl"
                      name="arxivIdOrUrl"
                      type="text"
                      value={formData.arxivIdOrUrl}
                      onChange={handleChange}
                      placeholder="e.g. 1706.03762 or arxiv.org/abs/..."
                      className="w-full pl-9 pr-3.5 py-2 text-xs border border-[#E5E5E0] rounded-xl focus:outline-none focus:border-[#F55036] focus:ring-1 focus:ring-[#F55036] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="paperUrl"
                    className="block text-xs font-bold text-[#222] mb-1.5"
                  >
                    Paper / PDF URL
                  </label>
                  <div className="relative">
                    <LinkIcon
                      size={15}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#888]"
                    />
                    <input
                      id="paperUrl"
                      name="paperUrl"
                      type="url"
                      value={formData.paperUrl}
                      onChange={handleChange}
                      placeholder="https://arxiv.org/pdf/..."
                      className="w-full pl-9 pr-3.5 py-2 text-xs border border-[#E5E5E0] rounded-xl focus:outline-none focus:border-[#F55036] focus:ring-1 focus:ring-[#F55036] transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Authors */}
              <div>
                <label
                  htmlFor="authors"
                  className="block text-xs font-bold text-[#222] mb-1.5"
                >
                  Authors (Comma-Separated)
                </label>
                <div className="relative">
                  <Users
                    size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#888]"
                  />
                  <input
                    id="authors"
                    name="authors"
                    type="text"
                    value={formData.authors}
                    onChange={handleChange}
                    placeholder="e.g. Ashish Vaswani, Noam Shazeer, Niki Parmar"
                    className="w-full pl-9 pr-3.5 py-2 text-xs border border-[#E5E5E0] rounded-xl focus:outline-none focus:border-[#F55036] focus:ring-1 focus:ring-[#F55036] transition-colors"
                  />
                </div>
                <p className="text-[11px] text-[#888] mt-1">
                  Separate multiple authors with commas to auto-link researcher profiles.
                </p>
              </div>

              {/* Abstract */}
              <div>
                <label
                  htmlFor="abstract"
                  className="block text-xs font-bold text-[#222] mb-1.5"
                >
                  Abstract / Executive Summary
                </label>
                <textarea
                  id="abstract"
                  name="abstract"
                  rows={5}
                  value={formData.abstract}
                  onChange={handleChange}
                  placeholder="Paste the abstract of the research paper here..."
                  className="w-full px-3.5 py-2.5 text-xs border border-[#E5E5E0] rounded-xl focus:outline-none focus:border-[#F55036] focus:ring-1 focus:ring-[#F55036] transition-colors resize-y leading-relaxed"
                />
              </div>

              {/* GitHub and Thumbnail */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="githubUrl"
                    className="block text-xs font-bold text-[#222] mb-1.5"
                  >
                    GitHub Code Repository
                  </label>
                  <div className="relative">
                    <Github
                      size={15}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#888]"
                    />
                    <input
                      id="githubUrl"
                      name="githubUrl"
                      type="url"
                      value={formData.githubUrl}
                      onChange={handleChange}
                      placeholder="https://github.com/..."
                      className="w-full pl-9 pr-3.5 py-2 text-xs border border-[#E5E5E0] rounded-xl focus:outline-none focus:border-[#F55036] focus:ring-1 focus:ring-[#F55036] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="thumbnailUrl"
                    className="block text-xs font-bold text-[#222] mb-1.5"
                  >
                    Custom Thumbnail URL
                  </label>
                  <div className="relative">
                    <ImageIcon
                      size={15}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#888]"
                    />
                    <input
                      id="thumbnailUrl"
                      name="thumbnailUrl"
                      type="url"
                      value={formData.thumbnailUrl}
                      onChange={handleChange}
                      placeholder="https://.../preview.png"
                      className="w-full pl-9 pr-3.5 py-2 text-xs border border-[#E5E5E0] rounded-xl focus:outline-none focus:border-[#F55036] focus:ring-1 focus:ring-[#F55036] transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-[#F0EFEB] flex items-center justify-end gap-3">
                <Link
                  href="/"
                  className="px-4 py-2 text-xs font-semibold text-[#666] hover:text-[#222] transition-colors"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={loading || Boolean(successData)}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#F55036] hover:bg-[#E0462D] text-white text-xs font-bold transition-all shadow-sm hover:shadow-[0_0_0_3px_rgba(245,80,54,0.20)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Ingesting Paper...
                    </>
                  ) : (
                    <>
                      <UploadCloud size={15} />
                      Submit & Index Paper
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Right Sidebar Guidelines & Tips */}
          <div className="space-y-6">
            <div className="bg-white border border-[#E5E5E0] rounded-2xl p-6 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#F55036] mb-3">
                <Info size={15} />
                Submission Guidelines
              </div>
              <ul className="space-y-3 text-xs text-[#555] leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F55036] mt-1.5 shrink-0" />
                  <span>
                    <strong>arXiv Auto-Resolution:</strong> Providing an arXiv ID will automatically format links and citations.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F55036] mt-1.5 shrink-0" />
                  <span>
                    <strong>Open Code:</strong> Linking a GitHub repository will automatically track stars, forks, and code implementations.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F55036] mt-1.5 shrink-0" />
                  <span>
                    <strong>Instant Search:</strong> Once submitted, the paper is immediately searchable across all models, tasks, and authors.
                  </span>
                </li>
              </ul>
            </div>

            <div className="bg-[#FFF9F5] border border-[#FFE0D0] rounded-2xl p-5 text-xs text-[#8A3B14] leading-relaxed">
              <p className="font-bold mb-1">Want to claim authorship?</p>
              <p>
                Ensure your display name or email matches your arXiv or GitHub account so future citation and reputation badges attribute to your profile.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
