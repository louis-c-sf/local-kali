import produce from "immer";
import { CatalogStateType } from "features/Ecommerce/Payment/usecases/Settings/Catalog/types";

function matchingStore(changedId: number) {
  return (s: CatalogStateType) => s.id === changedId;
}

export const catalogReducer = produce(
  (draft: CatalogStatusType<string | number>, action: CatalogActionType) => {
    switch (action.type) {
      case "INITIATE_CATALOG":
        draft.stores = action.catalog;
        draft.storesRef = action.catalog;
        break;
      case "UPDATE_STORE_NAME":
        {
          const target = draft.stores.find(matchingStore(action.id));
          if (target) {
            target.name = action.name;
          }
        }
        break;
      case "UPDATE_STATUS":
        {
          const target = draft.stores.find(matchingStore(action.id));
          if (target) {
            target.isShowInInbox = action.isShowInInbox;
          }
        }
        break;
    }
  }
);

export type CatalogStatusType<Id extends number | string> = {
  stores: CatalogStateType<Id>[];
  storesRef: CatalogStateType<Id>[];
};

export function initialCatalogStatus<
  Id extends number | string
>(): CatalogStatusType<Id> {
  return {
    stores: [],
    storesRef: [],
  };
}

export type CatalogActionType =
  | {
      type: "INITIATE_CATALOG";
      catalog: CatalogStateType[];
    }
  | {
      type: "UPDATE_STORE_NAME";
      id: number;
      name: string;
    }
  | {
      type: "UPDATE_STATUS";
      id: number;
      isShowInInbox: boolean;
    };
