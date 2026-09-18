import slugify from 'slugify';
import { HuggingFaceRawModel, NormalizedPaper } from '../types/index';

export function normalizeHuggingFace(raw: HuggingFaceRawModel): NormalizedPaper {
  const arxivId = raw.id.match(/^\d+\.\d+$/) ? raw.id : null;
  const paperUrl = arxivId ? `https://arxiv.org/abs/${arxivId}` : null;
  const pdfUrl = arxivId ? `https://arxiv.org/pdf/${arxivId}.pdf` : null;

  return {
    arxivId,
    doi: null,
    slug: slugify.default(raw.title, { lower: true, strict: true }).slice(0, 100),
    title: raw.title.replace(/\n/g, ' ').trim(),
    abstract: raw.summary.replace(/\n/g, ' ').trim(),
    publicationDate: new Date(raw.publishedAt),
    paperUrl,
    pdfUrl,
    thumbnailUrl: raw.id ? `https://cdn-thumbnails.huggingface.co/social-thumbnails/papers/${raw.id}.png` : null,
    sourceUrl: `https://huggingface.co/papers/${raw.id}`,
    projectUrl: null,
    githubUrl: null,
    authors: raw.authors.map(a => a.name.trim()),
    source: 'huggingface'
  };
}
