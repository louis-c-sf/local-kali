import { NormalizedWhatsAppTemplateLanguageType } from "../models/OptInType";

export function getLocalTemplate(
  tpl: NormalizedWhatsAppTemplateLanguageType,
  lang: string,
  contentSid?: string
) {
  const langKey = lang.replace("-", "_");
  const translations = Object.values(tpl.translations);
  return (
    tpl.translations[langKey] ??
    (contentSid
      ? translations.find((t) => t.contentSid === contentSid) || translations[0]
      : translations[0])
  );
}
