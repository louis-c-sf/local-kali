import { fetchUploadProductsBlobUrl } from "api/CommerceHub/fetchUploadProductsBlobUrl";
import { BlockBlobClient } from "@azure/storage-blob";

export function useUploadCommerceHubBlob(type: "File" | "Image") {
  async function upload(file: File, storeId: string) {
    const uploadUrl = await fetchUploadProductsBlobUrl(storeId, type);

    const [firstBlob] = uploadUrl.data.upload_blobs;
    if (!firstBlob) {
      throw { message: "No blob created", uploadUrl };
    }

    const serviceClient = new BlockBlobClient(firstBlob.blob_url);
    const uploadResult = await serviceClient.uploadData(file);

    if (uploadResult.errorCode) {
      throw { message: `Error: ${uploadResult.errorCode}`, uploadResult };
    }

    return firstBlob.blob_name;
  }

  return { upload };
}
