import {
  isHeaderType,
  isFooterType,
  isButtonType,
  isBodyType,
  StatusEnum,
  HeaderComponentType,
  FooterComponentType,
  BodyComponentType,
  ButtonComponentType,
} from "types/WhatsappTemplateResponseType";
import { WhatsappCloudAPITemplateType } from "features/WhatsappCloudAPI/models/WhatsappCloudAPITemplateType";
import {
  NormalizedWhatsAppTemplateLanguageType,
  OptInContentType,
} from "features/Whatsapp360/models/OptInType";

const filterOptInLimitation = (
  headerType: HeaderComponentType,
  footerType: FooterComponentType,
  bodyType: BodyComponentType,
  buttons: ButtonComponentType
) => {
  if (
    headerType &&
    isHeaderType(headerType) &&
    (headerType.format !== "TEXT" || headerType.text?.includes("{{1}}"))
  ) {
    return false;
  }
  if (
    footerType &&
    isFooterType(footerType) &&
    footerType.text?.includes("{{1}}")
  ) {
    return false;
  }
  if (!bodyType) {
    return false;
  }
  if (isBodyType(bodyType) && bodyType.text?.includes("{{1}}")) {
    return false;
  }
  if (!buttons) {
    return false;
  }
  if (isButtonType(buttons) && buttons.buttons.length > 0) {
    if (buttons.buttons[0].type !== "QUICK_REPLY") {
      return false;
    }
    if (buttons.buttons.length > 1) {
      return false;
    }
  }
  return true;
};
export function normalizeCloudAPITemplate(
  template: WhatsappCloudAPITemplateType,
  filterVariable?: boolean
): NormalizedWhatsAppTemplateLanguageType {
  const headerType = template.components.find((c) => c.type === "HEADER");
  const footerType = template.components.find((c) => c.type === "FOOTER");
  const bodyType = template.components.find((c) => c.type === "BODY");
  const buttons = template.components.find((c) => c.type === "BUTTONS");
  let isSkipped = false;

  if (filterVariable) {
    const valid = filterOptInLimitation(
      headerType as HeaderComponentType,
      footerType as FooterComponentType,
      bodyType as BodyComponentType,
      buttons as ButtonComponentType
    );
    if (!valid) {
      isSkipped = true;
    }
  }
  const isBookmarked = template.is_template_bookmarked ?? false;
  const translation: OptInContentType = {
    content: "",
    status: template.status.toLocaleLowerCase() as StatusEnum,
    isBookmarked,
  };

  if (headerType && isHeaderType(headerType)) {
    translation.header = headerType;
  }

  if (bodyType && isBodyType(bodyType)) {
    translation.body = bodyType;
    translation.content = bodyType.text;
  }

  if (footerType && isFooterType(footerType)) {
    translation.footer = footerType;
  }

  if (buttons && isButtonType(buttons)) {
    translation.buttons = buttons?.buttons;
  }

  return {
    languages: [template.language],
    template_name: template.name,
    approvedCount: template.status.toUpperCase() === "APPROVED" ? 1 : 0,
    isBookmarked,
    category: template.category,
    rejectedCount: template.status.toUpperCase() === "REJECTED" ? 1 : 0,
    totalCount: 1,
    callbacks: undefined, // todo?
    namespace: undefined, //todo?
    translations: {
      [template.language]: translation,
    },
    isSkipped,
  };
}
