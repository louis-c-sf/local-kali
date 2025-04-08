import { QuickReplyType } from "../../types/QuickReplies/QuickReplyType";
import produce from "immer";
import { MultiUploadStateType } from "../../types/BroadcastCampaignType";
import { reduceReducers } from "../../utility/reduce-reducers";
import {
  makeMultiUploadsReducer,
  MultiUploadActionType,
} from "../../component/Form/MultiUploadInput/multiUploadReducer";
import { UploadedQuickReplyFileType } from "../../types/UploadedFileType";

export interface QuickRepliesState
  extends MultiUploadStateType<UploadedQuickReplyFileType> {
  showDeleteConfirm: boolean;
  showResetConfirm: boolean;
  showForm: boolean;
  items: QuickReplyType[];
  itemsLoading: boolean;
  formLoading: boolean;
  deleteLoading: boolean;
  editMode: "create" | "update" | undefined;
  editCandidate: QuickReplyType | undefined;
  isSearching: boolean;
  searchQuery: string;
}
type ItemUpdatedAction<
  TField extends keyof QuickReplyType,
  TVal = QuickReplyType[TField]
> = {
  type: "ITEM_UPDATED";
  field: TField;
  value: TVal;
  id: number;
};
export type QuickRepliesAction =
  | {
      type: "ITEMS_LOAD_START";
    }
  | {
      type: "ITEMS_LOAD_COMPLETE";
      data: QuickReplyType[];
    }
  | ItemUpdatedAction<any>
  | {
      type: "ITEMS_LOAD_ERROR";
      error: any;
    }
  | {
      type: "CREATE_START";
    }
  | {
      type: "CREATE_CANCEL";
    }
  | {
      type: "EDIT_START";
      files: UploadedQuickReplyFileType[];
    }
  | {
      type: "DELETE_PROMPT";
    }
  | {
      type: "DELETE_START";
    }
  | {
      type: "DELETE_CANCEL";
    }
  | {
      type: "DELETE_ERROR";
    }
  | {
      type: "DELETE_COMPLETE";
      data: QuickReplyType[];
    }
  | {
      type: "SAVE_START";
    }
  | {
      type: "SAVE_ERROR";
    }
  | {
      type: "SAVE_COMPLETE";
      data: QuickReplyType[];
      files: UploadedQuickReplyFileType[];
    }
  | {
      type: "RESET_PROMPT";
      data: QuickReplyType;
    }
  | {
      type: "RESET_CANCEL";
    }
  | {
      type: "SEARCH_UPDATE";
      query: string;
    }
  | {
      type: "SEARCH_RESET";
    }
  | MultiUploadActionType<UploadedQuickReplyFileType>;

const quickRepliesFormReducer = produce(
  (state: QuickRepliesState, action: QuickRepliesAction) => {
    switch (action.type) {
      case "ITEMS_LOAD_START":
        state.itemsLoading = true;
        break;

      case "ITEM_UPDATED":
        const item = state.items.find((i) => i.id === action.id);
        if (item) {
          item[action.field] = action.value;
        }
        break;

      case "ITEMS_LOAD_COMPLETE":
        state.items = action.data;
        state.itemsLoading = false;
        state.uploadedFiles = [];
        break;

      case "ITEMS_LOAD_ERROR":
        state.itemsLoading = false;
        break;

      case "CREATE_START":
        state.showForm = true;
        state.editMode = "create";
        state.showResetConfirm = false;
        state.editCandidate = undefined;
        state.uploadedFiles = [];
        break;

      case "CREATE_CANCEL":
        state.showForm = false;
        state.editMode = undefined;
        state.uploadedFiles = [];
        break;

      case "EDIT_START":
        state.showResetConfirm = false;
        state.showForm = true;
        state.editMode = "update";
        state.editCandidate = undefined;
        state.uploadedFiles = action.files;
        break;

      case "DELETE_PROMPT":
        state.showDeleteConfirm = true;
        break;

      case "DELETE_START":
        state.deleteLoading = true;
        state.showDeleteConfirm = false;
        break;

      case "DELETE_CANCEL":
        state.showDeleteConfirm = false;
        break;

      case "DELETE_ERROR":
        state.deleteLoading = false;
        break;

      case "DELETE_COMPLETE":
        state.deleteLoading = false;
        state.items = action.data;
        state.showForm = false;
        break;

      case "SAVE_START":
        state.formLoading = true;
        break;

      case "SAVE_ERROR":
        state.formLoading = false;
        break;

      case "SAVE_COMPLETE":
        state.formLoading = false;
        state.items = action.data;
        state.editMode = "update";
        state.uploadedFiles = action.files;
        break;

      case "RESET_PROMPT":
        state.showResetConfirm = true;
        state.editCandidate = action.data;
        break;

      case "RESET_CANCEL":
        state.showResetConfirm = false;
        state.editCandidate = undefined;
        break;

      case "SEARCH_UPDATE":
        state.searchQuery = action.query;
        state.isSearching = action.query !== "";
        break;

      case "SEARCH_RESET":
        state.searchQuery = "";
        state.isSearching = false;
        break;
    }
  }
);
export const quickRepliesReducer = reduceReducers(
  quickRepliesFormReducer,
  makeMultiUploadsReducer<UploadedQuickReplyFileType>("quickReplyFileId")
);

export function defaultState(): QuickRepliesState {
  return {
    editCandidate: undefined,
    editMode: undefined,
    formLoading: false,
    deleteLoading: false,
    isSearching: false,
    items: [],
    showForm: false,
    itemsLoading: false,
    showDeleteConfirm: false,
    showResetConfirm: false,
    searchQuery: "",
    uploadedFiles: [],
  };
}
