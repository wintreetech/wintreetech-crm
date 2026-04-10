import { FileText, GlobeLock, MailPlus, Route } from "lucide-react";

export const developmentSections = [
  {
    title: "Business Plan",
    description: "Store planning documents, decks, and related attachments.",
    icon: FileText,
  },
  {
    title: "Customer Journey",
    description: "Manage journey maps, flows, and supporting artefacts.",
    icon: Route,
  },
  {
    title: "Domain Ownership",
    description: "Upload registrar proofs, DNS records, and ownership files.",
    icon: GlobeLock,
  },
  {
    title: "Invoice & Email",
    description: "Track invoice copies and email-related supporting files.",
    icon: MailPlus,
  },
];
