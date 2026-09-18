import { z } from 'zod';
import { NormalizedPaper } from '../types/index';
import { logger } from '../logger/index';

const UrlSchema = z.string().url().nullable().or(z.literal('').transform(() => null));

export const NormalizedPaperSchema = z.object({
  arxivId: z.string().nullable(),
  doi: z.string().nullable(),
  slug: z.string().min(1),
  title: z.string().min(1),
  abstract: z.string().nullable(),
  publicationDate: z.date().nullable(),
  paperUrl: UrlSchema,
  pdfUrl: UrlSchema,
  thumbnailUrl: UrlSchema,
  sourceUrl: UrlSchema,
  projectUrl: UrlSchema,
  githubUrl: UrlSchema,
  authors: z.array(z.string()),
  source: z.string().min(1),
});

export function validatePaper(paper: any): NormalizedPaper | null {
  try {
    return NormalizedPaperSchema.parse(paper) as NormalizedPaper;
  } catch (error) {
    logger.warn(`Paper validation failed for title: ${paper?.title || 'Unknown'}`, error);
    return null;
  }
}
