import XLSX from "xlsx";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const file = path.join(__dirname, "..", "papers_with_github.xlsx");
const workbook = XLSX.readFile(file);
const rows = XLSX.utils.sheet_to_json<any>(workbook.Sheets["sota_backend_v2"]);
const names = Array.from(new Set(rows.map(r => r.benchmark_name)));
console.log("Total unique benchmarks:", names.length);
console.log("Matching speech/tts/voice/audio:", names.filter(n => {
  const l = String(n).toLowerCase();
  return l.includes("tts") || l.includes("speech") || l.includes("voice") || l.includes("audio");
}));
