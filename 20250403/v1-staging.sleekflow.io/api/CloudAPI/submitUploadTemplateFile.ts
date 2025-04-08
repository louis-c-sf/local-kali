import { postFiles } from "api/apiRequest";
import { ExtendedMessageType } from "core/models/Message/WhatsappCloudAPIMessageType";

export async function submitUploadTemplateFile(
  file: File,
  displayName: string,
  type: "file" | "image" | "video" | "document" | "voice",
  isTemplateFile?: boolean
): Promise<ResponseType> {
  return await postFiles("/ExtendedMessage/File", [{ name: "File", file }], {
    param: {
      ExtendedMessageType: ExtendedMessageType.WhatsappCloudApiTemplateMessage,
      DisplayName: displayName,
      MediaType: type,
      Channel: "whatsappcloudapi",
      IsTemplateFile: Boolean(isTemplateFile),
    },
  });
}

interface ResponseType {
  id: string;
  channel: string;
  extendedMessageType: ExtendedMessageType;
  blobContainer: string;
  blobFilePath: string;
  filename: string;
  mimeType: string;
  url: string;
  fileSize: number;
  displayName: string;
  mediaType: string;
  createdAt: string;
  updatedAt: string;
}
