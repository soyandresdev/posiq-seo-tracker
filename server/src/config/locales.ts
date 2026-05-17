/** Google search markets we support: gl (country) and hl (language). */
export const COUNTRIES = [
    { code: "us", label: "United States" },
    { code: "gb", label: "United Kingdom" },
    { code: "ca", label: "Canada" },
    { code: "au", label: "Australia" },
    { code: "es", label: "Spain" },
    { code: "mx", label: "Mexico" },
    { code: "co", label: "Colombia" },
    { code: "ar", label: "Argentina" },
    { code: "cl", label: "Chile" },
    { code: "pe", label: "Peru" },
    { code: "br", label: "Brazil" },
    { code: "de", label: "Germany" },
    { code: "fr", label: "France" },
    { code: "it", label: "Italy" },
    { code: "pt", label: "Portugal" },
    { code: "nl", label: "Netherlands" },
] as const;

export const LANGUAGES = [
    { code: "en", label: "English" },
    { code: "es", label: "Spanish" },
    { code: "pt", label: "Portuguese" },
    { code: "de", label: "German" },
    { code: "fr", label: "French" },
    { code: "it", label: "Italian" },
    { code: "nl", label: "Dutch" },
] as const;

export type CountryCode = (typeof COUNTRIES)[number]["code"];
export type LanguageCode = (typeof LANGUAGES)[number]["code"];

export const isCountry = (v: unknown): v is CountryCode => COUNTRIES.some((c) => c.code === v);
export const isLanguage = (v: unknown): v is LanguageCode => LANGUAGES.some((l) => l.code === v);
