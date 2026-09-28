import Navbar from "@/components/Navbar";
import SubmitPageContent from "./SubmitPageContent";

export const metadata = {
  title: "Submit | FrontierAtlas",
  description:
    "Submit papers, benchmarks, datasets and suggestions to FrontierAtlas.",
};

export default function SubmitPage() {
  return (
    <div className="min-h-screen bg-[#F8F7F2] text-[#111111]">
      <Navbar />
      <SubmitPageContent />
    </div>
  );
}