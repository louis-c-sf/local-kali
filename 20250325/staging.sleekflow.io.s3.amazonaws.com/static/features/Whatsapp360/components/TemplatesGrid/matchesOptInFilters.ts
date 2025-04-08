import { ButtonType } from "../../API/ButtonType";
import { NormalizedWhatsAppTemplateLanguageType } from "../../models/OptInType";
import { whereButtons } from "features/Whatsapp360/components/TemplatesGrid/whereButtons";
import { TemplateCategorySearchEnum } from "component/Settings/SettingTemplates/360Dialog/TemplatesFiltered/useCallbackableTemplatesSearch";

export function matchesOptInFilters(
  templateName: string,
  template: NormalizedWhatsAppTemplateLanguageType,
  lang?: string,
  buttonType?: ButtonType,
  category?: TemplateCategorySearchEnum
) {
  let isMatch = true;
  if (templateName) {
    isMatch = template.template_name.includes(templateName);
  }
  if (lang) {
    isMatch = isMatch && template.languages.includes(lang);
  }
  if (category) {
    isMatch = isMatch && template.category.includes(category);
  }
  if (buttonType) {
    if (buttonType === "NONE") {
      return (
        isMatch &&
        whereButtons(
          (buttons) => buttons === undefined || buttons.length === 0,
          template
        )
      );
    } else if (buttonType === "QUICK_REPLY") {
      return (
        isMatch &&
        whereButtons(
          (buttons) => !!buttons?.some((btn) => btn.type === "QUICK_REPLY"),
          template
        )
      );
    } else {
      return (
        isMatch &&
        whereButtons(
          (buttons) => !!buttons?.some((btn) => btn.type !== "QUICK_REPLY"),
          template
        )
      );
    }
  }
  return isMatch;
}
