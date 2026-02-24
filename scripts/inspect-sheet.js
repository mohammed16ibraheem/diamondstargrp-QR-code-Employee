const XLSX = require("xlsx");
const path = require("path");
const xlsxPath = path.join(__dirname, "..", "..", "DIGITAL VISITING CARD 27 JAN .xlsx");
const workbook = XLSX.readFile(xlsxPath);
console.log("Sheet names:", workbook.SheetNames);
workbook.SheetNames.forEach((name, sheetIdx) => {
  const sheet = workbook.Sheets[name];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
  console.log("\n--- Sheet:", name, "rows:", rows.length, "---");
  rows.slice(0, 20).forEach((row, i) => console.log(i, row.length, JSON.stringify(row)));
});
