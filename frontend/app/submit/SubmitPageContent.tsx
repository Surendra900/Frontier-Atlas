"use client";

import { useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import {
  FileText,
  Trophy,
  Database,
  Lightbulb,
  Send,
  CheckCircle2,
} from "lucide-react";

type TabKey = "paper" | "benchmark" | "data" | "suggestion";

const TABS: { key: TabKey; label: string; icon: ReactNode; blurb: string }[] = [
  {
    key: "paper",
    label: "Paper",
    icon: <FileText size={15} />,
    blurb: "Papers with open-source code and reproducible checkpoints receive priority indexing.",
  },
  {
    key: "benchmark",
    label: "Benchmark",
    icon: <Trophy size={15} />,
    blurb: "Benchmarks must link a public dataset and, ideally, the paper that introduced them.",
  },
  {
    key: "data",
    label: "Other Data",
    icon: <Database size={15} />,
    blurb: "Datasets, models, methods or evaluation results missing from the Atlas.",
  },
  {
    key: "suggestion",
    label: "Suggestion",
    icon: <Lightbulb size={15} />,
    blurb: "Corrections, feature ideas or anything else for the editorial team.",
  },
];

const inputCls =
  "w-full px-3.5 py-2.5 rounded-lg border border-[#E5E5E0] bg-[#F8F7F2] text-[#111111] placeholder:text-[#999] text-[14px] focus:outline-none focus:border-[#F55036] focus:bg-white transition-colors";

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="block text-[13px] font-semibold text-[#111111] mb-1.5">
        {label} {required && <span className="text-[#F55036]">*</span>}
      </label>
      {children}

    </div>
  );
}

function SubmitButton({ children }: { children: ReactNode }) {
  return (
    <button
      type="submit"
      className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#F55036] text-white font-semibold text-[14px] hover:bg-[#E0462D] transition-colors shadow-sm cursor-pointer"
    >
      <Send size={16} />
      {children}
    </button>
  );
}

function SuccessCard({
  title,
  message,
  onReset,
}: {
  title: string;
  message: string;
  onReset: () => void;
}) {
  return (
    <div className="py-12 flex flex-col items-center text-center">
      <div className="w-14 h-14 rounded-full bg-[#ECFDF5] text-[#10B981] flex items-center justify-center mb-4">
        <CheckCircle2 size={32} />
      </div>
      <h3 className="text-xl font-bold text-[#111111] mb-2">{title}</h3>
      <p className="text-[#666666] max-w-sm mb-6 text-[14px]">{message}</p>
      <button
        type="button"
        onClick={onReset}
        className="px-6 py-2.5 rounded-full bg-[#F55036] text-white font-semibold text-[13px] hover:bg-[#E0462D] transition-colors cursor-pointer"
      >
        Submit another
      </button>
    </div>
  );
}

/* ---------------- Paper ---------------- */
function PaperForm() {
  const initial = {
    title: "",
    arxiv: "",
    authors: "",
    task: "",
    codeUrl: "",
    notes: "",
    name: "",
    email: "",
  };
  const [form, setForm] = useState(initial);
  const [done, setDone] = useState(false);
  const set =
    (k: keyof typeof form) =>
      (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setForm((f) => ({ ...f, [k]: e.target.value }));

  if (done) {
    return (
      <SuccessCard
        title="Paper submitted!"
        message="Thank you. Our editorial team will review it and index it shortly."
        onReset={() => {
          setDone(false);
          setForm(initial);
        }}
      />
    );
  }
  return (
    <form
      onSubmit={(e: FormEvent) => {
        e.preventDefault();
        setDone(true);
      }}
      className="space-y-4"
    >
      <Field label="Paper title" required>
        <input required value={form.title} onChange={set("title")} placeholder="e.g. Attention Is All You Need" className={inputCls} />
      </Field>
      <Field label="arXiv URL or DOI" required hint="Paste the full arXiv link (https://arxiv.org/abs/...) or DOI.">
        <input required value={form.arxiv} onChange={set("arxiv")} placeholder="https://arxiv.org/abs/1706.03762" className={inputCls} />
      </Field>
      <Field label="Authors">
        <input value={form.authors} onChange={set("authors")} placeholder="e.g. Vaswani et al." className={inputCls} />
      </Field>
      <Field label="Task / category" hint="e.g. reasoning-models, agents, vision-language-models">
        <input value={form.task} onChange={set("task")} placeholder="e.g. large-language-models" className={inputCls} />
      </Field>
      <Field label="Code repository URL" hint="GitHub or other public repo — papers with code get priority.">
        <input type="url" value={form.codeUrl} onChange={set("codeUrl")} placeholder="https://github.com/..." className={inputCls} />
      </Field>
      <Field label="Why should we index it?">
        <textarea rows={4} value={form.notes} onChange={set("notes")} placeholder="Key result, novelty, benchmark scores..." className={`${inputCls} resize-none`} />
      </Field>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Your name" required>
          <input required value={form.name} onChange={set("name")} placeholder="Dr. Alex Rivera" className={inputCls} />
        </Field>
        <Field label="Email" required>
          <input required type="email" value={form.email} onChange={set("email")} placeholder="alex@research.org" className={inputCls} />
        </Field>
      </div>
      <SubmitButton>Submit Paper</SubmitButton>
    </form>
  );
}

/* ---------------- Benchmark ---------------- */
function BenchmarkForm() {
  const initial = {
    name: "",
    paperUrl: "",
    datasetUrl: "",
    task: "",
    description: "",
    submitter: "",
    email: "",
  };
  const [form, setForm] = useState(initial);
  const [done, setDone] = useState(false);
  const set =
    (k: keyof typeof form) =>
      (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setForm((f) => ({ ...f, [k]: e.target.value }));

  if (done) {
    return (
      <SuccessCard
        title="Benchmark submitted!"
        message={`Thank you for submitting ${form.name || "your benchmark"}. Our team will review and index it shortly.`}
        onReset={() => {
          setDone(false);
          setForm(initial);
        }}
      />
    );
  }
  return (
    <form
      onSubmit={(e: FormEvent) => {
        e.preventDefault();
        setDone(true);
      }}
      className="space-y-4"
    >
      <Field label="Benchmark name" required>
        <input required value={form.name} onChange={set("name")} placeholder="e.g. MMLU-Pro" className={inputCls} />
      </Field>
      <Field label="Paper URL" hint="Paper that introduced the benchmark.">
        <input type="url" value={form.paperUrl} onChange={set("paperUrl")} placeholder="https://arxiv.org/abs/..." className={inputCls} />
      </Field>
      <Field label="Dataset URL" required hint="Public link to the dataset or its repository.">
        <input required type="url" value={form.datasetUrl} onChange={set("datasetUrl")} placeholder="https://huggingface.co/datasets/..." className={inputCls} />
      </Field>
      <Field label="Task / domain" hint="e.g. reasoning, code generation, vision-language">
        <input value={form.task} onChange={set("task")} placeholder="e.g. reasoning" className={inputCls} />
      </Field>
      <Field label="Description" required>
        <textarea required rows={4} value={form.description} onChange={set("description")} placeholder="What does it evaluate? Metrics, splits, size..." className={`${inputCls} resize-none`} />
      </Field>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Your name" required>
          <input required value={form.submitter} onChange={set("submitter")} placeholder="Dr. Alex Rivera" className={inputCls} />
        </Field>
        <Field label="Email" required>
          <input required type="email" value={form.email} onChange={set("email")} placeholder="alex@research.org" className={inputCls} />
        </Field>
      </div>
      <SubmitButton>Submit Benchmark</SubmitButton>
    </form>
  );
}

/* ---------------- Other data ---------------- */
function DataForm() {
  const initial = { type: "Dataset", title: "", url: "", description: "", name: "", email: "" };
  const [form, setForm] = useState(initial);
  const [done, setDone] = useState(false);
  const set =
    (k: keyof typeof form) =>
      (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
        setForm((f) => ({ ...f, [k]: e.target.value }));

  if (done) {
    return (
      <SuccessCard
        title="Data submitted!"
        message="Thank you. Our editorial team will review it and index it shortly."
        onReset={() => {
          setDone(false);
          setForm(initial);
        }}
      />
    );
  }
  return (
    <form
      onSubmit={(e: FormEvent) => {
        e.preventDefault();
        setDone(true);
      }}
      className="space-y-4"
    >
      <Field label="Data type" required>
        <select value={form.type} onChange={set("type")} className={inputCls}>
          <option value="Dataset">Dataset</option>
          <option value="Model">Model / checkpoint</option>
          <option value="Method">Method</option>
          <option value="Evaluation result">Evaluation result</option>
          <option value="Other">Other</option>
        </select>
      </Field>
      <Field label="Title" required>
        <input required value={form.title} onChange={set("title")} placeholder="e.g. FineWeb-Edu" className={inputCls} />
      </Field>
      <Field label="URL" required hint="Public link — repo, Hugging Face, project page...">
        <input required type="url" value={form.url} onChange={set("url")} placeholder="https://..." className={inputCls} />
      </Field>
      <Field label="Description" required>
        <textarea required rows={4} value={form.description} onChange={set("description")} placeholder="What is it? Size, license, relevant tasks..." className={`${inputCls} resize-none`} />
      </Field>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Your name" required>
          <input required value={form.name} onChange={set("name")} placeholder="Dr. Alex Rivera" className={inputCls} />
        </Field>
        <Field label="Email" required>
          <input required type="email" value={form.email} onChange={set("email")} placeholder="alex@research.org" className={inputCls} />
        </Field>
      </div>
      <SubmitButton>Submit Data</SubmitButton>
    </form>
  );
}

/* ---------------- Suggestion ---------------- */
function SuggestionForm() {
  const initial = { title: "", details: "", name: "", email: "" };
  const [form, setForm] = useState(initial);
  const [done, setDone] = useState(false);
  const set =
    (k: keyof typeof form) =>
      (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setForm((f) => ({ ...f, [k]: e.target.value }));

  if (done) {
    return (
      <SuccessCard
        title="Suggestion received!"
        message="Thanks for helping improve FrontierAtlas. We read every suggestion."
        onReset={() => {
          setDone(false);
          setForm(initial);
        }}
      />
    );
  }
  return (
    <form
      onSubmit={(e: FormEvent) => {
        e.preventDefault();
        setDone(true);
      }}
      className="space-y-4"
    >
      <Field label="Title" required>
        <input required value={form.title} onChange={set("title")} placeholder="e.g. Fix duplicate paper entry" className={inputCls} />
      </Field>
      <Field label="Details" required>
        <textarea required rows={5} value={form.details} onChange={set("details")} placeholder="Describe the issue or idea, with links if relevant..." className={`${inputCls} resize-none`} />
      </Field>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Your name" hint="Optional">
          <input value={form.name} onChange={set("name")} placeholder="Dr. Alex Rivera" className={inputCls} />
        </Field>
        <Field label="Email" hint="Optional — for follow-up">
          <input type="email" value={form.email} onChange={set("email")} placeholder="alex@research.org" className={inputCls} />
        </Field>
      </div>
      <SubmitButton>Send Suggestion</SubmitButton>
    </form>
  );
}

/* ---------------- Page ---------------- */
export default function SubmitPageContent() {
  const [tab, setTab] = useState<TabKey>("paper");
  const active = TABS.find((t) => t.key === tab) ?? TABS[0];

  return (
    <main className="max-w-[1100px] mx-auto px-5 md:px-10 lg:px-16 py-12 md:py-16">
      <div className="max-w-2xl mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
          Submit to <span className="text-[#F55036]">FrontierAtlas</span>
        </h1>
        <p className="text-base sm:text-lg text-[#666666]">
          Share papers, benchmarks, datasets or ideas with the community.
          Everything is reviewed by our editorial team before indexing.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-4" role="tablist" aria-label="Submission type">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-[13px] font-semibold transition-colors cursor-pointer ${tab === t.key
                ? "bg-[#111111] text-white"
                : "bg-white text-[#555555] border border-[#E5E5E0] hover:border-[#111111]"
              }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>
      <p className="text-[13px] text-[#666666] mb-4">{active.blurb}</p>

      <div className="bg-white rounded-2xl border border-[#E5E5E0] p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
        {tab === "paper" && <PaperForm />}
        {tab === "benchmark" && <BenchmarkForm />}
        {tab === "data" && <DataForm />}
        {tab === "suggestion" && <SuggestionForm />}
      </div>
    </main>
  );
}