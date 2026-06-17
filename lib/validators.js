export const COMMISSION_RATE = 0.15;

export const UNI_DOMAINS = [
  "maastrichtuniversity.nl",
  "student.maastrichtuniversity.nl",
  "ru.nl",
  "uva.nl",
  "vu.nl",
  "tudelft.nl",
  "tilburguniversity.edu",
  "uu.nl",
  "rug.nl",
  "ucm.nl",
  "eur.nl",
];

export function isUniEmail(email) {
  const domain = String(email).toLowerCase().split("@")[1];
  return !!domain && UNI_DOMAINS.some((d) => domain === d || domain.endsWith("." + d));
}

export function isPlausibleVat(vat) {
  return /^[A-Z]{2}[A-Z0-9]{8,12}$/.test(String(vat).toUpperCase().replace(/\s/g, ""));
}

export const INDUSTRIES = [
  "Marketing & Branding",
  "Software & IT",
  "Finance & Accounting",
  "Legal",
  "Logistics",
  "Sustainability & ESG",
  "HR & Recruitment",
  "Market Research",
  "Design & Creative",
  "Operations",
];

export const LANGUAGES = ["English", "Dutch", "French", "German", "Spanish"];

export const DELIVERABLE_TYPES = [
  "Market research report",
  "Pitch deck",
  "Website / landing page",
  "Data analysis",
  "Marketing campaign plan",
  "Translation",
  "Financial model",
  "Brand identity",
  "Software prototype",
  "Survey & insights report",
];

export function money(n) {
  return "€" + Number(n).toLocaleString("en-NL", { maximumFractionDigits: 2 });
}

export function isValidEmail(email) {
  return /^\S+@\S+\.\S+$/.test(String(email || ""));
}
