import { UploadedBroadcastFileType } from "../../../types/UploadedFileType";
import { post } from "../../../api/apiRequest";
import { POST_UPDATE_ATTACHMENT_IMAGE } from "../../../api/apiPath";

export async function sendUploadedFiles(
  id: string,
  files: UploadedBroadcastFileType[],
  channelId: number
) {
  const formData = new FormData();
  for (let file of files) {
    formData.append("files", file.fileProxy as File);
  }
  formData.append("channelMessageId", String(channelId));
  const uploaded = await post(
    POST_UPDATE_ATTACHMENT_IMAGE.replace("{id}", id),
    {
      param: formData,
      header: { "Content-Type": "application/x-www-form-urlencoded" },
    }
  );
  return uploaded;
}
