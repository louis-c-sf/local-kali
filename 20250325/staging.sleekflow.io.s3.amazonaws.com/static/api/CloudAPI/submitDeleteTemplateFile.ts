import { postFiles, deleteMethod } from "api/apiRequest";
import { ExtendedMessageType } from "core/models/Message/WhatsappCloudAPIMessageType";

export async function submitDeleteTemplateFile(id: string) {
  return await deleteMethod(`/ExtendedMessage/File/${id}`, { param: {} });
}
