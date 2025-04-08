import { SearchableDialog } from "../../shared/popup/SearchableDialog/SearchableDialog";
import { DropdownMenuList } from "../../shared/DropdownMenuList";
import {
  HashTagCountedType,
  HashTagType,
  TagColorBaseType,
  tagColorsBase,
} from "../../../types/ConversationType";
import React, { useState } from "react";
import { Dropdown } from "semantic-ui-react";
import { getQueryMatcher } from "../../../container/Settings/filters/getQueryMatcher";
import { eqBy, insert, prop, propEq, propSatisfies, toLower } from "ramda";
import {
  LabelsManagementAction,
  ManageLabelsPopupState,
} from "./labelsManagementReducer";
import { ColorPicker } from "./ColorPicker";
import { Trans, useTranslation } from "react-i18next";
import { LabelEditForm } from "./LabelEditForm";
import { ManageLabelItem } from "./ManageLabelItem";
import { deleteMethod } from "../../../api/apiRequest";
import { DELETE_COMPANY_TAGS } from "../../../api/apiPath";
import { useFlashMessageChannel } from "../../BannerMessage/flashBannerMessage";
import { useAppDispatch } from "../../../AppRootContext";
import { submitCreateOrUpdateHashTag } from "../../../api/Company/submitCreateOrUpdateHashTag";

const matcher = getQueryMatcher(prop("hashtag"));

export function ManageLabelsPopup(props: {
  state: ManageLabelsPopupState;
  dispatch: React.Dispatch<LabelsManagementAction>;
  companyTags: HashTagType[];
  newCompanyTagsProxy: HashTagType[];
  deletingTags: HashTagType[];
  onClose: () => void;
  trigger: HTMLElement | null;
  fetchCompanyTags: () => Promise<void>;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchActive, setSearchActive] = useState(false);

  const {
    companyTags,
    newCompanyTagsProxy,
    onClose,
    state,
    trigger,
    deletingTags,
    dispatch,
    fetchCompanyTags,
  } = props;

  const [editLabelNode, setEditLabelNode] = useState<HTMLElement | null>(null);
  const [editDialogNode, setEditDialogNode] = useState<HTMLElement | null>(
    null
  );
  const [hoveredIndex, setHoveredIndex] = useState<number>();

  const { t } = useTranslation();
  const loginDispatch = useAppDispatch();
  const flash = useFlashMessageChannel();

  let listItems =
    searchQuery === "" ? companyTags : companyTags.filter(matcher(searchQuery));
  let filteredListItems = listItems.filter((tag) => {
    return !deletingTags.some(propEq("hashtag", tag.hashtag));
  });

  const displayListItems = newCompanyTagsProxy.reduce<HashTagType[]>(
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

  let hasExactMatch = false;
  if (searchActive) {
    hasExactMatch = [...companyTags, ...newCompanyTagsProxy].some(
      propSatisfies(eqBy(toLower, searchQuery.toLowerCase()), "hashtag")
    );
  }

  function searchHandler(query: string) {
    setSearchActive(true);
    setSearchQuery(query);
  }

  function searchClearHandler() {
    setSearchActive(false);
    setSearchQuery("");
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

  async function submitTagUpdated(tag: HashTagType) {
    try {
      const tagsUpdated = await submitCreateOrUpdateHashTag(tag);
      loginDispatch({ type: "UPDATE_COMPANY_TAGS", tags: tagsUpdated });
    } catch (e) {
      console.error(e);
    }
  }

  const newCompanyTagColorConfirmHandler = () => {
    if (!state.editNewTag) {
      return;
    }
    dispatch({ type: "MANAGE_LABELS.STOP_EDIT_ADDED_TAG" });
    addOrUpdateCompanyTag({ ...state.editNewTag });
  };

  const handleTagAdded = async () => {
    const tag = { hashtag: searchQuery.trim(), hashTagColor: tagColorsBase[0] };
    dispatch({ type: "MANAGE_LABELS.START_EDIT_ADDED_TAG", tag });
    addOrUpdateCompanyTag(tag);
  };

  function startEditingTag(tag: HashTagType) {
    return (node: HTMLElement | null) => {
      setEditLabelNode(node);
      if (tag.id) {
        dispatch({ type: "MANAGE_LABELS.EDIT_CLICK", tag });
      }
    };
  }

  async function handleDeleteTag(tag: HashTagType) {
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

  const handleNewCompanyTagColorPick = (color: TagColorBaseType) => {
    dispatch({ type: "MANAGE_LABELS.UPDATE_NEW_TAG_COLOR", color });
  };

  const canAddNewLabel = searchActive && !hasExactMatch;

  let ignoreOutsideClickNodes: Element[] = [];
  if (editDialogNode) {
    ignoreOutsideClickNodes.push(editDialogNode);
  }

  return (
    <SearchableDialog
      flowing
      onSearch={searchHandler}
      onSearchClear={searchClearHandler}
      onSearchKeyDown={(event) => {
        if (event.keyCode === 13 && canAddNewLabel) {
          handleTagAdded();
        }
      }}
      close={() => {
        newCompanyTagColorConfirmHandler();
        onClose();
      }}
      triggerRef={trigger}
      className={"labels-management"}
      popperPlacement={"bottom-end"}
      placeholder={t("chat.labels.manage.field.search.placeholder")}
      ignoreOutsideClickNodes={ignoreOutsideClickNodes}
      closeOnDocumentClick={state.editTag === null}
    >
      {() => (
        <>
          <DropdownMenuList>
            {displayListItems.map((tag, index) => {
              return (
                <ManageLabelItem
                  dispatch={dispatch}
                  index={index}
                  onDelete={handleDeleteTag}
                  state={state}
                  tag={tag}
                  onEditClick={startEditingTag(tag)}
                  key={tag.id ?? tag.hashtag}
                  isHovered={index == hoveredIndex}
                  onMouseout={() => {
                    setHoveredIndex(undefined);
                  }}
                  onMouseover={() => {
                    setHoveredIndex(index);
                  }}
                />
              );
            })}
            {!hasExactMatch && searchActive && (
              <Dropdown.Item onClick={handleTagAdded} className={"action"}>
                <Trans
                  i18nKey={"chat.labels.manage.prompt.createLabel"}
                  values={{ name: searchQuery }}
                >
                  + Create label for ‘
                  <span className={"sample"}>{searchQuery}</span>’
                </Trans>
              </Dropdown.Item>
            )}
          </DropdownMenuList>
          {state.editNewTag && (
            <ColorPicker
              tag={state.editNewTag}
              anchor={editDialogNode}
              onPickColor={handleNewCompanyTagColorPick}
              onClose={newCompanyTagColorConfirmHandler}
              placement={"bottom"}
            />
          )}
          {state.editTag && (
            <LabelEditForm
              onEditComplete={handleEditComplete}
              anchor={editLabelNode}
              tag={state.editTag}
              onDismiss={() => {
                dispatch({ type: "MANAGE_LABELS.EDIT_CANCEL" });
              }}
              onFormUpdate={(tag) => {
                dispatch({ type: "MANAGE_LABELS.UPDATE_FIELD", tag });
              }}
              setFormNode={setEditDialogNode}
            />
          )}
        </>
      )}
    </SearchableDialog>
  );
}
