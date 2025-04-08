import React, { useEffect, useReducer, useState } from "react";
import {
  Button,
  Dimmer,
  Dropdown,
  Header,
  Icon,
  List,
  Loader,
} from "semantic-ui-react";
import Helmet from "react-helmet";
import { useFormik } from "formik";
import {
  denormalizeQuickReplyResponse,
  normalizeQuickReplyRequest,
  QUICK_REPLY_ENTRIES_LIMIT,
  QuickReplyDeleteResponseType,
  QuickReplyFileResponseType,
  QuickReplyResponseType,
  QuickReplyType,
} from "../../types/QuickReplies/QuickReplyType";
import { object, string } from "yup";
import { defaultState, quickRepliesReducer } from "./quickRepliesReducer";
import ModalConfirm from "../../component/shared/ModalConfirm";
import { deleteMethodWithExceptions, post } from "../../api/apiRequest";
import {
  DELETE_QUICK_REPLY,
  POST_CREATE_QUICK_REPLY,
  POST_QUICK_REPLY_ATTACHMENT,
} from "../../api/apiPath";
import { useFlashMessageChannel } from "../../component/BannerMessage/flashBannerMessage";
import { getQueryMatcher } from "./filters/getQueryMatcher";
import { either, update } from "ramda";
import { useTranslation } from "react-i18next";
import {
  UploadedFileGeneralProxyType,
  UploadedQuickReplyFileType,
} from "../../types/UploadedFileType";
import { EditForm } from "./SettingQuickReplies/EditForm";
import {
  fetchCompanyQuickReplies,
  QUICK_REPLY_LIMIT,
} from "../../api/Company/fetchCompanyQuickReplies";
import { useAppSelector } from "../../AppRootContext";
import { DisableControls } from "core/components/DisableControls/DisableControls";
import { FieldError } from "component/shared/form/FieldError";
import { PermissionGuard } from "component/PermissionGuard";
import { PERMISSION_KEY } from "types/Rbac/permission";
import { useRequireRBAC } from "component/shared/useRequireRBAC";

type Mutable<T> = { -readonly [K in keyof T]: T[K] };

function newQuickReplyValues(): QuickReplyType {
  return {
    name: "",
    text: "",
    id: undefined,
    files: [],
  };
}

const matcher = getQueryMatcher((it: QuickReplyType) => `${it.name}${it.text}`);

export function showError(error: string | undefined) {
  if (error) {
    return <FieldError text={error} />;
  }
}

function SettingQuickReplies() {
  useRequireRBAC([PERMISSION_KEY.inboxSavedRepliesView]);

  const [state, dispatch] = useReducer(quickRepliesReducer, defaultState());
  const company = useAppSelector((s) => s.company);
  const { t, i18n } = useTranslation();

  async function loadItems() {
    try {
      dispatch({ type: "ITEMS_LOAD_START" });
      const resultsDenormalized = await fetchCompanyQuickReplies(i18n.language);
      dispatch({ type: "ITEMS_LOAD_COMPLETE", data: resultsDenormalized });
    } catch (e) {
      dispatch({ type: "ITEMS_LOAD_ERROR", error: e });
    }
  }

  const flash = useFlashMessageChannel();

  useEffect(() => {
    loadItems();
  }, []);

  async function saveItem(data: QuickReplyType): Promise<QuickReplyType> {
    try {
      dispatch({ type: "SAVE_START" });
      const requestBody = [normalizeQuickReplyRequest(data, company)];

      const results: QuickReplyResponseType = await post(
        POST_CREATE_QUICK_REPLY,
        {
          param: requestBody,
        }
      );
      let resultsDenormalized = results.list.map((item) =>
        denormalizeQuickReplyResponse(item, i18n.language)
      );

      let formValuesUpdated: QuickReplyType | undefined;
      if (state.editMode === "update") {
        formValuesUpdated = resultsDenormalized.find((r) => r.id === data.id);
        flash(t("flash.settings.quickReply.updated"));
      } else {
        formValuesUpdated = denormalizeQuickReplyResponse(
          results.created,
          i18n.language
        );
        if (state.uploadedFiles.length > 0) {
          const fileResult = await saveUploadedFiles(
            String(results.created.id),
            state.uploadedFiles
          );
          formValuesUpdated.files = fileResult;
        }
        flash(t("flash.settings.quickReply.added"));
      }
      if (formValuesUpdated?.id) {
        const idx = resultsDenormalized.findIndex(
          (r) => r.id === formValuesUpdated!.id
        );
        resultsDenormalized = update(
          idx,
          formValuesUpdated,
          resultsDenormalized
        );
      }
      dispatch({
        type: "SAVE_COMPLETE",
        data: resultsDenormalized,
        files: formValuesUpdated?.files ?? [],
      });
      if (!formValuesUpdated) {
        console.error("saveItem: missing formValuesUpdated", { results, data });
        return newQuickReplyValues();
      }
      form.resetForm({ values: formValuesUpdated });
      return formValuesUpdated;
    } catch (e) {
      console.error("updateItem", { e, data });
      dispatch({ type: "SAVE_ERROR" });
      flash(t("system.error.unknown"));

      return data;
    }
  }

  async function saveUploadedFiles(
    id: string,
    files: Readonly<UploadedFileGeneralProxyType[]>
  ) {
    const newFiles = files
      .filter((file) => Boolean(file.fileProxy))
      .map((f) => f.fileProxy as File);
    const formData = new FormData();
    for (let file of newFiles) {
      formData.append("files", file);
    }
    return await submitFilesFormData(id, formData);
  }

  async function submitFilesFormData(
    id: string,
    data: FormData
  ): Promise<UploadedQuickReplyFileType[]> {
    const result: QuickReplyFileResponseType = await post(
      POST_QUICK_REPLY_ATTACHMENT.replace("{id}", id),
      {
        param: data,
        header: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );
    const firstResult = {
      url: result.url,
      filename: result.filename,
      quickReplyFileId: result.quickReplyFileId,
      id: result.id,
      blobContainer: result.blobContainer,
      mimeType: result.mimeType,
    };

    return [firstResult];
  }

  async function deleteItem(data: QuickReplyType) {
    try {
      dispatch({ type: "DELETE_START" });
      const results: QuickReplyDeleteResponseType =
        await deleteMethodWithExceptions(DELETE_QUICK_REPLY, {
          param: [{ id: data.id }],
        });

      form.resetForm({ values: newQuickReplyValues() });
      dispatch({
        type: "DELETE_COMPLETE",
        data: results.list.map((item) => {
          return denormalizeQuickReplyResponse(item, i18n.language);
        }),
      });
    } catch (e) {
      console.error("deleteItem", e, { data });
      dispatch({ type: "DELETE_ERROR" });
      flash(t("system.error.unknown"));
    }
  }

  const [savedValues, setSavedValues] = useState<QuickReplyType>(
    newQuickReplyValues()
  );
  const form = useFormik<QuickReplyType>({
    initialValues: savedValues,
    validateOnChange: false,
    validateOnBlur: false,

    onSubmit: async (values) => {
      const result = await saveItem(values);
      setSavedValues(result);
    },

    validationSchema: object({
      name: string().required(),
      text: string().required(),
    }),
  });

  const listItems = state.isSearching
    ? state.items.filter(
        either(matcher(state.searchQuery), (item) => item.id === form.values.id)
      )
    : state.items;

  const pending = state.formLoading || state.deleteLoading;

  const createClickHandler = () => {
    if (form.dirty) {
      dispatch({ type: "RESET_PROMPT", data: newQuickReplyValues() });
    } else {
      form.resetForm({
        values:
          (state.editCandidate as Mutable<QuickReplyType>) ??
          newQuickReplyValues(),
      });
      dispatch({ type: "CREATE_START" });
    }
  };

  const {
    editMode,
    formLoading,
    deleteLoading,
    showForm,
    editCandidate,
    itemsLoading,
    showDeleteConfirm,
    showResetConfirm,
    items,
  } = state;

  const companyId = useAppSelector((s) => s.company?.id || "");
  const isLimitReached = state.items.length >= QUICK_REPLY_LIMIT;
  const createButtonDisabled = pending || isLimitReached;

  const pageTitle = t("nav.menu.settings.quickReply");

  function handleItemClick(item: QuickReplyType) {
    return () => {
      if (form.values.id === item.id) {
        return;
      }
      if (form.dirty) {
        dispatch({ type: "RESET_PROMPT", data: item });
      } else {
        form.resetForm({ values: item });
        dispatch({ type: "EDIT_START", files: item.files });
      }
    };
  }

  return (
    <Dimmer.Dimmable dimmed className={"content quick-reply-management"}>
      <Helmet title={t("nav.common.title", { page: pageTitle })} />
      {itemsLoading ? (
        <Dimmer active inverted>
          <Loader inverted />
        </Dimmer>
      ) : (
        <DisableControls disabled={formLoading}>
          <div className="quick-replies container no-scrollbars ui form">
            <div className="header">
              <Header as="h4" content={t("settings.quickReplies.title")} />
              <PermissionGuard keys={PERMISSION_KEY.inboxSavedRepliesCreate}>
                <div className="action-btn">
                  {editMode !== "create" && (
                    <Button
                      className={"primary button-small"}
                      disabled={createButtonDisabled}
                      onClick={createClickHandler}
                    >
                      {t("settings.quickReplies.button.create")}
                    </Button>
                  )}
                </div>
              </PermissionGuard>
            </div>
            <div className="search-box">
              <Dropdown
                search
                icon={"search"}
                placeholder={t(
                  "settings.quickReplies.form.field.search.placeholder"
                )}
                options={items.map((item) => {
                  return {
                    text: item.name,
                    key: item.id,
                    value: item.id,
                  };
                })}
                searchQuery={state.searchQuery}
                open={false}
                onSearchChange={(_, data) => {
                  dispatch({
                    type: "SEARCH_UPDATE",
                    query: data.searchQuery as string,
                  });
                }}
              />
              {state.isSearching && (
                <Icon
                  name={"close"}
                  className={"search-reset"}
                  onClick={() => {
                    dispatch({ type: "SEARCH_RESET" });
                  }}
                />
              )}
            </div>
            <div
              className={`items-column ${
                form.values.id === undefined && listItems.length === 0
                  ? "empty"
                  : ""
              }`}
            >
              <List divided relaxed className={"clickable"}>
                {(listItems as Mutable<QuickReplyType[]>).map((item, i) => {
                  const isItemLoading =
                    (state.formLoading || state.deleteLoading) &&
                    form.values.id === item.id;
                  const hasAttachment = item.files && item.files.length > 0;
                  return (
                    <List.Item
                      active={item.id === form.values.id}
                      disabled={isItemLoading}
                      onClick={handleItemClick(item)}
                      key={i}
                    >
                      <span className="text">{item.name}</span>
                      {hasAttachment && (
                        <i className={"ui icon attachment-trigger small"} />
                      )}
                      {isItemLoading && <Loader active size={"small"} inline />}
                    </List.Item>
                  );
                })}
              </List>
            </div>
            {showForm && (
              <EditForm
                editMode={editMode}
                values={form.values}
                deleteLoading={deleteLoading}
                formLoading={formLoading}
                onDeleteClick={() => {
                  dispatch({ type: "DELETE_PROMPT" });
                }}
                onCreateClick={() => {
                  if (form.dirty || state.uploadedFiles.length > 0) {
                    dispatch({ type: "RESET_PROMPT", data: form.values });
                  } else {
                    dispatch({ type: "CREATE_CANCEL" });
                  }
                }}
                setFieldValue={(name, value) => {
                  form.setFieldValue(name, value);
                }}
                submitForm={form.submitForm}
                errors={form.errors}
                setError={(field, error) => {
                  form.setFieldError(field, error);
                }}
                dispatch={dispatch}
                filesUploading={
                  state.uploadedFiles as Mutable<UploadedQuickReplyFileType[]>
                }
                submitFiles={submitFilesFormData}
                isLimitReached={isLimitReached}
              />
            )}
            {showResetConfirm && (
              <ResetPrompt
                item={form.values}
                onConfirm={() => {
                  if (editCandidate?.id) {
                    dispatch({
                      type: "EDIT_START",
                      files: editCandidate.files as Mutable<
                        UploadedQuickReplyFileType[]
                      >,
                    });
                    form.resetForm({
                      values: editCandidate as Mutable<QuickReplyType>,
                    });
                  } else {
                    if (editCandidate) {
                      dispatch({
                        type: "CREATE_CANCEL",
                      });
                    } else {
                      dispatch({
                        type: "CREATE_START",
                      });
                    }
                    form.resetForm({ values: newQuickReplyValues() });
                  }
                }}
                onCancel={() => dispatch({ type: "RESET_CANCEL" })}
              />
            )}
            {showDeleteConfirm && (
              <DeletePrompt
                onConfirm={async () => {
                  await deleteItem(form.values);
                }}
                onCancel={() => {
                  dispatch({ type: "DELETE_CANCEL" });
                }}
              />
            )}
          </div>
        </DisableControls>
      )}
    </Dimmer.Dimmable>
  );
}

function ResetPrompt(props: {
  item: QuickReplyType;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const { t } = useTranslation();
  return (
    <ModalConfirm
      opened={true}
      onCancel={props.onCancel}
      onConfirm={props.onConfirm}
      confirmText={t("form.button.yes")}
      cancelText={t("form.button.no")}
      title={t("settings.quickReplies.modal.confirmCancel.title")}
    >
      {t("settings.quickReplies.modal.confirmCancel.content", {
        name: props.item.name,
      })}
    </ModalConfirm>
  );
}

function DeletePrompt(props: { onCancel: () => void; onConfirm: () => void }) {
  const { t } = useTranslation();

  return (
    <ModalConfirm
      opened={true}
      onCancel={props.onCancel}
      onConfirm={props.onConfirm}
      confirmText={t("form.button.yes")}
      cancelText={t("form.button.no")}
      title={t("settings.quickReplies.modal.confirmDelete.title")}
    >
      {t("settings.quickReplies.modal.confirmDelete.content")}
    </ModalConfirm>
  );
}

export default SettingQuickReplies;
