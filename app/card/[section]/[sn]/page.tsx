import type { Metadata } from "next";
import contactsList from "@/app/data/contacts.json";
import { CardProfile } from "./CardProfile";
import Link from "next/link";

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

const contacts = contactsList as Contact[];
const COMPANY_WEBSITE = "https://diamondstargrp.com/ar/";
const COMPANY_PROFILE_PDF = "/ds-company-profile-eng.pdf";

function getContact(section: string, sn: string): Contact | null {
  const s = decodeURIComponent(section);
  const n = decodeURIComponent(sn);
  return contacts.find((c) => c.section === s && c.sn === n) ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ section: string; sn: string }>;
}): Promise<Metadata> {
  const { section, sn } = await params;
  const contact = getContact(section, sn);
  if (!contact) return { title: "Digital Visiting Card" };

  const title = `${contact.name} | ${contact.title} | Diamond Star`;
  const description = `Digital visiting card for ${contact.name}, ${contact.title} at ${contact.company}. Diamond Star Group - Leading the way in recycling and sustainability.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "profile",
      images: [
        {
          url: contact.photo ? `/photos/${contact.photo}` : "/logo-profile.png",
          width: 400,
          height: 400,
          alt: contact.name,
        },
      ],
      siteName: "Diamond Star Group",
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: contact.photo ? [`/photos/${contact.photo}`] : ["/logo-profile.png"],
    },
  };
}

export default async function CardPage({
  params,
}: {
  params: Promise<{ section: string; sn: string }>;
}) {
  const { section, sn } = await params;
  const contact = getContact(section, sn);

  if (!contact) {
    return (
      <div className="min-h-screen bg-slate-950 bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-800 ring-1 ring-white/10">
            <svg className="h-10 w-10 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-white">Contact not found</h1>
          <p className="mt-3 text-sm text-slate-400">
            This digital visiting card could not be found. The link may be outdated or the contact may have been removed.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
            >
              Go to homepage
            </Link>
            <a
              href={COMPANY_WEBSITE}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-xl bg-white/10 px-5 py-3 text-sm font-medium text-white ring-1 ring-white/20 transition hover:bg-white/20"
            >
              Visit Diamond Star Group →
            </a>
          </div>
          <p className="mt-10 text-xs text-slate-600">
            © Diamond Star Group · Digital Visiting Card
          </p>
        </div>
      </div>
    );
  }

  return (
    <CardProfile
      contact={contact}
      companyWebsite={COMPANY_WEBSITE}
      companyProfilePdf={COMPANY_PROFILE_PDF}
    />
  );
}
