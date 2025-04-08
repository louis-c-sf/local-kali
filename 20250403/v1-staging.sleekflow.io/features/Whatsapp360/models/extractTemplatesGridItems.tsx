import { IdNormalizedWhatsAppTemplateLanguageType } from "../../../component/Chat/Messenger/SelectWhatsappTemplate/useSelectWhatsappTemplateFlow";
import { TemplateGridItemType } from "../components/TemplatesGrid/TemplatesGrid";

export function extractTemplatesGridItems(
  templates: IdNormalizedWhatsAppTemplateLanguageType[]
): TemplateGridItemType[] {
  return templates
    .map((t) => {
      const items = Object.entries(
        t.template.translations
      ).map<TemplateGridItemType>(([lang, template]) => {
        return {
          id: t.template.template_name,
          language: lang,
          template: template,
          callbacks: [...(t.template.callbacks ?? [])],
          category: t.template.category,
        };
      });
      return items;
    })
    .flat(2);
}
