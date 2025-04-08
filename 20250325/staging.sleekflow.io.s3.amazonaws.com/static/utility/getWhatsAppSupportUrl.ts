export function getWhatsAppSupportUrlByCountryName(
  countryName?: string,
  text?: string
) {
  switch (countryName) {
    case "Singapore":
    case "Malaysia":
    case "Indonesia":
      return createUrl(process.env.REACT_APP_SUPPORT_PHONE_SEA, text);
    case "United Kingdom":
    case "United Arab Emirates":
      return createUrl(process.env.REACT_APP_SUPPORT_PHONE_UK, text);
    case "Brazil":
      return createUrl(process.env.REACT_APP_SUPPORT_PHONE_BR, text);
    default:
      return getWhatsAppSupportUrl(text);
  }
}

export function getWhatsAppSupportUrl(text?: string) {
  return createUrl(process.env.REACT_APP_SUPPORT_PHONE_GENERAL, text);
}

function createUrl(phoneNumber: string, text?: string) {
  return `https://wa.me/${phoneNumber}/?text=${encodeURIComponent(text ?? "")}`;
}
