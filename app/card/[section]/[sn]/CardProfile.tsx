"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

type Contact = {
  sn: string;
  section: string;
  name: string;
  title: string;
  nameArabic?: string;
  titleArabic?: string;
  company: string;
  email: string;
  phonePrimary: string;
  phoneSecondary?: string;
  location: string;
  photo?: string;
};

const COMPANY_INFO =
  "The Diamond Star Group is a coalition of companies committed to revolutionizing the recycling industry through sustainable practices and innovative technology. Operating across the Kingdom of Saudi Arabia, the United Arab Emirates, Singapore, Japan, China and India.";

function buildVcardText(contact: Contact, photoBase64?: string): string {
  const c = contact;
  const CRLF = "\r\n";
  const BOM = "\uFEFF";
  const escape = (s: string) =>
    String(s || "")
      .replace(/\\/g, "\\\\")
      .replace(/;/g, "\\;")
      .replace(/,/g, "\\,")
      .replace(/\r?\n/g, "\\n");
  const fold = (line: string) => {
    if (line.length <= 75) return line;
    const folded: string[] = [];
    for (let i = 0; i < line.length; i += 75) {
      const chunk = line.slice(i, i + 75);
      folded.push(folded.length === 0 ? chunk : " " + chunk);
    }
    return folded.join(CRLF);
  };
  const name = escape(c.name);
  const title = escape(c.title);
  const org = escape(c.company);
  const loc = c.location ? escape(c.location) : "";
  const tel1 = (c.phonePrimary || "").replace(/\s/g, "");
  const tel2 = (c.phoneSecondary || "").replace(/\s/g, "");
  const email = c.email && c.email.includes("@") ? c.email : "";
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    "PRODID:-//Diamond Star Group//Digital Visiting Card//EN",
    fold(`N:${name};;;`),
    fold(`FN:${name}`),
    fold(`ORG:${org}`),
    fold(`TITLE:${title}`),
    tel1 ? fold(`TEL;TYPE=CELL,VOICE:${tel1}`) : "",
    tel2 ? fold(`TEL;TYPE=WORK,VOICE:${tel2}`) : "",
    email ? fold(`EMAIL;TYPE=INTERNET:${email}`) : "",
    loc ? fold(`ADR;TYPE=WORK:;;${loc};;;;;`) : "",
  ];
  if (photoBase64) {
    lines.push(fold(`PHOTO;ENCODING=b;TYPE=JPEG:${photoBase64}`));
  }
  lines.push("END:VCARD");
  return BOM + lines.filter(Boolean).join(CRLF);
}

export function CardProfile({
  contact,
  companyWebsite,
  companyProfilePdf,
}: {
  contact: Contact;
  companyWebsite: string;
  companyProfilePdf: string;
}) {
  const [addingContact, setAddingContact] = useState(false);
  const vcardTextBase = useMemo(() => buildVcardText(contact), [contact]);

  const imageToContactPhotoBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      const url = URL.createObjectURL(blob);
      img.onload = () => {
        URL.revokeObjectURL(url);
        const max = 256;
        let w = img.naturalWidth;
        let h = img.naturalHeight;
        if (w > max || h > max) {
          if (w > h) {
            h = Math.round((h * max) / w);
            w = max;
          } else {
            w = Math.round((w * max) / h);
            h = max;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas not supported"));
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);
        try {
          const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
          const base64 = dataUrl.split(",")[1] || "";
          resolve(base64);
        } catch {
          reject(new Error("toDataURL failed"));
        }
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Image load failed"));
      };
      img.src = url;
    });
  };

  const handleAddToContacts = async () => {
    setAddingContact(true);
    let photoBase64: string | undefined;
    if (contact.photo) {
      try {
        const photoUrl = `/photos/${encodeURIComponent(contact.photo)}`;
        const res = await fetch(photoUrl);
        if (res.ok) {
          const blob = await res.blob();
          photoBase64 = await imageToContactPhotoBase64(blob);
        }
      } catch {
        // fallback: save without photo
      }
    }
    const vcardText = photoBase64 ? buildVcardText(contact, photoBase64) : vcardTextBase;
    const blob = new Blob([vcardText], { type: "text/vcard;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const safeName = contact.name.replace(/[^\p{L}\p{N}\s-]/gu, "").replace(/\s+/g, " ").trim() || "contact";
    const fileName = `${safeName}.vcf`;

    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.setAttribute("download", fileName);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setAddingContact(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
        {/* Header with logo */}
        <div className="mb-8 flex items-center justify-between gap-4">
          <a
            href={companyWebsite}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3"
          >
            <div className="relative h-12 w-12 overflow-hidden rounded-full bg-slate-700 sm:h-14 sm:w-14">
              <Image
                src="/logo-profile.png"
                alt="Diamond Star"
                fill
                className="object-cover object-center"
                sizes="56px"
              />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Diamond Star Group</p>
              <p className="text-xs text-slate-400">Visit company website →</p>
            </div>
          </a>
        </div>

        {/* Contact card — optimized for users who scanned the QR */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur sm:p-8">
          {/* Hero: profile photo first (main representation for scanners) */}
          <div className="flex flex-col items-center text-center">
            <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-2xl bg-slate-700 ring-2 ring-white/20 shadow-xl sm:h-40 sm:w-40">
              <Image
                src={contact.photo ? `/photos/${encodeURIComponent(contact.photo)}` : "/logo-profile.png"}
                alt={contact.name}
                fill
                className="object-cover object-center"
                sizes="(max-width: 640px) 128px, 160px"
                priority
              />
            </div>
            <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-400/90">
              Digital Visiting Card
            </p>
            <p className="mt-2 text-xs font-medium uppercase tracking-wider text-slate-400">
              {contact.section}
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
              {contact.name}
            </h1>
            <p className="mt-1 text-slate-300">{contact.title}</p>
            <p className="mt-1 text-sm font-medium text-emerald-300/90">
              {contact.company}
            </p>
            {contact.nameArabic && (
              <p className="mt-2 text-sm text-slate-400" dir="rtl">
                {contact.nameArabic}
                {contact.titleArabic && ` · ${contact.titleArabic}`}
              </p>
            )}
          </div>

          {/* Contact details */}
          <div className="mt-8 space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Contact
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <a
                href={`tel:${contact.phonePrimary}`}
                className="flex items-center gap-3 rounded-xl bg-black/30 px-4 py-3 text-slate-100 ring-1 ring-white/10 transition hover:bg-black/50"
              >
                <span className="text-sm font-medium">Mobile</span>
                <span className="text-sm">{contact.phonePrimary}</span>
              </a>
              {contact.phoneSecondary && (
                <a
                  href={`tel:${contact.phoneSecondary}`}
                  className="flex items-center gap-3 rounded-xl bg-black/30 px-4 py-3 text-slate-100 ring-1 ring-white/10 transition hover:bg-black/50"
                >
                  <span className="text-sm font-medium">Office</span>
                  <span className="text-sm">{contact.phoneSecondary}</span>
                </a>
              )}
              {contact.email && contact.email.includes("@") ? (
                <a
                  href={`mailto:${contact.email}`}
                  className="flex items-center gap-3 rounded-xl bg-black/30 px-4 py-3 text-slate-100 ring-1 ring-white/10 transition hover:bg-black/50 sm:col-span-2"
                >
                  <span className="text-sm font-medium">Email</span>
                  <span className="truncate text-sm">{contact.email}</span>
                </a>
              ) : (
                contact.email && (
                  <div className="flex items-center gap-3 rounded-xl bg-black/30 px-4 py-3 text-slate-400 sm:col-span-2">
                    <span className="text-sm font-medium">Email</span>
                    <span className="text-sm">{contact.email}</span>
                  </div>
                )
              )}
              {contact.location && (
                <div className="rounded-xl bg-black/30 px-4 py-3 text-sm text-slate-300 ring-1 ring-white/10 sm:col-span-2">
                  <span className="font-medium text-slate-400">Address</span>
                  <p className="mt-1">{contact.location}</p>
                </div>
              )}
            </div>
          </div>

          {/* Add to Contacts — works on iPhone & Android, includes profile photo */}
          <div className="mt-6">
            <button
              type="button"
              onClick={handleAddToContacts}
              disabled={addingContact}
              className="w-full rounded-xl bg-emerald-500 px-4 py-4 text-base font-semibold text-slate-950 shadow-lg transition active:scale-[0.98] hover:bg-emerald-400 disabled:opacity-70 disabled:cursor-wait"
            >
              {addingContact ? "Preparing…" : "Add to Contacts"}
            </button>
            <p className="mt-2 text-center text-xs text-slate-500">
              Saves name, photo, and details to your phone — iPhone &amp; Android. Tap the file if prompted to add.
            </p>
          </div>
        </div>

        {/* Company info */}
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur sm:p-8">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            About Diamond Star
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            {COMPANY_INFO}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={companyWebsite}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-medium text-white ring-1 ring-white/20 transition hover:bg-white/20"
            >
              Company website
              <span className="text-slate-400">→</span>
            </a>
            <a
              href={companyProfilePdf}
              download="ds-company-profile-eng.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-medium text-white ring-1 ring-white/20 transition hover:bg-white/20"
            >
              Download company profile (PDF)
            </a>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-slate-500">
          © Diamond Star Group · Digital Visiting Card
        </p>
      </div>
    </div>
  );
}
