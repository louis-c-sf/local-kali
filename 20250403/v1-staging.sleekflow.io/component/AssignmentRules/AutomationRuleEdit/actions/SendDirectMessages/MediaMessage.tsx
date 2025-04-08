import React, {
  Reducer,
  useCallback,
  useEffect,
  useReducer,
  useState,
} from "react";
import produce from "immer";
import { UploadDropzoneInput } from "../../../../Form/UploadDropzoneInput";
import { useDropzone } from "react-dropzone";
import {
  deleteMethod,
  postFiles,
  postWithExceptions,
} from "../../../../../api/apiRequest";
import {
  DELETE_FbIg_ATTACHMENT,
  POST_DM_MEDIA_FILE_UPLOAD,
  POST_FbIg_AUTOREPLY_BLANK,
} from "../../../../../api/apiPath";
import {
  AutomationActionType,
  DMMediaFileNormalized,
  DMMediaUploadType,
  isDMMediaUpload,
  SendMediaUploadable,
  SendMediaUploadProxyType,
} from "../../../../../types/AutomationActionType";
import {
  AllowFileTypes,
  FacebookInitiateDmActionType,
  InstagramInitiateDmActionType,
  MessageFormat,
  UploadFileCount,
  UploadFileMaxSizeEnum,
} from "../../CreateRule/FbIg/PostCommentTypes";
import { Trans, useTranslation } from "react-i18next";
import SendMediaItem from "../SendMediaItem";
import { reject } from "ramda";
import iconStyles from "../../../../shared/Icon/Icon.module.css";
import styles from "./MediaMessage.module.css";

type DMMediaStateType = {
  automationAction:
    | FacebookInitiateDmActionType
    | InstagramInitiateDmActionType;
  uploads: SendMediaUploadable[];
};
type SendMediaActionType =
  | { type: "ADD_FILES"; files: SendMediaUploadable[] }
  | {
      type: "UPLOAD.COMPLETE";
      proxy: SendMediaUploadable;
      file: DMMediaFileNormalized;
    }
  | { type: "DELETE.START"; file: SendMediaUploadable }
  | { type: "DELETE.CANCEL"; file: DMMediaUploadType }
  | { type: "DELETE.COMPLETE"; file: SendMediaUploadable };

const MediaMessage = (props: {
  action: FacebookInitiateDmActionType | InstagramInitiateDmActionType;
  setAction: (action: AutomationActionType) => void;
  assignmentId: string | undefined;
}) => {
  const { action, setAction, assignmentId } = props;

  const [uploadErrorMsg, setUploadErrorMsg] = useState("");
  const maxSizeByte =
    (action.automatedTriggerType === "FacebookInitiateDm"
      ? UploadFileMaxSizeEnum.fb
      : UploadFileMaxSizeEnum.ig) * 1000000;
  const maxSizeMb =
    action.automatedTriggerType === "FacebookInitiateDm"
      ? UploadFileMaxSizeEnum.fb
      : UploadFileMaxSizeEnum.ig;

  const { t } = useTranslation();
  const reducer = produce(
    (state: DMMediaStateType, action: SendMediaActionType) => {
      switch (action.type) {
        case "ADD_FILES":
          state.uploads.push(...action.files);
          break;

        case "UPLOAD.COMPLETE":
          const targetProxyIndex = state.uploads.findIndex(
            matchingFile(action.proxy)
          );
          if (targetProxyIndex > -1) {
            const uploadNew: DMMediaUploadType = {
              id: String(action.file.fbIgAutoReplyFileId),
              uuid: action.file.fbIgAutoReplyFileId,
              fbIgAutoReplyId: action.file.fbIgAutoReplyId,
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
            .filter(isDMMediaUpload)
            .findIndex(matchingFile(action.file));
          state.uploads[fileIndex].isDeleting = true;
          break;

        case "DELETE.COMPLETE":
          state.uploads = reject(matchingFile(action.file), state.uploads);
          break;

        case "DELETE.CANCEL":
          const fileCancelIndex = state.uploads
            .filter(isDMMediaUpload)
            .findIndex(matchingFile(action.file));
          state.uploads[fileCancelIndex].isDeleting = false;
          break;
      }
    }
  );
  const [state, dispatch] = useReducer<
    Reducer<DMMediaStateType, SendMediaActionType>
  >(reducer, {
    uploads: (action.fbIgAutoReply.fbIgAutoReplyFiles ?? []).map(
      (fileNormalized) => {
        return {
          id: String(fileNormalized.fbIgAutoReplyFileId),
          uuid: fileNormalized.fbIgAutoReplyFileId,
          fbIgAutoReplyId: fileNormalized.fbIgAutoReplyId,
          mimeType: fileNormalized.mimeType,
          fileName: fileNormalized.filename,
          isDeleting: false,
          isUploading: false,
          error: null,
          file: undefined,
        };
      }
    ),
    automationAction: action,
  });
  const getFbIgAutoReplyId = useCallback(async () => {
    try {
      const result = await postWithExceptions(
        POST_FbIg_AUTOREPLY_BLANK.replace(
          "{assignmentRuleId}",
          assignmentId ?? ""
        ),
        {
          param: {
            automatedTriggerType: action.automatedTriggerType,
            messageFormat: MessageFormat.Attachment,
          },
        }
      );
      setAction(
        produce(action, (actionDraft) => {
          actionDraft.fbIgAutoReply.fbIgAutoReplyId =
            result.fbIgAutoReply.fbIgAutoReplyId;
          actionDraft.id = result.id;
        })
      );
    } catch (e) {
      console.error("getFbIgAutoReplyId e: ", e);
    }
  }, [assignmentId]);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    accept: AllowFileTypes,
    noClick: true,
    maxSize: maxSizeByte,
    async onDropAccepted(files) {
      setUploadErrorMsg("");
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
            POST_DM_MEDIA_FILE_UPLOAD,
            [
              {
                name: "file",
                file: proxy.file,
              },
            ],
            {
              param: {
                messageFormat: MessageFormat.Attachment,
                fbIgAutoReplyId: action.fbIgAutoReply.fbIgAutoReplyId,
              },
            }
          )
            .then((uploaded: DMMediaFileNormalized) => {
              dispatch({
                type: "UPLOAD.COMPLETE",
                proxy: proxy,
                file: uploaded,
              });
              setAction(
                produce(action, (draft) => {
                  if (draft) {
                    draft.fbIgAutoReply.fbIgAutoReplyFiles = [uploaded];
                  }
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
    onDropRejected(files) {
      files.map((file) => {
        if (file.size > maxSizeByte) {
          setUploadErrorMsg(
            t("automation.rule.error.uploadedFileOverSize", {
              maxSize: maxSizeMb,
            })
          );
        }
      });
    },
  });

  function matchingFile(file: SendMediaUploadable) {
    return (u: SendMediaUploadable) => String(u.id) === String(file.id);
  }

  useEffect(() => {
    if (!action.fbIgAutoReply.fbIgAutoReplyId) {
      getFbIgAutoReplyId();
    }
  }, [getFbIgAutoReplyId]);

  return (
    <div className={`action-send-media ${styles.mediaMessage}`}>
      <div className="upload-section">
        <div className="upload-dropzone-images">
          <UploadDropzoneInput
            getRootProps={getRootProps}
            getInputProps={getInputProps}
            isDragActive={isDragActive}
            mimeTypes={AllowFileTypes}
            isEmpty={state.uploads.length === 0}
            hasIcon={false}
          >
            {state.uploads.length === 0 && (
              <>
                <p>
                  <Trans i18nKey={"form.field.dropzone.hint.uploadImage"}>
                    Drag and drop or
                    <a
                      onClick={open}
                      className={"upload-dropzone-input--action-link"}
                    >
                      choose a file.
                    </a>
                    to upload your images.
                  </Trans>
                </p>
                <p className={styles.fileLimit}>
                  <Trans
                    i18nKey={"form.field.dropzone.hint.uploadImageDescription"}
                  >
                    You can upload up to {{ fileCount: UploadFileCount }} image.
                    <br /> Maximum upload file size: {{ maxSize: maxSizeMb }} MB
                  </Trans>
                </p>
              </>
            )}
            {state.uploads.map((upload, key) => (
              <SendMediaItem
                upload={upload}
                deleteFile={async (file) => {
                  if (!isDMMediaUpload(file)) {
                    return;
                  }
                  // delete stored file
                  dispatch({ type: "DELETE.START", file: file });
                  try {
                    await deleteMethod(
                      DELETE_FbIg_ATTACHMENT.replace(
                        "{fbIgAutoReplyFileId}",
                        file.uuid
                      ),
                      { param: {} }
                    );
                    setAction(
                      produce(action, (draft) => {
                        if (draft.fbIgAutoReply.fbIgAutoReplyFiles) {
                          draft.fbIgAutoReply.fbIgAutoReplyFiles =
                            draft.fbIgAutoReply.fbIgAutoReplyFiles.filter(
                              (f) => f.fbIgAutoReplyFileId !== file.id
                            );
                        }
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
      {uploadErrorMsg && (
        <p className={styles.uploadErrorMsg}>
          <span className={`${iconStyles.icon} ${styles.warningIcon}`} />
          {uploadErrorMsg}
        </p>
      )}
    </div>
  );
};
export default MediaMessage;
