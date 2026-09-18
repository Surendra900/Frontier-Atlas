import { NormalizedPaper } from '../types/index';

const SOURCE_PRIORITY: Record<string, number> = {
  'arxiv': 1,
  'huggingface': 2
};

export class PaperMerger {
  merge(papers: NormalizedPaper[]): NormalizedPaper[] {
    const mergedMap = new Map<string, NormalizedPaper>();

    for (const paper of papers) {
      const key = paper.arxivId || paper.slug;

      if (!mergedMap.has(key)) {
        mergedMap.set(key, { ...paper });
      } else {
        const existing = mergedMap.get(key)!;
        this.mergeFields(existing, paper);
      }
    }

    return Array.from(mergedMap.values());
  }

  private mergeFields(existing: NormalizedPaper, incoming: NormalizedPaper) {
    const p1 = SOURCE_PRIORITY[existing.source] || 99;
    const p2 = SOURCE_PRIORITY[incoming.source] || 99;

    const [primary, secondary] = p1 <= p2 ? [existing, incoming] : [incoming, existing];

    existing.arxivId = primary.arxivId || secondary.arxivId;
    existing.doi = primary.doi || secondary.doi;
    existing.slug = primary.slug;
    existing.title = primary.title;
    existing.abstract = primary.abstract || secondary.abstract;
    existing.publicationDate = primary.publicationDate || secondary.publicationDate;
    
    existing.paperUrl = primary.paperUrl || secondary.paperUrl;
    existing.pdfUrl = primary.pdfUrl || secondary.pdfUrl;
    existing.sourceUrl = primary.sourceUrl || secondary.sourceUrl;
    existing.projectUrl = primary.projectUrl || secondary.projectUrl;
    existing.githubUrl = primary.githubUrl || secondary.githubUrl;

    if (secondary.authors.length > primary.authors.length && primary.authors.length === 0) {
        existing.authors = secondary.authors;
    } else {
        existing.authors = primary.authors;
    }
    
    existing.source = primary.source;
  }
}
