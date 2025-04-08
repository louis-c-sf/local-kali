import {
  QUICK_REPLY_ENTRIES_LIMIT,
  QuickReplyType,
} from "../../../types/QuickReplies/QuickReplyType";
import { FormikErrors } from "formik";
import { UploadedQuickReplyFileType } from "../../../types/UploadedFileType";
import moment from "moment";
import React, { useMemo, useRef } from "react";
import { staffDisplayName } from "../../../component/Chat/utils/staffDisplayName";
import { useTranslation } from "react-i18next";
import { Button, Form, Image, Message } from "semantic-ui-react";
import { staffProfilePictureURL } from "../../../component/Chat/utils/staffProfilePictureURL";
import { ImagesInput } from "../../../component/Broadcast/ImagesInput";
import { deleteMethodWithExceptions } from "../../../api/apiRequest";
import { DELETE_QUICK_REPLY_ATTACHMENT } from "../../../api/apiPath";
import EmojiButton from "../../../component/EmojiButton";
import insertTextAtCursor from "insert-text-at-cursor";
import { VariablesSelection } from "../../../component/Broadcast/VariablesSelection";
import { showError } from "../SettingQuickReplies";
import { MultiUploadActionType } from "../../../component/Form/MultiUploadInput/multiUploadReducer";
import { useAppSelector } from "AppRootContext";
import { QUICK_REPLY_LIMIT } from "api/Company/fetchCompanyQuickReplies";
import { usePermission } from "component/shared/usePermission";
import { PERMISSION_KEY } from "types/Rbac/permission";

const UPLOAD_SIZE_LIMIT_MB = 15;
const UPLOAD_SIZE_LIMIT = UPLOAD_SIZE_LIMIT_MB * 1024 * 1024;

export function EditForm(props: {
  values: QuickReplyType;
  errors: FormikErrors<QuickReplyType>;
  setError: (field: keyof QuickReplyType, error?: string) => void;
  editMode: "create" | "update" | undefined;
  deleteLoading: boolean;
  formLoading: boolean;
  filesUploading: UploadedQuickReplyFileType[];
  onDeleteClick: () => void;
  onCreateClick: () => void;
  submitForm: () => void;
  submitFiles: (
    id: string,
    data: FormData
  ) => Promise<UploadedQuickReplyFileType[]>;
  setFieldValue: <TField extends keyof QuickReplyType>(
    name: TField,
    value: QuickReplyType[TField]
  ) => void;
  dispatch: (action: MultiUploadActionType<UploadedQuickReplyFileType>) => void;
  isLimitReached: boolean;
}) {
  const { check } = usePermission();
  const [canCreateSavedReplies, canEditSavedReplies, canDeleteSavedReplies] =
    useMemo(
      () =>
        check([
          PERMISSION_KEY.inboxSavedRepliesCreate,
          PERMISSION_KEY.inboxSavedRepliesEdit,
          PERMISSION_KEY.inboxSavedRepliesDelete,
        ]),
      [check]
    );

  const timeAgo = props.values.updatedAt
    ? moment.utc(props.values.updatedAt).fromNow()
    : "";
  const pending = props.deleteLoading || props.formLoading;
  const TEXTAREA_ID = "quick-reply-content-textarea";

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const userDisplayName = props.values.user
    ? staffDisplayName(props.values.user)
    : "";
  const { t } = useTranslation();
  const companyId = useAppSelector((s) => s.company?.id || "");
  const sendDeleteFile = async (file: UploadedQuickReplyFileType) => {
    if (!props.values.id) {
      return;
    }

    try {
      await deleteMethodWithExceptions(
        DELETE_QUICK_REPLY_ATTACHMENT.replace("{id}", String(props.values.id)),
        { param: {} }
      );
    } catch (e) {
      console.error("submitDelete", e);
    }
  };
  const handleFilesDropped = (accepted: File[], rejected: File[]) => {
    if (accepted.length === 0 && rejected.length > 0) {
      if (rejected.length > 1) {
        props.setError(
          "files",
          t("settings.quickReplies.form.field.files.error.number")
        );
      } else {
        props.setError(
          "files",
          t("settings.quickReplies.form.field.files.error.size", {
            limit: UPLOAD_SIZE_LIMIT_MB,
          })
        );
      }
    } else {
      props.setError("files", undefined);
    }
  };
  const createUploadProxy = (fileRaw: File) => ({
    blobContainer: "",
    id: undefined,
    quickReplyFileId: "",
    filename: fileRaw.name,
    mimeType: "",
    fileProxy: fileRaw,
    url: "",
  });

  async function submitDelete(file: UploadedQuickReplyFileType) {
    try {
      await sendDeleteFile(file);
      props.setFieldValue("files", []);
    } catch (e) {
      console.error("submitDelete", e);
    }
  }

  const canEdit =
    props.editMode === "update" ? canEditSavedReplies : canCreateSavedReplies;

  return (
    <>
      <div className="title-area">
        <div className="row">
          <Form.Input
            error={showError(props.errors.name)}
            disabled={pending || !canEdit}
            input={() => (
              <input
                type="text"
                value={props.values.name}
                placeholder={t("settings.quickReplies.field.name.placeholder")}
                onChange={(event) => {
                  props.setFieldValue("name", event.target.value);
                }}
              />
            )}
          ></Form.Input>
          {props.editMode === "update" && props.values.user && userDisplayName && (
            <div className={"user-info"}>
              {t("settings.quickReplies.updatedAt", { at: timeAgo })}
              {props.values.user?.profilePictureURL && (
                <Image
                  src={staffProfilePictureURL(
                    props.values.user.profilePictureURL
                  )}
                  avatar
                  inline
                  size={"mini"}
                />
              )}
              {userDisplayName}
            </div>
          )}
          {props.isLimitReached && (
            <Message warning visible>
              {t("settings.quickReplies.warnLimit", {
                count: QUICK_REPLY_LIMIT,
              })}
            </Message>
          )}
        </div>
      </div>
      {(canEdit || props.filesUploading.length > 0) && (
        <div className="files-area">
          <div className="row upload-row">
            <ImagesInput<UploadedQuickReplyFileType>
              limit={1}
              sizeLimit={UPLOAD_SIZE_LIMIT}
              submitFiles={props.submitFiles}
              broadcastDispatch={props.dispatch}
              uploadedFiles={props.filesUploading}
              id={props.values.id ? String(props.values.id) : undefined}
              submitDelete={submitDelete}
              createProxy={createUploadProxy}
              idFieldName={"quickReplyFileId"}
              onFilesDropped={handleFilesDropped}
              onFilesUploaded={(files) => {
                props.setFieldValue("files", files);
              }}
              disabled={!canEdit}
            />
            {showError(props.errors.files as string | undefined)}
          </div>
        </div>
      )}
      <Form.Input
        className={"textarea-wrap"}
        error={showError(props.errors.text)}
        input={() => {
          return (
            <>
              <textarea
                id={TEXTAREA_ID}
                ref={textareaRef}
                value={props.values.text}
                disabled={pending || !canEdit}
                placeholder={t(
                  "settings.quickReplies.form.field.text.placeholder"
                )}
                onChange={(event) => {
                  props.setFieldValue("text", event.target.value);
                }}
              />
              {canEdit && (
                <EmojiButton
                  handleEmojiInput={(emoji) => {
                    if (textareaRef.current) {
                      insertTextAtCursor(textareaRef.current, emoji);
                    }
                  }}
                />
              )}
            </>
          );
        }}
      />
      <div className="vars-column">
        <VariablesSelection
          isSearchable={false}
          updateText={(text) => {
            props.setFieldValue("text", text);
          }}
          textareaId={TEXTAREA_ID}
        />
      </div>
      <div className="actions row">
        {canDeleteSavedReplies && props.editMode === "update" && (
          <Button
            className={"button-small"}
            content={t("form.button.delete")}
            loading={props.deleteLoading}
            disabled={props.formLoading}
            onClick={props.onDeleteClick}
          />
        )}
        {canCreateSavedReplies && props.editMode === "create" && (
          <Button
            className={"button-small"}
            content={t("form.button.cancel")}
            disabled={props.formLoading}
            onClick={props.onCreateClick}
          />
        )}
        {canEdit && (
          <Button
            className={"button-small"}
            primary
            content={
              props.editMode === "update"
                ? t("form.button.update")
                : t("form.button.create")
            }
            onClick={props.submitForm}
            disabled={props.deleteLoading}
            loading={props.formLoading}
          />
        )}
      </div>
    </>
  );
}
