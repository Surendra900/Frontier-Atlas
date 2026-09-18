export const CATEGORY_COLORS: Record<string, { accent: string, bg: string }> = {
  "core-ai": { accent: "#FF5A1F", bg: "#fff4f0" }, // Orange (Signature)
  "neural-architectures": { accent: "#2563eb", bg: "#eff6ff" }, // Blue
  "neural-components": { accent: "#7c3aed", bg: "#f5f3ff" }, // Purple
  "training": { accent: "#059669", bg: "#ecfdf5" }, // Emerald
  "alignment": { accent: "#dc2626", bg: "#fef2f2" }, // Red
  "prompting-reasoning": { accent: "#d97706", bg: "#fffbeb" }, // Amber
  "agents": { accent: "#0891b2", bg: "#ecfeff" }, // Cyan
  "retrieval": { accent: "#9333ea", bg: "#faf5ff" }, // Violet
  "adaptation": { accent: "#4f46e5", bg: "#eef2ff" }, // Indigo
  "optimization": { accent: "#0d9488", bg: "#f0fdfa" }, // Teal
  "regularization": { accent: "#be185d", bg: "#fdf2f8" }, // Pink
  "efficiency": { accent: "#65a30d", bg: "#f7fee7" }, // Lime
  "reinforcement-learning": { accent: "#ea580c", bg: "#fff7ed" }, // Orange-Red
  "representation-learning": { accent: "#0284c7", bg: "#f0f9ff" }, // Light Blue
  "diffusion": { accent: "#c026d3", bg: "#fdf4ff" }, // Fuchsia
  "vision": { accent: "#2dd4bf", bg: "#f0fdfa" }, // Teal-Green
  "language": { accent: "#3b82f6", bg: "#eff6ff" }, // Sky Blue
  "audio": { accent: "#f59e0b", bg: "#fffbeb" }, // Yellow
  "video": { accent: "#e11d48", bg: "#fff1f2" }, // Rose
  "robotics": { accent: "#475569", bg: "#f8fafc" }, // Slate
  "3d": { accent: "#84cc16", bg: "#ecfccb" }, // Lime Green
  "mathematics": { accent: "#1d4ed8", bg: "#eff6ff" }, // Dark Blue
  "evaluation": { accent: "#b45309", bg: "#fffbeb" }, // Dark Amber
  "interpretability": { accent: "#6d28d9", bg: "#f5f3ff" }, // Deep Purple
  "safety": { accent: "#b91c1c", bg: "#fef2f2" }, // Deep Red
  "systems": { accent: "#0f766e", bg: "#f0fdfa" }, // Deep Teal
  "hardware": { accent: "#4338ca", bg: "#eef2ff" }, // Deep Indigo
  "research-concepts": { accent: "#a21caf", bg: "#fdf4ff" } // Deep Fuchsia
};

export function getCategoryColors(id: string) {
  // Return the mapped color, or fallback to the signature orange if not found
  return CATEGORY_COLORS[id] || { accent: "#FF5A1F", bg: "#fff4f0" };
}
