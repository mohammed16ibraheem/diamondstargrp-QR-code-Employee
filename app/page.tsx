"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { QRCodeSVG } from "qrcode.react";

type Contact = {
  name: string;
  title: string;
  company: string;
  email: string;
  phonePrimary: string;
  phoneSecondary?: string;
  location: string;
  extra?: string;
};

export default function Home() {
  const [selectedContact] = useState<Contact>({
    name: "Khalid Mohsin Al",
    title: "Executive Director",
    company: "Niemat Altayibat Food Products Factory",
    email: "ktanwar@namma-alenjaz.co",
    phonePrimary: "+966 50 463 668",
    phoneSecondary: "+966 12 670 4100",
    location: "Building No. 2302, Unit 453, Ad-Dahiah District, Jeddah 21429, Saudi Arabia",
    extra: "Diamond Star / Namma Al Enjaz Group",
  });

  const vcardText = useMemo(() => {
    // vCard 3.0: use CRLF and fold long lines at 75 chars so phones recognize it
    const CRLF = "\r\n";
    const fold = (line: string) => {
      if (line.length <= 75) return line;
      const folded: string[] = [];
      for (let i = 0; i < line.length; i += 75) {
        const chunk = line.slice(i, i + 75);
        folded.push(folded.length === 0 ? chunk : " " + chunk);
      }
      return folded.join(CRLF);
    };

    const lines = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      fold(`N:${selectedContact.name};;;`),
      fold(`FN:${selectedContact.name}`),
      fold(`ORG:${selectedContact.company}`),
      fold(`TITLE:${selectedContact.title}`),
      fold(`EMAIL;TYPE=INTERNET:${selectedContact.email}`),
      fold(`TEL;TYPE=CELL:${selectedContact.phonePrimary.replace(/\s/g, "")}`),
      selectedContact.phoneSecondary
        ? fold(`TEL;TYPE=WORK,VOICE:${selectedContact.phoneSecondary.replace(/\s/g, "")}`)
        : "",
      fold(`ADR;TYPE=WORK:;;${selectedContact.location};;;;;`),
      "END:VCARD",
    ].filter(Boolean);

    return lines.join(CRLF);
  }, [selectedContact]);

  const handleDownloadVcard = () => {
    const blob = new Blob([vcardText], { type: "text/vcard;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${selectedContact.name.replace(/\s+/g, "_")}.vcf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const qrValue = useMemo(() => vcardText, [vcardText]);

  return (
    <div className="min-h-screen bg-slate-950 bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 flex items-stretch justify-center px-3 py-5 sm:px-4 sm:py-10">
      <main className="w-full max-w-6xl rounded-3xl border border-white/10 bg-white/5 shadow-2xl shadow-black/50 backdrop-blur-xl overflow-hidden">
        <div className="border-b border-white/5 bg-black/20 px-4 py-4 sm:px-7 sm:py-5 md:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-slate-700 shadow-lg ring-2 ring-white/20 sm:h-14 sm:w-14 md:h-16 md:w-16">
              <Image
                src="/logo-profile.png"
                alt="Diamond Star"
                fill
                className="object-cover object-center"
                sizes="64px"
                priority
              />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-300 sm:text-xs">
                Diamond Star Group
              </p>
              <p className="truncate text-[11px] text-slate-400 sm:text-xs">
                Smart digital visiting card
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-4 md:grid md:grid-cols-[1.15fr,1fr] md:gap-0">
          <section className="relative overflow-hidden px-4 pb-6 pt-5 sm:px-7 sm:pb-8 sm:pt-8 md:p-10 lg:p-12">
            <div className="pointer-events-none absolute inset-0 opacity-70">
              <div className="absolute -left-32 -top-32 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl" />
              <div className="absolute -right-40 bottom-0 h-80 w-80 rounded-full bg-sky-500/20 blur-3xl" />
            </div>

            <div className="relative flex flex-col gap-7 sm:gap-8">
              <header className="flex items-start justify-between gap-3 md:gap-4">
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs uppercase tracking-[0.25em] text-emerald-300/80">
                    Digital Visiting Card
                  </p>
                  <h1 className="mt-2 text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight leading-snug">
                    {selectedContact.name}
                  </h1>
                  <p className="mt-1.5 text-sm sm:text-base text-slate-300">
                    {selectedContact.title}
                  </p>
                  <p className="mt-1 text-[13px] sm:text-sm font-medium text-emerald-300">
                    {selectedContact.company}
                  </p>
                  {selectedContact.extra && (
                    <p className="mt-1 text-[11px] sm:text-xs text-slate-400">
                      {selectedContact.extra}
                    </p>
                  )}
                </div>

                <div className="hidden xs:flex flex-col items-end gap-2 sm:gap-3">
                  <div className="rounded-full border border-emerald-400/40 bg-emerald-500/15 px-3 py-1 text-[10px] sm:text-xs font-medium uppercase tracking-[0.18em] text-emerald-200">
                    Diamond Star Group
                  </div>
                  <div className="hidden text-right text-[11px] text-slate-400 sm:block">
                    <p>Share this card instantly</p>
                    <p>via QR code or vCard</p>
                  </div>
                </div>
              </header>

              <div className="mt-1 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                <div className="space-y-3 rounded-2xl border border-white/10 bg-black/40 p-3.5 sm:p-4 md:p-5">
                  <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Contact
                  </p>
                  <div className="space-y-2 text-[13px] sm:text-sm">
                    <a
                      href={`tel:${selectedContact.phonePrimary}`}
                      className="flex items-center justify-between rounded-xl bg-black/60 px-3 py-2.5 text-slate-50 ring-1 ring-white/10 transition hover:bg-black/80 hover:ring-emerald-400/60 active:scale-[0.99]"
                    >
                      <span className="mr-4">
                        Call (Mobile)
                        <span className="block text-[11px] text-slate-300">
                          {selectedContact.phonePrimary}
                        </span>
                      </span>
                      <span className="shrink-0 rounded-full bg-emerald-500/10 px-2 py-1 text-[11px] font-semibold text-emerald-300">
                        Tap
                      </span>
                    </a>
                    {selectedContact.phoneSecondary && (
                      <a
                        href={`tel:${selectedContact.phoneSecondary}`}
                        className="flex items-center justify-between rounded-xl bg-black/30 px-3 py-2.5 text-slate-100 ring-1 ring-white/5 transition hover:bg-black/60 hover:ring-emerald-400/40 active:scale-[0.99]"
                      >
                      <span className="mr-4">
                          Call (Office)
                          <span className="block text-[11px] text-slate-300">
                            {selectedContact.phoneSecondary}
                          </span>
                        </span>
                        <span className="shrink-0 rounded-full bg-slate-50/5 px-2 py-1 text-[11px] font-semibold text-slate-200">
                          Tap
                        </span>
                      </a>
                    )}
                    <a
                      href={`mailto:${selectedContact.email}`}
                      className="flex items-center justify-between rounded-xl bg-black/30 px-3 py-2.5 text-slate-100 ring-1 ring-white/5 transition hover:bg-black/60 hover:ring-emerald-400/40 active:scale-[0.99]"
                    >
                      <span className="mr-4">
                        Email
                        <span className="block max-w-48 truncate text-[11px] text-slate-300 sm:max-w-[16rem] sm:text-xs">
                          {selectedContact.email}
                        </span>
                      </span>
                      <span className="shrink-0 rounded-full bg-slate-50/5 px-2 py-1 text-[11px] font-semibold text-slate-200">
                        Tap
                      </span>
                    </a>
                  </div>
                </div>

                <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-3.5 sm:p-4 md:p-5">
                  <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Office
                  </p>
                  <p className="text-[13px] sm:text-sm leading-relaxed text-slate-200">
                    {selectedContact.location}
                  </p>
                  <button
                    onClick={handleDownloadVcard}
                    className="mt-1 inline-flex w-full items-center justify-center rounded-xl bg-emerald-500 px-4 py-2.5 text-[13px] sm:text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/40 transition hover:bg-emerald-400 active:scale-[0.99]"
                  >
                    Save contact (vCard)
                  </button>
                </div>
              </div>

            </div>
          </section>

          <section className="border-b border-white/10 bg-slate-950/70 px-4 pb-5 pt-4 sm:px-7 sm:pb-6 sm:pt-6 md:border-b-0 md:border-l md:px-8 md:py-9 lg:px-9">
            <div className="flex h-full flex-col justify-between gap-6">
              <div className="space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="max-w-xs">
                    <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Share
                    </p>
                    <h2 className="mt-1 text-base sm:text-lg font-medium text-slate-50">
                      QR code for this card
                    </h2>
                    <p className="mt-1 text-[11px] sm:text-xs text-slate-400">
                      Point any smartphone camera at the code to open &amp; save
                      the contact in seconds.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 sm:text-xs">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)]" />
                    <span>Ready to scan</span>
                  </div>
                </div>

                <div className="mt-2 flex flex-col items-center gap-4 rounded-2xl border border-slate-700/80 bg-slate-900/90 p-3.5 sm:p-4 shadow-inner shadow-black/60">
                  <div className="relative rounded-2xl bg-white p-2.5 shadow-lg shadow-black/40 sm:p-3">
                    <QRCodeSVG
                      value={qrValue}
                      size={176}
                      bgColor="#ffffff"
                      fgColor="#020617"
                      level="H"
                      includeMargin
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-lg bg-white shadow-[0_0_24px_rgba(255,255,255,0.7),0_0_48px_rgba(255,255,255,0.35)] sm:h-16 sm:w-16">
                        <Image
                          src="/logo-profile.png"
                          alt=""
                          width={64}
                          height={64}
                          className="h-full w-full object-cover"
                          aria-hidden
                        />
                      </div>
                    </div>
                  </div>
                  <p className="max-w-xs text-center text-[11px] sm:text-xs text-slate-400">
                    Tip for iPhone &amp; Android: open the Camera app, point at
                    the QR, then tap the banner to save the contact.
                  </p>
                </div>
              </div>

            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
