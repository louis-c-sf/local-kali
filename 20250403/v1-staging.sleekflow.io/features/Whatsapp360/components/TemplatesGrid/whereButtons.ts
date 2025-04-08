import { WhatsappTemplateComponentButtonType } from "types/WhatsappTemplateResponseType";
import { NormalizedWhatsAppTemplateLanguageType } from "features/Whatsapp360/models/OptInType";

export function whereButtons(
  predicate: (
    btnList: WhatsappTemplateComponentButtonType[] | undefined
  ) => boolean,
  template: NormalizedWhatsAppTemplateLanguageType
) {
  return Object.keys(template.translations).some((tpl) =>
    predicate(template.translations[tpl].buttons)
  );
}
