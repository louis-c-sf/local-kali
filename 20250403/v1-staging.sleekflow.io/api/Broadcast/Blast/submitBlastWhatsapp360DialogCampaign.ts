import { postFiles } from "../../apiRequest";
import { TemplateMessageComponentType } from "../../../types/MessageType";
import { BlastCampaignType } from "./BlastCampaignType";

export async function submitBlastWhatsapp360DialogCampaign(
  name: string,
  contactsFile: File,
  payload: BlastCampaignPayloadInterface
): Promise<BlastCampaignType> {
  return await postFiles(
    "/blast-message/whatsapp/360dialog",
    [{ name: "ContactFile", file: contactsFile }],
    {
      param: {
        ...payload,
        Name: name,
        templateParameters: JSON.stringify(payload.templateParameters),
      },
    }
  );
}

export interface BlastCampaignPayloadInterface {
  whatsapp360DialogChannelId: number;
  templateName: string;
  templateNamespace: string;
  templateLanguage: string;
  templateParameters: Array<TemplateMessageComponentType>;
}
