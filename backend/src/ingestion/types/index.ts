export interface NormalizedPaper {
  arxivId: string | null;
  doi: string | null;
  slug: string; // Title slug
  title: string;
  abstract: string | null;
  publicationDate: Date | null;
  paperUrl: string | null;
  pdfUrl: string | null;
  thumbnailUrl: string | null;
  sourceUrl: string | null;
  projectUrl: string | null;
  githubUrl: string | null;
  authors: string[];
  source: string;
}

export interface PaperCollector {
  fetchLatest(startTime: Date, endTime: Date): Promise<any[]>;
  getSourceName(): string;
}

export interface ArxivRawModel {
  id: string | string[];
  title: string | string[];
  summary: string | string[];
  author?: { name: string[] } | { name: string[] }[];
  published: string | string[];
  link?: any[];
  [key: string]: any;
}

export interface HuggingFaceRawModel {
  id: string;
  title: string;
  summary: string;
  // Real HF API returns authors as objects with _id, name, and hidden fields
  authors: { _id?: string; name: string; hidden?: boolean }[];
  publishedAt: string;
  [key: string]: any;
}

