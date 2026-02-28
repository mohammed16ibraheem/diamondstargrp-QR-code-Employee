import type { Metadata } from "next";
import contactsList from "@/app/data/contacts.json";
import { CardProfile } from "./CardProfile";

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
  return {
    title: `${contact.name} | ${contact.title} | Diamond Star`,
    description: `Digital visiting card for ${contact.name}, ${contact.title} at ${contact.company}. Diamond Star Group - Leading the way in recycling and sustainability.`,
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
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-300">
        <p>Contact not found.</p>
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
