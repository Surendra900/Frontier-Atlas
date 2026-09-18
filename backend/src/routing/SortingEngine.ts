import { CompositeCursor } from './CursorManager';

export class SortingEngine {
  // Prisma ke liye query filter banana taaki duplicate na aayein
  static generateWhereClause(decodedCursor: CompositeCursor) {
    return {
      OR: [
        {
          publishedDate: {
            lt: new Date(decodedCursor.timestamp), // Pehle se purani date wale papers
          },
        },
        {
          publishedDate: new Date(decodedCursor.timestamp),
          id: {
            lt: decodedCursor.id, // Agar date same hai, to id ke basis par filters
          },
        },
      ],
    };
  }
}
