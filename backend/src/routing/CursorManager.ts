export interface CompositeCursor {
  timestamp: number;
  id: string;
}

export class CursorManager {
  // 1. Unique Composite data ko Base64 string mein convert karna
  static encode(timestamp: Date, id: string): string {
    const data: CompositeCursor = { timestamp: timestamp.getTime(), id };
    return Buffer.from(JSON.stringify(data)).toString('base64');
  }

  // 2. Base64 string se wapas data nikalna
  static decode(token: string): CompositeCursor | null {
    try {
      const json = Buffer.from(token, 'base64').toString('utf-8');
      return JSON.parse(json) as CompositeCursor;
    } catch (error) {
      return null;
    }
  }
}
