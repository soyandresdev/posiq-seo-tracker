export const COUNTRIES = [
    ["us", "United States"], ["gb", "United Kingdom"], ["ca", "Canada"], ["au", "Australia"], ["es", "Spain"], ["mx", "Mexico"], ["co", "Colombia"], ["ar", "Argentina"], ["cl", "Chile"], ["pe", "Peru"], ["br", "Brazil"], ["de", "Germany"], ["fr", "France"], ["it", "Italy"], ["pt", "Portugal"], ["nl", "Netherlands"],
] as const;
export const LANGUAGES = [
    ["en", "English"], ["es", "Spanish"], ["pt", "Portuguese"], ["de", "German"], ["fr", "French"], ["it", "Italian"], ["nl", "Dutch"],
] as const;

/** Regional indicator flag for a two-letter country code. */
export function flag(code: string) {
    return code.toUpperCase().replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)));
}
