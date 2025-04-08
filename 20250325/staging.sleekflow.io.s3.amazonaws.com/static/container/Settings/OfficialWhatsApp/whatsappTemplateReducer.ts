import produce from "immer";
import { equals, reject, uniq } from "ramda";
import {
  WhatsappTemplateNormalizedType,
  isWhatsappTemplateNormalizedType,
} from "../../../types/WhatsappTemplateResponseType";
import { WhatsappCloudAPITemplateType } from "features/WhatsappCloudAPI/models/WhatsappCloudAPITemplateType";
import { Reducer } from "react";

const getTemplateId = (
  template: WhatsappTemplateNormalizedType | WhatsappCloudAPITemplateType
) => {
  if (isWhatsappTemplateNormalizedType(template)) return template.sid;
  return template.id;
};

export type WhatsappTemplateAction<
  T extends WhatsappTemplateNormalizedType | WhatsappCloudAPITemplateType
> =
  | {
      type: "TEMPLATES_LOAD_START";
    }
  | {
      type: "TEMPLATES_LOAD_COMPLETE";
      data: T[];
    }
  | {
      type: "TEMPLATES_LOAD_ERROR";
      error: any;
    }
  | {
      type: "EDIT_START";
      data: T;
    }
  | {
      type: "TEMPLATE_UPDATED";
      templateId: string;
      template: T;
    }
  | {
      type: "DELETE_INTENDED";
    }
  | {
      type: "DELETE_CANCELED";
    }
  | {
      type: "DELETE_STARTED";
    }
  | {
      type: "DELETE_COMPLETED";
      ids: string[];
    }
  | {
      type: "RESET_CANCEL";
    }
  | {
      type: "CHECKED_ITEM";
      id: string;
    }
  | {
      type: "UNCHECKED_ITEM";
      id: string;
    };

export interface WhatsappTemplateState<
  T extends WhatsappTemplateNormalizedType | WhatsappCloudAPITemplateType
> {
  showForm: boolean;
  items: T[];
  itemsLoading: boolean;
  formLoading: boolean;
  deleteLoading: boolean;
  deletePrompt: boolean;
  checkableItems: string[];
  rejected_reason?: string;
}

export function getWhatsappTemplateFormReducer<
  T extends WhatsappTemplateNormalizedType | WhatsappCloudAPITemplateType
>() {
  return produce(
    (state: WhatsappTemplateState<T>, action: WhatsappTemplateAction<T>) => {
      switch (action.type) {
        case "TEMPLATES_LOAD_START":
          state.itemsLoading = true;
          break;

        case "CHECKED_ITEM":
          state.checkableItems = uniq([...state.checkableItems, action.id]);
          break;

        case "UNCHECKED_ITEM":
          state.checkableItems = reject(
            equals(action.id),
            state.checkableItems
          );
          break;
        case "TEMPLATE_UPDATED":
          let item = state.items.findIndex(
            (i) => getTemplateId(i) === action.templateId
          );
          if (item > -1) {
            state.items[item] = action.template;
          }
          break;

        case "TEMPLATES_LOAD_COMPLETE":
          state.items = [...action.data];
          state.itemsLoading = false;
          break;

        case "TEMPLATES_LOAD_ERROR":
          state.itemsLoading = false;
          break;

        case "DELETE_INTENDED":
          state.deletePrompt = true;
          break;

        case "DELETE_STARTED":
          state.deletePrompt = false;
          break;

        case "DELETE_CANCELED":
          state.deletePrompt = false;
          break;

        case "DELETE_COMPLETED":
          state.checkableItems = reject(
            (id) => action.ids.includes(id),
            state.checkableItems
          );
          state.items = reject(
            (item) => action.ids.includes(getTemplateId(item)),
            state.items
          );
          break;
      }
    }
  ) as Reducer<WhatsappTemplateState<T>, WhatsappTemplateAction<T>>;
}

export function defaultState<
  T extends WhatsappTemplateNormalizedType | WhatsappCloudAPITemplateType
>(): WhatsappTemplateState<T> {
  return {
    showForm: false,
    items: [],
    checkableItems: [],
    itemsLoading: false,
    formLoading: false,
    deleteLoading: false,
    deletePrompt: false,
  };
}
