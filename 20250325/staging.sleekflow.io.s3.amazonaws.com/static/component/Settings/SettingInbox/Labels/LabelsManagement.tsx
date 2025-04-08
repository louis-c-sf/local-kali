import React, { useReducer, useState } from "react";
import styles from "./LabelsManagement.module.css";
import {
  companyProxiesReducer,
  LabelsManagementAction,
  labelsManagementReducer,
  LabelsManagementState,
  manageLabelsPopupReducer,
} from "../../../Chat/LabelsWidget/labelsManagementReducer";
import { reduceReducers } from "../../../../utility/reduce-reducers";
import {
  HashTagCountedType,
  HashTagType,
  normalizeHashTag,
  tagColorsBase,
} from "../../../../types/ConversationType";
import {
  deleteMethod,
  getWithExceptions,
  postWithExceptions,
} from "../../../../api/apiRequest";
import {
  DELETE_COMPANY_TAGS,
  GET_COMPANY_TAGS,
  POST_COMPANY_TAGS,
} from "../../../../api/apiPath";
import { matchingTag } from "../../../../container/Chat/LabelsManagementContainer";
import { useAppDispatch } from "../../../../AppRootContext";
import { EditRow } from "./EditRow";
import { Button, Table } from "semantic-ui-react";
import { eqBy, insert, prop, propEq, propSatisfies, toLower } from "ramda";
import { getQueryMatcher } from "../../../../container/Settings/filters/getQueryMatcher";
import { useFlashMessageChannel } from "../../../BannerMessage/flashBannerMessage";
import { Trans, useTranslation } from "react-i18next";
import { LabelEditForm } from "../../../Chat/LabelsWidget/LabelEditForm";
import ModalConfirm from "../../../shared/ModalConfirm";
import { SearchInput } from "../../../shared/input/SearchInput";
import { EditLabelModal } from "./EditLabelModal";
import { useCompanyHashTags } from "../../hooks/useCompanyHashTags";

export function LabelsManagement() {
  const loginDispatch = useAppDispatch();
  const { companyTags } = useCompanyHashTags();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchActive, setSearchActive] = useState(false);
  const [confirmTagToDelete, setConfirmTagToDelete] = useState<HashTagType>();
  const [editDialogNode, setEditDialogNode] = useState<HTMLElement | null>(
    null
  );
  const [rowEditNode, setRowEditNode] = useState<HTMLElement | null>(null);
  const flash = useFlashMessageChannel();
  const { t } = useTranslation();

  const [state, dispatch] = useReducer<
    React.Reducer<LabelsManagementState, LabelsManagementAction>
  >(
    reduceReducers(
      labelsManagementReducer,
      manageLabelsPopupReducer,
      companyProxiesReducer
    ),
    {
      deleteCompanyTagsProxy: [],
      newTagsProxy: [],
      newCompanyTagsProxy: [],
      deleteChatTagsProxy: [],
      editNewTag: null,
      editExistedTag: null,
      manageLabels: {
        deleteClickedId: null,
        editTag: null,
        updateProxies: [],
        editNewTag: null,
      },
    }
  );
  const matcher = getQueryMatcher(prop("hashtag"));
  let listItems =
    searchQuery === "" ? companyTags : companyTags.filter(matcher(searchQuery));
  let filteredListItems = listItems.filter((tag) => {
    return !state.deleteCompanyTagsProxy.some(propEq("hashtag", tag.hashtag));
  });
  let hasExactMatch = false;
  if (searchActive) {
    hasExactMatch = [...companyTags, ...state.newCompanyTagsProxy].some(
      propSatisfies(eqBy(toLower, searchQuery.toLowerCase()), "hashtag")
    );
  }

  function searchHandler(query: string) {
    setSearchActive(query !== "");
    setSearchQuery(query);
  }

  function searchClearHandler() {
    setSearchActive(false);
    setSearchQuery("");
  }

  const displayListItems = state.newCompanyTagsProxy.reduce<HashTagType[]>(
    (acc, next) => {
      if (acc.some(propEq("hashtag", next.hashtag))) {
        return acc;
      }
      const insertBeforeIndex = acc.findIndex((tag) => {
        return tag.hashtag.localeCompare(next.hashtag) === 1;
      });
      if (insertBeforeIndex === -1) {
        return [...acc, next];
      }
      return insert(insertBeforeIndex, next, acc);
    },
    filteredListItems
  );

  async function fetchCompanyTags() {
    try {
      const tags: HashTagCountedType[] = await getWithExceptions(
        GET_COMPANY_TAGS,
        { param: {} }
      );
      loginDispatch({ type: "UPDATE_COMPANY_TAGS", tags });
    } catch (e) {
      console.error("fetchCompanyTags", e);
    }
  }

  const handleTagAdded = async () => {
    const tag = { hashtag: searchQuery.trim(), hashTagColor: tagColorsBase[0] };
    dispatch({ type: "MANAGE_LABELS.START_EDIT_ADDED_TAG", tag });
    // addOrUpdateCompanyTag(tag);
  };

  async function submitTagUpdated(tag: HashTagType) {
    try {
      const tagsUpdated = await postWithExceptions(POST_COMPANY_TAGS, {
        param: [normalizeHashTag(tag)],
      });
      loginDispatch({ type: "UPDATE_COMPANY_TAGS", tags: tagsUpdated });
    } catch (e) {
      console.error(e);
    }
  }

  async function handleDeleteTag(tag: HashTagType) {
    setConfirmTagToDelete(undefined);
    try {
      dispatch({ type: "DELETE_COMPANY_TAG_START", tag });
      const result: HashTagCountedType[] = await deleteMethod(
        DELETE_COMPANY_TAGS,
        { param: [tag] }
      );
      loginDispatch({ type: "UPDATE_COMPANY_TAGS", tags: result });
      dispatch({ type: "DELETE_COMPANY_TAG_END", tag });
    } catch (e) {
      dispatch({ type: "DELETE_COMPANY_TAG_ERROR", tag });
      console.error("onCompanyTagDelete", e, tag);
    }
  }

  async function handleEditComplete(tag: HashTagType) {
    dispatch({ type: "MANAGE_LABELS.UPDATE_START", tag });
    await submitTagUpdated(tag);
    dispatch({ type: "MANAGE_LABELS.UPDATE_END", tag });
  }

  async function addOrUpdateCompanyTag(tag: HashTagType) {
    try {
      dispatch({ type: "MANAGE_LABELS.ADD_TAG_PROXY", tag });
      await submitTagUpdated(tag);
      const tagExisted = companyTags.find(propEq("hashtag", tag.hashtag));
      if (!tagExisted) {
        // update tags in background
        await fetchCompanyTags();
      }
      dispatch({ type: "MANAGE_LABELS.REMOVE_NEW_TAG_PROXY", tag });
    } catch (e) {
      console.error("addOrUpdateCompanyTag", e, tag);
      flash(t("flash.common.unknownErrorTryLater"));
    }
  }

  function startEditingTag(tag: HashTagType) {
    return (node: HTMLElement) => {
      setRowEditNode(node);
      if (tag.id) {
        dispatch({ type: "MANAGE_LABELS.EDIT_CLICK", tag });
      }
    };
  }

  const newCompanyTagColorConfirmHandler = () => {
    if (!state.manageLabels.editNewTag) {
      return;
    }
    dispatch({ type: "MANAGE_LABELS.STOP_EDIT_ADDED_TAG" });
    addOrUpdateCompanyTag({ ...state.manageLabels.editNewTag });
  };

  const tagsVisible = companyTags?.filter(
    (tag) => !state.deleteChatTagsProxy.some(matchingTag(tag))
  );

  const tagProxiesVisible = state.newTagsProxy.filter(
    (p: HashTagType) => !companyTags.some(matchingTag(p))
  );
  if (
    state.manageLabels.editNewTag &&
    !tagProxiesVisible.some(matchingTag(state.manageLabels.editNewTag)) &&
    !tagsVisible.some(matchingTag(state.manageLabels.editNewTag))
  ) {
    tagProxiesVisible.push(state.manageLabels.editNewTag);
  }

  const isAddLabelDisabled = Boolean(state.manageLabels.editNewTag);
  const canAddNewLabel = searchActive && !hasExactMatch;

  return (
    <div className={styles.management}>
      <div className={styles.wrap}>
        <div className={styles.header}>
          <div className={styles.headerWrap}>
            <div className={styles.title}>
              {t("settings.inbox.labels.title")}
            </div>
            <div className={styles.actions}>
              <Button
                content={t("settings.inbox.labels.button.add")}
                disabled={isAddLabelDisabled}
                className={"button-size-small button1"}
                onClick={handleTagAdded}
              />
            </div>
          </div>
        </div>
        <div className={styles.search}>
          <SearchInput
            onChange={(ev) => searchHandler(ev.target.value)}
            hasQuery={searchQuery.trim() !== ""}
            loading={false}
            reset={searchClearHandler}
            query={searchQuery}
          />
        </div>
        <div className={styles.body}>
          <div className={styles.tableWrap}>
            {displayListItems.length > 0 && (
              <Table singleLine basic={"very"}>
                <tbody>
                  {displayListItems.map((tag) => (
                    <EditRow
                      key={tag.id ?? tag.hashtag}
                      tag={tag}
                      onEditTag={startEditingTag(tag)}
                      onDeleteTag={() => {
                        setConfirmTagToDelete(tag);
                      }}
                    />
                  ))}
                </tbody>
              </Table>
            )}
          </div>
          {canAddNewLabel && (
            <div onClick={handleTagAdded} className={styles.addLink}>
              <Trans
                i18nKey={"chat.labels.manage.prompt.createLabel"}
                values={{ name: searchQuery }}
              >
                + Create label for ‘<span>{searchQuery}</span>’
              </Trans>
            </div>
          )}
        </div>
      </div>
      {state.manageLabels.editNewTag && (
        <EditLabelModal
          tag={state.manageLabels.editNewTag}
          onCancel={() => {
            dispatch({ type: "MANAGE_LABELS.STOP_EDIT_ADDED_TAG" });
          }}
          onChange={(tag) => {
            dispatch({ type: "MANAGE_LABELS.UPDATE_NEW_TAG", tag });
          }}
          onComplete={newCompanyTagColorConfirmHandler}
        />
      )}
      {state.manageLabels.editTag && (
        <LabelEditForm
          onEditComplete={handleEditComplete}
          anchor={rowEditNode}
          tag={state.manageLabels.editTag}
          onDismiss={() => {
            dispatch({ type: "MANAGE_LABELS.EDIT_CANCEL" });
          }}
          onFormUpdate={(tag) => {
            dispatch({ type: "MANAGE_LABELS.UPDATE_FIELD", tag });
          }}
          setFormNode={setEditDialogNode}
        />
      )}
      {confirmTagToDelete && (
        <ModalConfirm
          opened
          className={"no-icon"}
          onConfirm={() => handleDeleteTag(confirmTagToDelete)}
          onCancel={() => setConfirmTagToDelete(undefined)}
          cancelText={t("form.button.cancel")}
          title={t("settings.inbox.labels.modal.delete.title")}
          confirmText={t("form.button.delete")}
        >
          <Trans
            i18nKey={"settings.inbox.labels.modal.delete.confirmationText"}
          >
            <p>Are you sure you want to delete a label?</p>
            <p className={"bold"}>This cannot be undone.</p>
          </Trans>
        </ModalConfirm>
      )}
    </div>
  );
}
