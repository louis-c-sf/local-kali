import { UploadedFileGeneralProxyType } from "../../../types/UploadedFileType";
import { MultiUploadActionType } from "./multiUploadReducer";

export function useMultiUploadBehavior<
  TFile extends UploadedFileGeneralProxyType
>(props: {
  broadcastDispatch: (action: MultiUploadActionType<TFile>) => void;
  uploadedFiles: TFile[];
  submitFiles: (filesRaw: File[]) => Promise<TFile[]>;
  idFieldName: keyof TFile;
  createProxy: (fileRaw: File) => TFile;
}) {
  const { broadcastDispatch, uploadedFiles, submitFiles, createProxy } = props;

  const deleteFile = (file: TFile) => {
    broadcastDispatch({ type: "DELETE_FILE", file });
  };

  async function uploadFiles(acceptedFiles: File[]) {
    if (acceptedFiles.length === 0) {
      return;
    }

    let proxyFileList: TFile[] = [];
    for (const acceptedFile of acceptedFiles) {
      proxyFileList.push(createProxy(acceptedFile));
    }

    broadcastDispatch({
      type: "UPDATE_FILELIST",
      fileList: [...uploadedFiles, ...proxyFileList],
    });

    const filesUploaded = await submitFiles(acceptedFiles);
    broadcastDispatch({
      type: "UPDATE_FILE_PROXIES",
      fileList: filesUploaded,
    });

    return filesUploaded;
  }

  return {
    uploadFiles,
    deleteFile,
  };
}
