import { createObjectsGridReducer } from "features/Salesforce/components/ObjectsGrid/ObjectsGridContext";
import { Reducer } from "react";
import {
  ObjectsGridStateType,
  ObjectsGridActionType,
} from "features/Salesforce/components/ObjectsGrid/ObjectsGridContextType";
import { ProductType } from "core/models/Ecommerce/Catalog/ProductType";
import { defaultDataGridState } from "features/Salesforce/components/ObjectsGrid/DataGridStateType";
import { defaultContinuousPagerState } from "features/Salesforce/reducers/continuousPagerReducer";
import { ProductListFilter } from "features/Ecommerce/usecases/Settings/CustomStore/EditStore/ProductsTab/useProductListApi";

export const createProductsListReducer = (
  pageSize: number,
  pagesPerGroup: number
) =>
  createObjectsGridReducer(
    "DATA_LOADED",
    {},
    pageSize,
    pagesPerGroup
  ) as Reducer<
    ObjectsGridStateType<ProductType, ProductListFilter>,
    ObjectsGridActionType<ProductType, ProductListFilter>
  >;

export function defaultState() {
  return {
    ...defaultDataGridState<ProductListFilter, ProductType>({ search: "" }),
    ...defaultContinuousPagerState(),
  };
}
