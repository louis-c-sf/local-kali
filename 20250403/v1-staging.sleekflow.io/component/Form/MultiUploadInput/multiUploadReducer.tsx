import { MultiUploadStateType } from "../../../types/BroadcastCampaignType";
import { UploadedFileGeneralProxyType } from "../../../types/UploadedFileType";
import produce from "immer";

export type MultiUploadActionType<TFile extends UploadedFileGeneralProxyType> =
  | { type: "UPDATE_FILELIST"; fileList: TFile[] }
  | { type: "UPDATE_FILE_PROXIES"; fileList: TFile[] }
  | { type: "DELETE_FILE"; file: TFile };

export function makeMultiUploadsReducer<
  TFile extends UploadedFileGeneralProxyType
>(idFieldName: keyof TFile) {
  function mergeProxyFiles(newFiles: TFile[], targetFiles: TFile[]) {
    return newFiles.reduce((acc: TFile[], newFile) => {
      const proxyPending = acc.find((targetFile) => {
        return (
          targetFile.id === undefined &&
          baseNameUploadFile(targetFile?.fileProxy?.name) ===
            baseNameUploadFile(newFile.filename)
        );
      });
      if (proxyPending) {
        proxyPending.id = newFile.id;
        proxyPending.mimeType = newFile.mimeType;
        proxyPending.blobContainer = newFile.blobContainer;
        proxyPending.url = newFile.url;
        proxyPending[idFieldName] = newFile[idFieldName];
        delete proxyPending.fileProxy;
      } else {
        acc.push(newFile);
      }
      return acc;
    }, targetFiles);
  }

  return produce(
    (
      state: MultiUploadStateType<TFile>,
      action: { type: string } | MultiUploadActionType<TFile>
    ) => {
      if (!isMultiUploadActionType(action)) {
        return;
      }
      switch (action.type) {
        case "UPDATE_FILELIST":
          state.uploadedFiles = action.fileList;
          break;

        case "UPDATE_FILE_PROXIES":
          state.uploadedFiles = mergeProxyFiles(
            (action.fileList as TFile[]) ?? [],
            state.uploadedFiles as TFile[]
          );
          break;

        case "DELETE_FILE":
          if (action.file.fileProxy) {
            state.uploadedFiles = state.uploadedFiles.filter(
              (f) => action.file.fileProxy !== f.fileProxy
            );
          } else {
            state.uploadedFiles = state.uploadedFiles.filter(
              (f) => action.file.id !== f.id
            );
          }
          break;
      }
    }
  );
}

function isMultiUploadActionType(action: {
  type: string;
}): action is MultiUploadActionType<any> {
  return ["UPDATE_FILELIST", "UPDATE_FILE_PROXIES", "DELETE_FILE"].includes(
    action.type
  );
}

export function baseNameUploadFile(
  file: string | undefined
): string | undefined {
  if (!file) {
    return undefined;
  }
  const match = file.match(/(\/)?([^/]+)$/);
  return match && match.length > 1 ? match[2] : undefined;
}
