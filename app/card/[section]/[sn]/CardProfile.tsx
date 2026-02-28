"use client";

import Image from "next/image";
import { useMemo } from "react";

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
};

const COMPANY_INFO =
  "The Diamond Star Group is a coalition of companies committed to revolutionizing the recycling industry through sustainable practices and innovative technology. Operating across the Kingdom of Saudi Arabia, the United Arab Emirates, Singapore, Japan, China and India.";

export function CardProfile({
  contact,
  companyWebsite,
  companyProfilePdf,
}: {
  contact: Contact;
  companyWebsite: string;
  companyProfilePdf: string;
}) {
  const vcardText = useMemo(() => {
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
      fold(`N:${name};;;`),
      fold(`FN:${name}`),
      fold(`ORG:${org}`),
      fold(`TITLE:${title}`),
      tel1 ? fold(`TEL;TYPE=CELL,VOICE:${tel1}`) : "",
      tel2 ? fold(`TEL;TYPE=WORK,VOICE:${tel2}`) : "",
      email ? fold(`EMAIL;TYPE=INTERNET:${email}`) : "",
      loc ? fold(`ADR;TYPE=WORK:;;${loc};;;;;`) : "",
      "END:VCARD",
    ].filter(Boolean);
    return lines.join(CRLF);
  }, [contact]);

  const handleDownloadVcard = () => {
    const blob = new Blob([vcardText], { type: "text/vcard;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${contact.name.replace(/\s+/g, "_")}.vcf`;
    a.click();
    URL.revokeObjectURL(url);
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

        {/* Contact card */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur sm:p-8">
          {/* Photo placeholder + name */}
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-700 ring-2 ring-white/20">
              <Image
                src="/logo-profile.png"
                alt=""
                width={96}
                height={96}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="text-center sm:text-left">
              <p className="text-xs font-medium uppercase tracking-wider text-emerald-400">
                {contact.section}
              </p>
              <h1 className="mt-1 text-2xl font-semibold text-white sm:text-3xl">
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

          {/* Save contact */}
          <div className="mt-6">
            <button
              onClick={handleDownloadVcard}
              className="w-full rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 shadow-lg transition hover:bg-emerald-400"
            >
              Save contact to phone (vCard)
            </button>
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
