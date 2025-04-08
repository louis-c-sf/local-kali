import { useState } from "react";
import { postWithExceptions, getWithExceptions } from "../apiRequest";
import axios from "axios";
import { SampleHeaderHandleType } from "features/WhatsappCloudAPI/models/WhatsappCloudAPITemplateType";

const readFile = (file: File) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsArrayBuffer(file);
  });
};

export default function useUploadSample(wabaId: string) {
  const [loading, setLoading] = useState(false);

  function getFileUploadUrl(): Promise<{ blobId: string; uploadUrl: string }> {
    return postWithExceptions(
      "/company/whatsapp/cloudapi/template/file_url/request",
      { param: { wabaId } }
    );
  }

  async function uploadFile(url: string, file: File) {
    const data = await readFile(file);
    return axios.put(url, data, {
      headers: {
        "Content-Type": file.type,
        "x-ms-blob-type": "BlockBlob",
        "x-ms-blob-content-type": file.type,
      },
    });
  }

  function getheaderHandle(blobId: string): Promise<SampleHeaderHandleType> {
    return getWithExceptions(
      "/company/whatsapp/cloudapi/template/file/header_handle",
      { param: { wabaId, blobId } }
    );
  }

  async function uploadSample(files: File[]) {
    try {
      setLoading(true);
      const url = await getFileUploadUrl();
      await uploadFile(url.uploadUrl, files[0]);
      const result = await getheaderHandle(url.blobId);
      return result;
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return {
    loading,
    uploadSample,
  };
}
