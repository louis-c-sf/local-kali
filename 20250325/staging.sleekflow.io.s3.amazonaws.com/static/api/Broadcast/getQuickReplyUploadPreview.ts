import { getUploadedAttachment } from "./getUploadedAttachment";
import { UploadedQuickReplyFileType } from "../../types/UploadedFileType";

export async function getQuickReplyUploadPreview(
  file: UploadedQuickReplyFileType
) {
  if (file.quickReplyFileId) {
    if (file.mimeType.includes("image")) {
      return await getUploadedAttachment(
        file.quickReplyFileId,
        "quickreply",
        file.filename
      );
    } else {
      return file.filename;
    }
  }
  return "";
}
