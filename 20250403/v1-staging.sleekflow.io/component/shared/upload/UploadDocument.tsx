import React from "react";
import { Form } from "semantic-ui-react";
import { FieldError } from "../form/FieldError";
import { useDropzone } from "react-dropzone";
import {
  SendMediaUploadable,
  SendMediaUploadProxyType,
} from "../../../types/AutomationActionType";
import { UploadDropzoneInput } from "../../Form/UploadDropzoneInput";
import SendMediaItem from "../../AssignmentRules/AutomationRuleEdit/actions/SendMediaItem";
import { Trans, useTranslation } from "react-i18next";

export function UploadDocument<
  T extends SendMediaUploadProxyType | SendMediaUploadable
>(props: {
  setFiles: (tmp: SendMediaUploadProxyType[]) => void;
  files: T[];
  deleteFile: (file: SendMediaUploadable) => void;
  labelElem: React.ReactElement;
  error?: string;
  disabled?: boolean;
  className?: string;
  mimeTypes?: string;
  uploadType?: string;
  isDisplayShortDesc?: boolean;
}) {
  const {
    setFiles,
    files,
    deleteFile,
    labelElem,
    error,
    className,
    mimeTypes = "image/png,image/jpeg,image/webp,application/pdf",
    uploadType,
    disabled = false,
    isDisplayShortDesc = false,
  } = props;
  const { t } = useTranslation();
  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    noClick: true,
    onDropAccepted: async (files) => {
      const newProxies: SendMediaUploadProxyType[] = files.map((file) => {
        return {
          id: btoa(String(Math.random())),
          file: file,
          isUploading: false,
          isDeleting: false,
          error: null,
        };
      });
      setFiles(newProxies);
    },
  });

  return (
    <Form.Field className={className}>
      {labelElem}
      <div className="upload-section">
        <div className="upload-dropzone-images">
          <UploadDropzoneInput
            getRootProps={getRootProps}
            getInputProps={getInputProps}
            isDragActive={isDragActive}
            mimeTypes={mimeTypes}
            isEmpty={files.length === 0}
          >
            <DocumentDescription
              uploadType={uploadType ?? ""}
              files={files}
              isShort={isDisplayShortDesc}
              open={open}
            />
            {files.map((upload, key) => (
              <SendMediaItem
                disabled={disabled}
                upload={{
                  ...upload,
                  mimeType: upload.mimeType ? upload.mimeType : mimeTypes,
                }}
                deleteFile={(file) => {
                  deleteFile(file);
                }}
                key={key}
              />
            ))}
          </UploadDropzoneInput>
          {error && <FieldError text={error} />}
        </div>
      </div>
    </Form.Field>
  );
}

function DocumentDescription(props: {
  uploadType: string;
  files: SendMediaUploadable[];
  isShort: boolean;
  open: () => void;
}) {
  const { uploadType, files, isShort, open } = props;
  if (files && files.length > 0) {
    return null;
  }
  if (uploadType) {
    if (isShort) {
      return (
        <Trans i18nKey={"form.field.dropzone.hint.uploadFile.short"}>
          Upload a
          <a onClick={open} className={"upload-dropzone-input--action-link"}>
            {{ uploadType }}
          </a>
          (mandatory)
        </Trans>
      );
    }
    return (
      <Trans i18nKey={"form.field.dropzone.hint.uploadFile.long"}>
        Drag and drop or&nbsp;
        <a onClick={open} className={"upload-dropzone-input--action-link"}>
          file
        </a>
        to upload your {{ uploadType }}
      </Trans>
    );
  }
  return (
    <Trans i18nKey={"form.field.dropzone.hint.uploadImage"}>
      Drag and drop or&nbsp;
      <a onClick={open} className={"upload-dropzone-input--action-link"}>
        choose a file
      </a>
      to upload your images.
    </Trans>
  );
}
