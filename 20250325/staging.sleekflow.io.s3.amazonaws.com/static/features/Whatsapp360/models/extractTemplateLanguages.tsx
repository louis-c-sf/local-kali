import { IdNormalizedWhatsAppTemplateLanguageType } from "../../../component/Chat/Messenger/SelectWhatsappTemplate/useSelectWhatsappTemplateFlow";
import { uniq } from "ramda";

export function extractTemplateLanguages(
  templates: IdNormalizedWhatsAppTemplateLanguageType[]
) {
  return uniq(
    templates
      .map((t) => t.template)
      .reduce((acc: string[], curr) => [...acc, ...curr.languages], [])
  );
}
