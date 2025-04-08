import { NormalizedWhatsAppTemplateLanguageType } from "../models/OptInType";

export function getLocalTemplateLocale(
  tpl: NormalizedWhatsAppTemplateLanguageType,
  lang: string
) {
  const langKey = lang.replace("-", "_");
  return tpl.translations[langKey] ? langKey : Object.keys(tpl.translations)[0];
}
