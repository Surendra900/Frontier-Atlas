import XLSX from "xlsx";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const file = path.join(__dirname, "..", "papers_with_github.xlsx");
const workbook = XLSX.readFile(file);
console.log("Sheet names:", workbook.SheetNames);
for (const sheet of workbook.SheetNames) {
  const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheet]);
  console.log(`Sheet "${sheet}" row count:`, rows.length);
  if (rows.length > 0) {
    console.log("Sample columns:", Object.keys(rows[0]));
  }
}
