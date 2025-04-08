import { postWithExceptions } from "api/apiRequest";

export async function fetchUploadProductsBlobUrl(
  storeId: string,
  type: "File" | "Image"
): Promise<{
  success: boolean;
  data: {
    upload_blobs: Array<{
      blob_id: string;
      blob_url: string;
      expires_on: string;
      blob_name: string;
    }>;
  };
}> {
  return await postWithExceptions(
    "/CommerceHub/Blobs/CreateUploadBlobSasUrls",
    {
      param: {
        store_id: storeId,
        number_of_blobs: 1,
        blob_type: type,
      },
    }
  );
}
