import slugify from 'slugify';
import { ArxivRawModel, NormalizedPaper } from '../types/index';

export function normalizeArxiv(raw: ArxivRawModel): NormalizedPaper {
  const idStr = Array.isArray(raw.id) ? raw.id[0] : raw.id;
  const title = Array.isArray(raw.title) ? raw.title[0] : raw.title;
  const abstract = Array.isArray(raw.summary) ? raw.summary[0] : raw.summary;
  const publishedStr = Array.isArray(raw.published) ? raw.published[0] : raw.published;
  
  let authors: string[] = [];
  if (Array.isArray(raw.author)) {
    authors = raw.author.map((a: any) => (Array.isArray(a.name) ? a.name[0] : a.name));
  } else if (raw.author) {
    authors = Array.isArray(raw.author.name) ? raw.author.name : [raw.author.name as unknown as string];
  }

  let pdfUrl: string | null = null;
  let paperUrl: string | null = idStr;
  
  if (Array.isArray(raw.link)) {
    for (const link of raw.link) {
      if (link.$?.title === 'pdf') {
        pdfUrl = link.$?.href || null;
      }
    }
  }

  let arxivId: string | null = null;
  const match = idStr.match(/abs\/(.+)$/);
  if (match) {
    arxivId = match[1];
  }

  return {
    arxivId,
    doi: null,
    slug: slugify.default(title, { lower: true, strict: true }).slice(0, 100),
    title: title.replace(/\n/g, ' ').trim(),
    abstract: abstract.replace(/\n/g, ' ').trim(),
    publicationDate: new Date(publishedStr),
    paperUrl,
    pdfUrl,
    thumbnailUrl: `/thumbnails/${slugify.default(title, { lower: true, strict: true }).slice(0, 100)}.jpg`,
    sourceUrl: paperUrl,
    projectUrl: null,
    githubUrl: null,
    authors: authors.map(a => a.trim()),
    source: 'arxiv'
  };
}
