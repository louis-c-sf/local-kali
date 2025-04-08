import { walkWhatsappTemplateParts } from "../../../component/Chat/Messenger/SelectWhatsappTemplate/walkWhatsappTemplateParts";
import { OptInContentType } from "../../../features/Whatsapp360/models/OptInType";

export default function extractWhatsAppFragment(
  whatsappTemplate: OptInContentType
) {
  const fragments = walkWhatsappTemplateParts(whatsappTemplate.content);
  const buttons = whatsappTemplate.buttons;
  const footer = whatsappTemplate.footer;
  const header = whatsappTemplate.header;
  const isHeaderText = header?.format === "TEXT";
  const headerFragments = isHeaderText
    ? walkWhatsappTemplateParts(whatsappTemplate.header?.text!)
    : [];
  return {
    content: fragments,
    buttons,
    footer,
    header: headerFragments,
  };
}
