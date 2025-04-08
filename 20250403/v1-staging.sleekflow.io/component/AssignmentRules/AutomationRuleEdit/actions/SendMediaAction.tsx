import React, { Reducer, useReducer } from "react";
import { FieldError } from "../../../shared/form/FieldError";
import WaitTimeAction, { AddWaitActionButton } from "./WaitTimeAction";
import { UploadDropzoneInput } from "../../../Form/UploadDropzoneInput";
import { useDropzone } from "react-dropzone";
import { deleteMethod, postFiles } from "../../../../api/apiRequest";
import {
  DELETE_ASSIGNMENT_RULE_ACTION_FILE,
  POST_ASSIGNMENT_RULE_ACTION_FILE_UPLOAD,
} from "../../../../api/apiPath";
import produce from "immer";
import { WaitableActionProps } from "../ActionsForm";
import {
  AutomationActionType,
  isSendMediaUpload,
  SendMediaAutomationActionType,
  SendMediaFileNormalized,
  SendMediaUploadable,
  SendMediaUploadProxyType,
  SendMediaUploadType,
} from "../../../../types/AutomationActionType";
import { TargetChannelDropdown } from "../input/TargetChannelDropdown";
import { Trans, useTranslation } from "react-i18next";
import { reject } from "ramda";
import SendMediaItem from "./SendMediaItem";
import styles from "./SendMediaAction.module.css";

interface SendMessageActionProps extends WaitableActionProps {
  action: SendMediaAutomationActionType;
  setAction: (action: AutomationActionType) => void;
  error: string | undefined;
  index: number;
  canAddWaitAction: boolean;
}

function matchingFile(file: SendMediaUploadable) {
  return (u: SendMediaUploadable) => String(u.id) === String(file.id);
}

type SendMediaStateType = {
  automationAction: SendMediaAutomationActionType;
  uploads: SendMediaUploadable[];
};
type SendMediaActionType =
  | { type: "ADD_FILES"; files: SendMediaUploadable[] }
  | {
      type: "UPLOAD.COMPLETE";
      proxy: SendMediaUploadable;
      file: SendMediaFileNormalized;
    }
  | { type: "DELETE.START"; file: SendMediaUploadable }
  | { type: "DELETE.CANCEL"; file: SendMediaUploadType }
  | { type: "DELETE.COMPLETE"; file: SendMediaUploadable };

const reducer = produce(
  (state: SendMediaStateType, action: SendMediaActionType) => {
    switch (action.type) {
      case "ADD_FILES":
        state.uploads.push(...action.files);
        break;

      case "UPLOAD.COMPLETE":
        const targetProxyIndex = state.uploads.findIndex(
          matchingFile(action.proxy)
        );
        if (targetProxyIndex > -1) {
          const uploadNew: SendMediaUploadType = {
            id: String(action.file.id),
            uuid: action.file.assignmentUploadedFileId,
            automationActionId: state.automationAction.id,
            blobContainer: action.file.blobContainer,
            mimeType: action.file.mimeType,
            fileName: action.file.filename,
            file: action.proxy.file,
            isDeleting: false,
            isUploading: false,
            error: null,
          };
          state.uploads[targetProxyIndex] = uploadNew;
        }
        break;

      case "DELETE.START":
        const fileIndex = state.uploads
          .filter(isSendMediaUpload)
          .findIndex(matchingFile(action.file));
        state.uploads[fileIndex].isDeleting = true;
        break;

      case "DELETE.COMPLETE":
        state.uploads = reject(matchingFile(action.file), state.uploads);
        break;

      case "DELETE.CANCEL":
        const fileCancelIndex = state.uploads
          .filter(isSendMediaUpload)
          .findIndex(matchingFile(action.file));
        state.uploads[fileCancelIndex].isDeleting = false;
        break;
    }
  }
);
const ALLOWED_FILE_TYPES =
  "image/*,application/pdf,*.pdf,*.csv,*.ppt,*.pptx,*.doc,*.docx,*.xlsx,*.xls,text/*,audio/*,video/*";

export function SendMediaAction(props: SendMessageActionProps) {
  const {
    action,
    setAction,
    canAddWaitAction,
    waitActionAdd,
    waitActionChange,
    waitActionRemove,
  } = props;
  const { t } = useTranslation();

  const [state, dispatch] = useReducer<
    Reducer<SendMediaStateType, SendMediaActionType>
  >(reducer, {
    uploads: action.uploadedFiles.map((fileNormalized) => {
      return {
        id: String(fileNormalized.id),
        uuid: fileNormalized.assignmentUploadedFileId,
        automationActionId: action.id,
        blobContainer: fileNormalized.blobContainer,
        mimeType: fileNormalized.mimeType,
        fileName: fileNormalized.filename,
        isDeleting: false,
        isUploading: false,
        error: null,
        file: undefined,
      };
    }),
    automationAction: action,
  });

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    accept: ALLOWED_FILE_TYPES,
    noClick: true,
    async onDropAccepted(files) {
      const newProxies: SendMediaUploadProxyType[] = files.map((file) => {
        return {
          id: btoa(String(Math.random())),
          file: file,
          isUploading: true,
          isDeleting: false,
          fileName: file.name,
          error: null,
        };
      });
      dispatch({ type: "ADD_FILES", files: newProxies });

      const uploadQueue = newProxies.map((proxy) => {
        return new Promise((resolve) => {
          postFiles(
            POST_ASSIGNMENT_RULE_ACTION_FILE_UPLOAD.replace(
              "{automationActionId}",
              String(action.id)
            ),
            [{ name: "files", file: proxy.file }]
          )
            .then((uploaded: SendMediaFileNormalized) => {
              dispatch({
                type: "UPLOAD.COMPLETE",
                proxy: proxy,
                file: uploaded,
              });
              setAction(
                produce(action, (draft) => {
                  draft.uploadedFiles.push(uploaded);
                })
              );
              resolve(true);
            })
            .catch((e) => {
              console.error("#SendMediaAction upload", e, proxy);
              //todo update proxy with an error
              resolve(false);
            });
        });
      });
      return await Promise.all(uploadQueue);
    },
  });

  return (
    <div className={styles.root}>
      {action.actionWaitDenormalized && (
        <WaitTimeAction
          action={action.actionWaitDenormalized}
          onChange={waitActionChange}
          onRemove={waitActionRemove}
          error={props.waitError}
        />
      )}
      <div className={styles.labelSection}>
        <div className={styles.item}>
          <label>{t("automation.action.sendMedia.header")}</label>
        </div>
        <div className={styles.item}>
          {canAddWaitAction && (
            <AddWaitActionButton onAddAction={waitActionAdd} />
          )}
        </div>
        <div className={`${styles.item} ${styles.long}`}>
          <div className="ui input fluid">
            <TargetChannelDropdown setAction={setAction} action={action} />
          </div>
        </div>
      </div>
      <div className={styles.upload}>
        <div className="upload-dropzone-images">
          <UploadDropzoneInput
            getRootProps={getRootProps}
            getInputProps={getInputProps}
            isDragActive={isDragActive}
            mimeTypes={ALLOWED_FILE_TYPES}
            isEmpty={state.uploads.length === 0}
          >
            {state.uploads.length === 0 && (
              <Trans i18nKey={"form.field.dropzone.hint.simple"}>
                Drag and drop or
                <a
                  onClick={open}
                  className={"upload-dropzone-input--action-link"}
                >
                  choose a file.
                </a>
              </Trans>
            )}
            {state.uploads.map((upload, key) => (
              <SendMediaItem
                upload={upload}
                deleteFile={async (file) => {
                  if (!isSendMediaUpload(file)) {
                    return;
                  }
                  // delete stored file
                  dispatch({ type: "DELETE.START", file: file });
                  try {
                    await deleteMethod(
                      DELETE_ASSIGNMENT_RULE_ACTION_FILE.replace(
                        "{attachmentId}",
                        file.id ?? ""
                      ).replace("{automationActionId}", String(action.id)),
                      { param: {} }
                    );
                    setAction(
                      produce(action, (draft) => {
                        draft.uploadedFiles = draft.uploadedFiles.filter(
                          (f) => f.id !== Number(file.id)
                        );
                      })
                    );
                  } catch (e) {
                    dispatch({ type: "DELETE.CANCEL", file: file });
                    return;
                  }
                  dispatch({ type: "DELETE.COMPLETE", file });
                }}
                key={key}
              />
            ))}
          </UploadDropzoneInput>
        </div>
      </div>
      {props.error && (
        <FieldError text={props.error} className={"standalone-error"} />
      )}
    </div>
  );
}
