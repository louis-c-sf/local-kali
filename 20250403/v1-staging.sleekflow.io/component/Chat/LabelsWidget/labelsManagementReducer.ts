import { HashTagType, TagColorBaseType } from "../../../types/ConversationType";
import produce from "immer";
import { complement, insert, prepend, propEq, reject } from "ramda";
import { matchingTag } from "../../../container/Chat/LabelsManagementContainer";
import { Reducer } from "react";

export type ManageLabelsPopupState = {
  deleteClickedId: string | null;
  editTag: HashTagType | null;
  updateProxies: HashTagType[];
  editNewTag: HashTagType | null;
};

export type LabelsManagementState = {
  newTagsProxy: HashTagType[];
  newCompanyTagsProxy: HashTagType[];
  deleteChatTagsProxy: HashTagType[];
  deleteCompanyTagsProxy: HashTagType[];
  editNewTag: HashTagType | null;
  editExistedTag: HashTagType | null;
  manageLabels: ManageLabelsPopupState;
};

export type LabelsManagementAction =
  | {
      type: "ADD_NEW_TAG_PROXY";
      tag: HashTagType;
    }
  | {
      type: "REMOVE_NEW_TAG_PROXY";
      tag: HashTagType;
    }
  | {
      type: "ADD_DELETE_TAG_PROXY";
      tag: HashTagType;
    }
  | {
      type: "REMOVE_DELETE_TAG_PROXY";
      tag: HashTagType;
    }
  | {
      type: "UPDATE_NEW_TAG_COLOR";
      color: TagColorBaseType;
    }
  | {
      type: "START_EDIT_ADDED_TAG";
      tag: HashTagType;
    }
  | {
      type: "STOP_EDIT_ADDED_TAG";
    }
  | {
      type: "DELETE_COMPANY_TAG_START";
      tag: HashTagType;
    }
  | {
      type: "DELETE_COMPANY_TAG_END";
      tag: HashTagType;
    }
  | {
      type: "DELETE_COMPANY_TAG_ERROR";
      tag: HashTagType;
    }
  | ManageLabelsPopupAction;

export type ManageLabelsPopupAction =
  | {
      type: "MANAGE_LABELS.SHOW";
    }
  | {
      type: "MANAGE_LABELS.HIDE";
    }
  | {
      type: "MANAGE_LABELS.DELETE_CLICK";
      id: string;
    }
  | {
      type: "MANAGE_LABELS.EDIT_CLICK";
      tag: HashTagType;
    }
  | {
      type: "MANAGE_LABELS.UPDATE_FIELD";
      tag: HashTagType;
    }
  | {
      type: "MANAGE_LABELS.EDIT_CANCEL";
    }
  | {
      type: "MANAGE_LABELS.UPDATE_START";
      tag: HashTagType;
    }
  | {
      type: "MANAGE_LABELS.UPDATE_END";
      tag: HashTagType;
    }
  | {
      type: "MANAGE_LABELS.DELETE_START";
      tag: HashTagType;
    }
  | {
      type: "MANAGE_LABELS.ADD_TAG_PROXY";
      tag: HashTagType;
    }
  | {
      type: "MANAGE_LABELS.REMOVE_NEW_TAG_PROXY";
      tag: HashTagType;
    }
  | {
      type: "MANAGE_LABELS.ADD_DELETE_TAG_PROXY";
      tag: HashTagType;
    }
  | {
      type: "MANAGE_LABELS.REMOVE_DELETE_TAG_PROXY";
      tag: HashTagType;
    }
  | {
      type: "MANAGE_LABELS.START_EDIT_ADDED_TAG";
      tag: HashTagType;
    }
  | {
      type: "MANAGE_LABELS.STOP_EDIT_ADDED_TAG";
    }
  | {
      type: "MANAGE_LABELS.UPDATE_NEW_TAG";
      tag: HashTagType;
    }
  | {
      type: "MANAGE_LABELS.UPDATE_NEW_TAG_COLOR";
      color: TagColorBaseType;
    };

function addOrUpdate<T>(
  predicate: (...args: any[]) => boolean,
  list: T[],
  value: T
) {
  const foundIndex = list.findIndex(predicate);
  if (foundIndex > -1) {
    return insert(foundIndex, value, list);
  }
  return prepend(value, list);
}

export const labelsManagementReducer = produce(
  (draft: LabelsManagementState, action: LabelsManagementAction) => {
    switch (action.type) {
      case "ADD_NEW_TAG_PROXY": {
        draft.newTagsProxy = addOrUpdate(
          matchingTag(action.tag),
          draft.newTagsProxy,
          action.tag
        );
        break;
      }

      case "REMOVE_NEW_TAG_PROXY": {
        draft.newTagsProxy = reject(
          matchingTag(action.tag),
          draft.newTagsProxy
        );
        break;
      }

      case "ADD_DELETE_TAG_PROXY": {
        draft.deleteChatTagsProxy = addOrUpdate(
          matchingTag(action.tag),
          draft.deleteChatTagsProxy,
          action.tag
        );
        draft.newTagsProxy = reject(
          matchingTag(action.tag),
          draft.newTagsProxy
        );
        if (draft.editNewTag?.hashtag === action.tag.hashtag) {
          // editing tag is deleted, hide the color picker
          draft.editNewTag = null;
        }
        break;
      }

      case "REMOVE_DELETE_TAG_PROXY": {
        draft.deleteChatTagsProxy = reject(
          matchingTag(action.tag),
          draft.deleteChatTagsProxy
        );
        break;
      }

      case "UPDATE_NEW_TAG_COLOR":
        if (draft.editNewTag) {
          draft.editNewTag.hashTagColor = action.color;
        }
        break;

      case "START_EDIT_ADDED_TAG":
        draft.editNewTag = action.tag;
        break;

      case "STOP_EDIT_ADDED_TAG":
        draft.editNewTag = null;
        break;

      case "DELETE_COMPANY_TAG_START":
        draft.deleteChatTagsProxy = addOrUpdate(
          matchingTag(action.tag),
          draft.deleteChatTagsProxy,
          action.tag
        );
        draft.deleteCompanyTagsProxy = addOrUpdate(
          matchingTag(action.tag),
          draft.deleteCompanyTagsProxy,
          action.tag
        );
        draft.newTagsProxy = reject(
          matchingTag(action.tag),
          draft.newTagsProxy
        );
        draft.newCompanyTagsProxy = reject(
          matchingTag(action.tag),
          draft.newCompanyTagsProxy
        );
        break;

      case "DELETE_COMPANY_TAG_END":
      case "DELETE_COMPANY_TAG_ERROR":
        draft.deleteChatTagsProxy = reject(
          matchingTag(action.tag),
          draft.deleteChatTagsProxy
        );
        draft.deleteCompanyTagsProxy = reject(
          matchingTag(action.tag),
          draft.deleteCompanyTagsProxy
        );
        break;
    }
  }
);

export const companyProxiesReducer: Reducer<
  LabelsManagementState,
  LabelsManagementAction
> = produce((draft: LabelsManagementState, action: LabelsManagementAction) => {
  switch (action.type) {
    case "MANAGE_LABELS.ADD_TAG_PROXY":
      draft.newCompanyTagsProxy = addOrUpdate(
        matchingTag(action.tag),
        draft.newCompanyTagsProxy,
        action.tag
      );
      break;

    case "MANAGE_LABELS.REMOVE_NEW_TAG_PROXY":
      draft.newCompanyTagsProxy = addOrUpdate(
        matchingTag(action.tag),
        draft.newCompanyTagsProxy,
        action.tag
      );
      draft.manageLabels.deleteClickedId = null;
      draft.newCompanyTagsProxy = reject(
        matchingTag(action.tag),
        draft.newCompanyTagsProxy
      );
      break;

    case "MANAGE_LABELS.DELETE_START":
      draft.manageLabels.deleteClickedId = null;
      if (action.tag.hashtag === draft.manageLabels.editNewTag?.hashtag) {
        // editing tag is deleted, hide the color picker
        draft.manageLabels.editNewTag = null;
      }
      break;

    case "MANAGE_LABELS.START_EDIT_ADDED_TAG":
      draft.manageLabels.editNewTag = action.tag;
      break;

    case "MANAGE_LABELS.STOP_EDIT_ADDED_TAG":
      draft.manageLabels.editNewTag = null;
      break;

    case "MANAGE_LABELS.UPDATE_NEW_TAG_COLOR":
      if (draft.manageLabels.editNewTag?.hashTagColor) {
        draft.manageLabels.editNewTag.hashTagColor = action.color;
      }
      break;
  }
});

export const manageLabelsPopupReducer: Reducer<
  LabelsManagementState,
  LabelsManagementAction
> = produce((state: LabelsManagementState, action: LabelsManagementAction) => {
  const subState = state.manageLabels;
  switch (action.type) {
    case "MANAGE_LABELS.HIDE":
      subState.deleteClickedId = null;
      subState.editNewTag = null;
      subState.editTag = null;
      break;

    case "MANAGE_LABELS.DELETE_CLICK":
      subState.editTag = null;
      if (subState.deleteClickedId !== action.id) {
        subState.deleteClickedId = action.id;
      } else {
        subState.deleteClickedId = null;
      }
      break;

    case "MANAGE_LABELS.EDIT_CLICK":
      subState.editTag = action.tag;
      subState.deleteClickedId = null;
      break;

    case "MANAGE_LABELS.UPDATE_FIELD":
      if (subState.editTag) {
        subState.editTag.hashtag = action.tag.hashtag;
        subState.editTag.hashTagColor = action.tag.hashTagColor;
      }
      break;

    case "MANAGE_LABELS.EDIT_CANCEL":
      subState.editTag = null;
      break;

    case "MANAGE_LABELS.UPDATE_START":
      subState.updateProxies = subState.updateProxies
        .filter(complement(propEq("id", action.tag.id)))
        .concat(action.tag);
      break;

    case "MANAGE_LABELS.UPDATE_END":
      subState.editTag = null;
      subState.updateProxies = subState.updateProxies.filter(
        complement(propEq("id", action.tag.id))
      );
      break;

    case "MANAGE_LABELS.UPDATE_NEW_TAG":
      subState.editNewTag = action.tag;
      break;
  }
});
