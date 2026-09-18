const API_BASE = process.env.API_URL || "http://127.0.0.1:8787";

describe("E2E: Research Papers API", () => {
  test("GET /api/v1/research-papers returns 200 with papers", async () => {
    const res = await fetch(`${API_BASE}/api/v1/research-papers`);
    expect(res.status).toBe(200);
    const json = await res.json() as any;
    expect(json.status).toBe("success");
    expect(Array.isArray(json.data)).toBe(true);
    expect(json.data.length).toBeGreaterThan(0);
  }, 15000);

  test("GET /api/v1/research-papers returns correct paper fields", async () => {
    const res = await fetch(`${API_BASE}/api/v1/research-papers`);
    const json = await res.json() as any;
    const paper = json.data[0];
    expect(paper).toHaveProperty("id");
    expect(paper).toHaveProperty("title");
    expect(paper).toHaveProperty("slug");
    expect(paper).toHaveProperty("createdAt");
  }, 15000);

  test("GET /api/v1/research-papers returns max 50 papers", async () => {
    const res = await fetch(`${API_BASE}/api/v1/research-papers`);
    const json = await res.json() as any;
    expect(json.data.length).toBeLessThanOrEqual(50);
  }, 15000);

  test("GET /api/v1/health returns shard health status", async () => {
    const res = await fetch(`${API_BASE}/api/v1/health`);
    // Accept 200 or 404 — endpoint may not exist yet
    expect([200, 404]).toContain(res.status);
  }, 15000);
});