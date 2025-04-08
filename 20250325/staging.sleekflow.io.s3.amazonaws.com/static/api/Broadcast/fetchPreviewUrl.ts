import {
  UploadedBroadcastFileType,
  UploadedQuickReplyFileType,
  isUploadedBroadcastFileType,
} from "../../types/UploadedFileType";
import { getUploadedAttachment } from "./getUploadedAttachment";
import { getQuickReplyUploadPreview } from "./getQuickReplyUploadPreview";
import { isImageMime, isPdfMime } from "../../lib/utility/mime";

export async function fetchPreviewUrl(
  file: UploadedBroadcastFileType | UploadedQuickReplyFileType
) {
  if (file.id) {
    if (isImageMime(file.mimeType) || isPdfMime(file.mimeType)) {
      if (isUploadedBroadcastFileType(file)) {
        return await getUploadedAttachment(
          file.campaignUploadedFileId,
          "campaign",
          file.filename
        );
      } else {
        return await getQuickReplyUploadPreview(file);
      }
    } else {
      return file.filename;
    }
  }
  return "";
}
