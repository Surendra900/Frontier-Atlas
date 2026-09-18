import { DatabaseManager } from "../../src/database/DatabaseManager.js";

describe("DatabaseManager", () => {
  let dbManager: DatabaseManager;

  beforeAll(() => {
    const singleUrl = process.env.DATABASE_URL || "postgresql://test:test@localhost:5432/test";
    dbManager = new DatabaseManager({
      DATABASE_URL: singleUrl,
    });
  });

  test("getClient returns a PrismaClient instance", () => {
    const client = dbManager.getClient();
    expect(client).toBeDefined();
    // Subsequent calls return the same cached instance
    expect(dbManager.getClient()).toBe(client);
  });

  test("getHealthStatus returns health structure", async () => {
    const status = await dbManager.getHealthStatus();
    expect(status).toHaveProperty("database");
    expect(typeof status.database).toBe("boolean");
  });

  afterAll(async () => {
    await dbManager.disconnectAll();
  });
});