import { IdNormalizedWhatsAppTemplateLanguageType } from "../../../../component/Chat/Messenger/SelectWhatsappTemplate/useSelectWhatsappTemplateFlow";
import { adjust } from "ramda";

export function removeTemplateCallback(
  templateId: string,
  templateLanguage: string
) {
  return (
    templates: IdNormalizedWhatsAppTemplateLanguageType[] | undefined
  ) => {
    if (!templates) {
      return;
    }

    const matchIndex = templates.findIndex(
      (item) =>
        item.id === templateId &&
        item.template.translations[templateLanguage] !== undefined
    );
    if (matchIndex > -1) {
      return adjust(
        matchIndex,
        (tpl) => {
          tpl.template.callbacks = undefined;
          return tpl;
        },
        templates
      );
    }
    return templates;
  };
}
