const XLSX = require("xlsx");
const path = require("path");
const fs = require("fs");

// Source: DIGITAL VISITING CARD 27 JAN -QR-code.xlsx — same list = same numbers in app and QR codes.
const xlsxPath = path.join(__dirname, "..", "..", "DIGITAL VISITING CARD 27 JAN -QR-code.xlsx");
const outPath = path.join(__dirname, "..", "app", "data", "contacts.json");

const norm = (p) => {
  if (!p) return "";
  p = String(p).replace(/\s/g, "").replace(/\D/g, "");
  if (p.startsWith("966")) return "+" + p;
  if (p.startsWith("971")) return "+" + p;
  if (p.startsWith("91")) return "+" + p;
  if (p.startsWith("05")) return "+966" + p.slice(1);
  if (p.startsWith("5") && p.length >= 9) return "+966" + p;
  if (p.startsWith("12") || p.startsWith("012")) return "+966" + p.replace(/^0?12/, "12");
  return p ? "+" + p : "";
};

try {
  const workbook = XLSX.readFile(xlsxPath);
  const contacts = [];
  const sectionNames = workbook.SheetNames;

  for (const sheetName of sectionNames) {
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
    const headers = (rows[1] || []).map((h) => String(h || "").trim());

    for (let i = 2; i < rows.length; i++) {
      const row = rows[i] || [];
      const get = (key) => {
        let idx = headers.indexOf(key);
        if (idx < 0 && key.includes("(H.O)")) idx = headers.indexOf(key.replace("(H.O)", "(H.O.)"));
        return idx >= 0 ? String(row[idx] != null ? row[idx] : "").trim() : "";
      };

      const sn = get("SN");
      const name = get("NAME") || get("NAME ARABIC");
      const position = get("POSITION");
      const email = get("EMAIL");
      const mobileStr = get("MOBILE");
      const telephoneStr = get("TELEPHONE (H.O)") || get("TELEPHONE (H.O.)");
      const address = get("ADDRESS (H.O)") || get("ADDRESS (H.O.)");

      const hasAnyData = sn || name || position || email || mobileStr || telephoneStr || address;
      if (!hasAnyData) continue;

      const telephone = telephoneStr ? norm(telephoneStr.split(/[/]/)[0].trim()) : "";
      const mobile = mobileStr ? norm(mobileStr.split(/[/]/)[0].trim()) : "";
      const firstPhone = mobile || telephone;
      const secondPhone = mobile && telephone ? telephone : "";

      // Preserve Excel SN so app list and QR codes use the same numbers as the sheet.
      const snStr = sn ? String(sn).trim() : String(contacts.length + 1);

      contacts.push({
        sn: snStr,
        section: sheetName,
        name: name || "—",
        title: position || "",
        nameArabic: get("NAME ARABIC") || "",
        titleArabic: get("POSITION ARABIC") || "",
        phonePrimary: firstPhone,
        phoneSecondary: secondPhone,
        location: address,
        email: (email || "").replace(/>$/, "").trim(),
        company: sheetName === "DSA Group" ? "Diamond Star Arabia Industrial Company" : "Green City Trading",
      });
    }
  }

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(contacts, null, 2), "utf8");
  const greenCount = contacts.filter((c) => c.section === "GREEN CITY").length;
  const dsaCount = contacts.filter((c) => c.section === "DSA Group").length;
  console.log("Wrote", contacts.length, "contacts: GREEN CITY", greenCount, ", DSA Group", dsaCount);
} catch (e) {
  console.error("Error:", e.message);
  process.exit(1);
}
