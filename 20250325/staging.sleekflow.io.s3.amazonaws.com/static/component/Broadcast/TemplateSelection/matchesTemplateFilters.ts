import {
  WhatsappTemplateNormalizedType,
  isWhatsappTemplateNormalizedType,
} from "types/WhatsappTemplateResponseType";
import { WhatsappCloudAPITemplateType } from "features/WhatsappCloudAPI/models/WhatsappCloudAPITemplateType";
import { ButtonType } from "features/Whatsapp360/API/ButtonType";
import { TemplateCategorySearchEnum } from "component/Settings/SettingTemplates/360Dialog/TemplatesFiltered/useCallbackableTemplatesSearch";

export function matchesTemplateFilters(
  templateName: string,
  lang: string,
  buttonType: ButtonType,
  selectedCategory: TemplateCategorySearchEnum
) {
  return (
    template: WhatsappTemplateNormalizedType | WhatsappCloudAPITemplateType
  ) => {
    let isMatch = true;
    const templateNameField = isWhatsappTemplateNormalizedType(template)
      ? "template_name"
      : "name";
    const templateLangField = isWhatsappTemplateNormalizedType(template)
      ? "languages"
      : "language";

    if (templateName) {
      isMatch = template[templateNameField].includes(templateName);
    }
    if (lang) {
      isMatch = isMatch && template[templateLangField].includes(lang);
    }
    if (selectedCategory) {
      isMatch = isMatch && template.category.includes(selectedCategory);
    }
    if (buttonType) {
      if (buttonType === "NONE") {
        if (isWhatsappTemplateNormalizedType(template)) {
          return (
            isMatch &&
            template.whatsapp_template.some(
              (tpl) => tpl.components === undefined
            )
          );
        } else {
          return (
            isMatch &&
            template.components.every(
              (component) => component.type !== "BUTTONS"
            )
          );
        }
      } else if (buttonType === "QUICK_REPLY") {
        if (isWhatsappTemplateNormalizedType(template)) {
          return (
            isMatch &&
            template.whatsapp_template.some((tpl) =>
              tpl.components?.some((component) =>
                component?.buttons?.some(
                  (button) => button.type === "QUICK_REPLY"
                )
              )
            )
          );
        } else {
          return (
            isMatch &&
            template.components
              .filter((component) => component.type === "BUTTONS")
              .some((component) =>
                component?.buttons?.some(
                  (button) => button.type === "QUICK_REPLY"
                )
              )
          );
        }
      } else {
        if (isWhatsappTemplateNormalizedType(template)) {
          return (
            isMatch &&
            template.whatsapp_template.some((tpl) =>
              tpl.components?.some((component) =>
                component?.buttons?.some(
                  (button) => button.type !== "QUICK_REPLY"
                )
              )
            )
          );
        } else {
          return (
            isMatch &&
            template.components
              .filter((component) => component.type === "BUTTONS")
              .some((component) =>
                component?.buttons?.some(
                  (button) => button.type !== "QUICK_REPLY"
                )
              )
          );
        }
      }
    }
    return isMatch;
  };
}
