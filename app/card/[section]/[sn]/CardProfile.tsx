"use client";

import Image from "next/image";
import { useMemo, useState, useEffect } from "react";
import { toTitleCase } from "@/app/lib/format";

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
    fold(`N;CHARSET=UTF-8:${name};;;`),
    fold(`FN;CHARSET=UTF-8:${name}`),
    fold(`ORG;CHARSET=UTF-8:${org}`),
    fold(`TITLE;CHARSET=UTF-8:${title}`),
    tel1 ? fold(`TEL;TYPE=CELL,VOICE:${tel1}`) : "",
    tel2 ? fold(`TEL;TYPE=WORK,VOICE:${tel2}`) : "",
    email ? fold(`EMAIL;TYPE=INTERNET:${email}`) : "",
    loc ? fold(`ADR;TYPE=WORK;CHARSET=UTF-8:;;${loc};;;;;`) : "",
  ];
  if (photoBase64) {
    lines.push(fold(`PHOTO;ENCODING=b;TYPE=JPEG:${photoBase64}`));
  }
  lines.push("END:VCARD");
  return lines.filter(Boolean).join(CRLF);
}

export function CardProfile({
  contact,
  companyWebsite,
  companyProfilePdf,
  companyLinkedIn,
}: {
  contact: Contact;
  companyWebsite: string;
  companyProfilePdf: string;
  companyLinkedIn: string;
}) {
  const [addingContact, setAddingContact] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const vcardTextBase = useMemo(() => buildVcardText(contact), [contact]);

  useEffect(() => {
    if (!justSaved) return;
    const t = setTimeout(() => setJustSaved(false), 4000);
    return () => clearTimeout(t);
  }, [justSaved]);

  const whatsappNumber = (contact.phonePrimary || "").replace(/\D/g, "");
  const mapsQuery = contact.location
    ? encodeURIComponent(contact.location.trim())
    : encodeURIComponent("Building No. 2302, Unit 453, Ad-Dahiah Dist., P.O. Box 43104, Jeddah 21561, Saudi Arabia");
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;

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
    const blob = new Blob([vcardText], { type: "text/x-vcard;charset=utf-8" });
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
    setJustSaved(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
        {/* Header with logo */}
        <div className="mb-8 flex items-center justify-between gap-4 opacity-0 animate-card-in" style={{ animationDelay: "0ms" }}>
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
                unoptimized
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
          <div className="flex flex-col items-center text-center opacity-0 animate-card-in" style={{ animationDelay: "50ms" }}>
            <div className="relative h-40 w-40 shrink-0 overflow-hidden rounded-2xl bg-slate-700 ring-2 ring-white/20 shadow-xl sm:h-52 sm:w-52">
              <Image
                src={contact.photo ? `/photos/${encodeURIComponent(contact.photo)}` : "/logo-profile.png"}
                alt={contact.name}
                fill
                className="object-cover object-center"
                sizes="(max-width: 640px) 160px, 208px"
                priority
                unoptimized
              />
            </div>
            <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-400/90">
              Digital Visiting Card
            </p>
            <p className="mt-2 text-xs font-medium uppercase tracking-wider text-slate-400">
              {toTitleCase(contact.section)}
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
              {toTitleCase(contact.name)}
            </h1>
            <p className="mt-1 text-slate-300">{toTitleCase(contact.title)}</p>
            <p className="mt-1 text-sm font-medium text-emerald-300/90">
              {toTitleCase(contact.company)}
            </p>
            {contact.nameArabic && (
              <p className="mt-2 text-sm text-slate-400" dir="rtl">
                {contact.nameArabic}
                {contact.titleArabic && ` · ${contact.titleArabic}`}
              </p>
            )}
          </div>

          {/* Contact details */}
          <div className="mt-8 space-y-4 opacity-0 animate-card-in" style={{ animationDelay: "150ms" }}>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Contact
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-2 sm:col-span-2">
                <a
                  href={`tel:${contact.phonePrimary}`}
                  className="flex items-center gap-3 rounded-xl bg-black/30 px-4 py-3 text-slate-100 ring-1 ring-white/10 transition hover:bg-black/50"
                >
                  <svg className="h-5 w-5 shrink-0 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <div className="min-w-0 flex-1">
                    <span className="block text-sm font-medium">Mobile</span>
                    <span className="text-sm">{contact.phonePrimary}</span>
                  </div>
                </a>
                {whatsappNumber && (
                  <a
                    href={`https://wa.me/${whatsappNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-xl bg-[#25D366]/20 px-4 py-3 text-white ring-1 ring-[#25D366]/40 transition hover:bg-[#25D366]/30"
                  >
                    <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    <span className="text-sm font-semibold">WhatsApp — Message directly</span>
                  </a>
                )}
              </div>
              {contact.phoneSecondary && (
                <a
                  href={`tel:${contact.phoneSecondary}`}
                  className="flex items-center gap-3 rounded-xl bg-black/30 px-4 py-3 text-slate-100 ring-1 ring-white/10 transition hover:bg-black/50"
                >
                  <svg className="h-5 w-5 shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <div className="min-w-0 flex-1">
                    <span className="block text-sm font-medium">Office</span>
                    <span className="text-sm">{contact.phoneSecondary}</span>
                  </div>
                </a>
              )}
              {contact.email && contact.email.includes("@") ? (
                <a
                  href={`mailto:${contact.email}`}
                  className="flex items-center gap-3 rounded-xl bg-black/30 px-4 py-3 text-slate-100 ring-1 ring-white/10 transition hover:bg-black/50 sm:col-span-2"
                >
                  <svg className="h-5 w-5 shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div className="min-w-0 flex-1">
                    <span className="block text-sm font-medium">Email</span>
                    <span className="truncate text-sm">{contact.email}</span>
                  </div>
                </a>
              ) : (
                contact.email && (
                  <div className="flex items-center gap-3 rounded-xl bg-black/30 px-4 py-3 text-slate-400 sm:col-span-2">
                    <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <div className="min-w-0 flex-1">
                      <span className="block text-sm font-medium">Email</span>
                      <span className="text-sm">{contact.email}</span>
                    </div>
                  </div>
                )
              )}
              {(contact.location || true) && (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-xl bg-black/30 px-4 py-3 text-slate-100 ring-1 ring-white/10 transition hover:bg-black/50 sm:col-span-2"
                >
                  <svg className="h-5 w-5 shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-slate-400">Address</span>
                    <p className="mt-0.5 text-sm">{contact.location || "Building No. 2302, Unit 453, Ad-Dahiah Dist., P.O. Box 43104, Jeddah 21561, Saudi Arabia"}</p>
                    <span className="mt-1 block text-xs text-emerald-400">Open in Google Maps →</span>
                  </div>
                </a>
              )}
            </div>
          </div>

          {/* Add to Contacts — works on iPhone & Android, includes profile photo */}
          <div className="mt-6 opacity-0 animate-card-in" style={{ animationDelay: "300ms" }}>
            <button
              type="button"
              onClick={handleAddToContacts}
              disabled={addingContact}
              className={`w-full rounded-xl px-4 py-4 text-base font-semibold shadow-lg transition active:scale-[0.98] disabled:cursor-wait ${
                justSaved
                  ? "bg-emerald-500 text-slate-950"
                  : addingContact
                    ? "bg-emerald-500/70 text-slate-950"
                    : "bg-emerald-500 text-slate-950 hover:bg-emerald-400"
              }`}
            >
              {justSaved
                ? "Contact saved! Tap the downloaded file to add."
                : addingContact
                  ? "Preparing…"
                  : "Add to Contacts"}
            </button>
            <p className="mt-2 text-center text-xs text-slate-500">
              {justSaved ? "Check your downloads folder, then tap the .vcf file." : "Saves name, photo, and details to your phone — iPhone &amp; Android. Tap the file if prompted to add."}
            </p>
          </div>
        </div>

        {/* Company info */}
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur sm:p-8 opacity-0 animate-card-in" style={{ animationDelay: "450ms" }}>
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
              href={companyLinkedIn}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-[#0A66C2]/20 px-4 py-2.5 text-sm font-medium text-white ring-1 ring-[#0A66C2]/40 transition hover:bg-[#0A66C2]/30"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              LinkedIn
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
