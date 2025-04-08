import {
  UploadedBroadcastFileType,
  UploadedQuickReplyFileType,
} from "../../types/UploadedFileType";
import React, { SyntheticEvent, useContext, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import BroadcastImageDisplay from "./BroadcastImageDisplay";
import { UploadDropzoneInput } from "../Form/UploadDropzoneInput";
import { Trans } from "react-i18next";
import { useMultiUploadBehavior } from "../Form/MultiUploadInput/useMultiUploadBehavior";
import BroadcastContext from "./BroadcastContext";
import getIsReadOnlyCampaign from "./helpers/getIsReadOnlyCampaign";
import { MultiUploadActionType } from "../Form/MultiUploadInput/multiUploadReducer";

const ACCEPT_MIME_TYPES = "*.*";

export function ImagesInput<
  TFile extends UploadedQuickReplyFileType | UploadedBroadcastFileType
>(props: {
  uploadedFiles: TFile[];
  id?: string;
  onDropzoneConnected?: (open: () => void) => void;
  onFilesDropped?: (accepted: File[], rejected: File[]) => void;
  onFilesUploaded?: (files: TFile[]) => void;
  broadcastDispatch: (action: MultiUploadActionType<TFile>) => void;
  submitFiles: (id: string, data: FormData) => Promise<any>;
  createProxy: (fileRaw: File) => TFile;
  idFieldName: keyof TFile;
  submitDelete: (file: TFile) => Promise<void>;
  channelMessageId?: number;
  limit?: number;
  sizeLimit?: number;
  mimeType?: string;
  disabled?: boolean;
}) {
  const {
    id,
    uploadedFiles,
    broadcastDispatch,
    submitFiles,
    createProxy,
    idFieldName,
    submitDelete,
    channelMessageId,
    limit,
    sizeLimit,
    disabled,
  } = props;

  const { uploadFiles, deleteFile } = useMultiUploadBehavior<TFile>({
    uploadedFiles,
    broadcastDispatch,
    submitFiles: async (files) => {
      if (!id) {
        return [];
      }
      const formData = new FormData();
      if (idFieldName === "campaignUploadedFileId") {
        if (!channelMessageId) {
          return;
        }
        formData.append("channelMessageId", String(channelMessageId));
      }
      for (const acceptedFile of files) {
        formData.append("files", acceptedFile);
      }
      return await submitFiles(id, formData);
    },
    createProxy,
    idFieldName,
  });

  const { isDragActive, open, getInputProps, getRootProps } = useDropzone({
    noClick: true,
    onDrop: async (acceptedFiles, rejectedFiles) => {
      if (props.onFilesDropped) {
        props.onFilesDropped(acceptedFiles, rejectedFiles);
      }
      try {
        const uploaded = await uploadFiles(acceptedFiles);
        if (props.onFilesUploaded && uploaded) {
          props.onFilesUploaded(uploaded);
        }
      } catch (e) {
        console.error("ImagesInput.onFilesUploaded", e, acceptedFiles);
      }
    },
    maxSize: sizeLimit,
    multiple: limit === undefined || limit > 1,
    disabled,
  });
  const { status } = useContext(BroadcastContext);
  const isReadOnly = getIsReadOnlyCampaign(status);

  useEffect(() => {
    if (open && props.onDropzoneConnected) {
      props.onDropzoneConnected(open);
    }
  }, [Boolean(open), Boolean(props.onDropzoneConnected)]);

  const isFileListEmpty = uploadedFiles.length === 0;
  const isInActiveAndFilesEmpty = isFileListEmpty && isReadOnly;
  const isLimitReached = limit !== undefined && uploadedFiles.length === limit;

  function openFiles(event: SyntheticEvent): void {
    event.preventDefault();
    open();
  }

  return (
    <>
      {!isInActiveAndFilesEmpty && (
        <div
          className="upload-dropzone-images"
          onClick={isLimitReached || disabled ? undefined : openFiles}
        >
          <UploadDropzoneInput
            getInputProps={getInputProps}
            getRootProps={getRootProps}
            isDragActive={isDragActive}
            mimeTypes={props.mimeType ?? ACCEPT_MIME_TYPES}
            isEmpty={isFileListEmpty}
            disabled={isLimitReached || isReadOnly || disabled}
          >
            {isFileListEmpty && (
              <Trans i18nKey={"form.field.dropzone.hint.uploadImage"}>
                Drag and drop or&nbsp;
                <a className={"upload-dropzone-input--action-link"}>
                  choose a file
                </a>
                to upload your images.
              </Trans>
            )}
            {uploadedFiles.map((uploadedFile: TFile, key) => {
              return (
                <BroadcastImageDisplay
                  disabled={disabled}
                  submitDelete={async () => {
                    await submitDelete(uploadedFile);
                    deleteFile(uploadedFile);
                  }}
                  file={uploadedFile}
                  key={key}
                  isUpdatingParentRecord={
                    idFieldName === "campaignUploadedFileId"
                      ? Boolean(channelMessageId)
                      : Boolean(id)
                  }
                />
              );
            })}
          </UploadDropzoneInput>
        </div>
      )}
    </>
  );
}
