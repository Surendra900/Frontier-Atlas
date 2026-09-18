import { SortCursorPayload } from './SortingEngine.js';

export class CursorManager {
  static encodeCursor(payload: SortCursorPayload): string {
    const json = JSON.stringify(payload);
    const encoded = this.encodeBase64(json);
    return encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/u, '');
  }

  static decodeCursor(cursor: string): SortCursorPayload {
    if (!cursor) {
      throw new Error('Cursor is required');
    }

    const normalized = cursor.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');

    try {
      const json = this.decodeBase64(padded);
      const parsed = JSON.parse(json) as Partial<SortCursorPayload>;

      if (
        typeof parsed.sort !== 'string' ||
        typeof parsed.id !== 'string' ||
        typeof parsed.slug !== 'string' ||
        !Array.isArray(parsed.values)
      ) {
        throw new Error('Cursor payload is invalid');
      }

      return {
        sort: parsed.sort,
        id: parsed.id,
        slug: parsed.slug,
        values: parsed.values,
      };
    } catch (error) {
      throw new Error(error instanceof Error ? `Invalid cursor: ${error.message}` : 'Invalid cursor');
    }
  }

  static validateCursorSort(cursor: SortCursorPayload, sort: string): void {
    if (cursor.sort !== sort) {
      throw new Error('Cursor sort does not match the requested sort');
    }
  }

  private static encodeBase64(value: string): string {
    if (typeof btoa === 'function') {
      return btoa(unescape(encodeURIComponent(value)));
    }

    return Buffer.from(value, 'utf8').toString('base64');
  }

  private static decodeBase64(value: string): string {
    if (typeof atob === 'function') {
      return decodeURIComponent(escape(atob(value)));
    }

    return Buffer.from(value, 'base64').toString('utf8');
  }
}
