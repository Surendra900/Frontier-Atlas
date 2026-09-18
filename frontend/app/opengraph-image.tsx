import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Frontier Atlas - Discover AI Research";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "space-between",
          backgroundColor: "#F8F7F2",
          backgroundImage: "radial-gradient(circle at 80% 20%, rgba(245, 80, 54, 0.08) 0%, transparent 60%)",
          padding: "60px 80px",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "10px",
              backgroundColor: "#171717",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#F55036",
              fontSize: "26px",
              fontWeight: 900,
            }}
          >
            FA
          </div>
          <span style={{ fontSize: "32px", fontWeight: 900, color: "#171717", letterSpacing: "-0.03em" }}>
            FrontierAtlas
          </span>
          <span
            style={{
              marginLeft: "12px",
              padding: "4px 12px",
              backgroundColor: "rgba(245, 80, 54, 0.12)",
              color: "#F55036",
              borderRadius: "999px",
              fontSize: "14px",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            AI Research Index
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "900px" }}>
          <h1
            style={{
              fontSize: "56px",
              fontWeight: 900,
              color: "#111111",
              lineHeight: 1.15,
              letterSpacing: "-0.03em",
              margin: 0,
            }}
          >
            The Open Platform for AI Research, SOTA Benchmarks & Code
          </h1>
          <p
            style={{
              fontSize: "24px",
              color: "#555555",
              lineHeight: 1.4,
              margin: 0,
            }}
          >
            Track breaking papers, verified model leaderboards, citation metrics, and open-source implementations.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            borderTop: "1px solid #E5E5E0",
            paddingTop: "24px",
          }}
        >
          <div style={{ display: "flex", gap: "32px" }}>
            <span style={{ fontSize: "16px", fontWeight: 700, color: "#444444" }}>
              Trending Papers
            </span>
            <span style={{ fontSize: "16px", fontWeight: 700, color: "#444444" }}>
              Verified SOTA
            </span>
            <span style={{ fontSize: "16px", fontWeight: 700, color: "#444444" }}>
              GitHub Stars
            </span>
            <span style={{ fontSize: "16px", fontWeight: 700, color: "#444444" }}>
              Discussions
            </span>
          </div>
          <span style={{ fontSize: "16px", fontWeight: 700, color: "#F55036" }}>
            frontieratlas.org
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
