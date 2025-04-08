import { getWithExceptions } from "../apiRequest";
import { GET_ATTACHMENT_URL_LINK } from "../apiPath";

interface Attachment {
  url: string;
  mimeType: string;
}

export async function getUploadedAttachment(
  fileId: string,
  type: string,
  fileName: string
) {
  try {
    const result: Attachment | undefined = await getWithExceptions(
      GET_ATTACHMENT_URL_LINK.replace("{attachmentType}", type).replace(
        "{fileId}",
        fileId
      ),
      { param: {} }
    );
    return result?.url ?? "";
  } catch (e) {
    console.error(`getUploadedAttachment error ${e}`);
    return "";
  }
}
