import { postWithExceptions } from "../apiRequest";

export async function submitNewStore(
  defaultLanguage: string,
  name: string,
  languageISO639Codes: string[],
  currencies: string[]
) {
  return await postWithExceptions("/CommerceHub/Stores/CreateStore", {
    param: {
      names: [
        {
          language_iso_code: defaultLanguage,
          value: name,
        },
      ],
      currencies: currencies.map((c) => ({ currency_iso_code: c })),
      descriptions: [],
      template_dict: {
        message_preview_templates: [],
      },
      is_available_for_view: true,
      languages: languageISO639Codes.map((code) => ({
        language_iso_code: code,
        is_default: code === defaultLanguage,
      })),
      metadata: {},
    },
  });
}
