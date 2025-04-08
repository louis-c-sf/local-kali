import { useContext } from "react";
import { CatalogContextNum } from "./reducer/catalogContext";
import { ShopifyStoreResponseType, CatalogStateType } from "./types";
import { fetchShopifyStatusList } from "api/Stripe/fetchShopifyStatusList";
import { updateShopifyStatus } from "api/Stripe/updateShopifyStatus";
import { differenceWith, eqBy, pick } from "ramda";
import {
  CatalogsListApiInterface,
  getErrorGeneric,
} from "features/Ecommerce/Payment/usecases/Settings/contracts/CatalogsListApiInterface";
import { useTranslation } from "react-i18next";

export function useShopifyCatalogTabApi(): CatalogsListApiInterface<number> {
  const { state, dispatch } = useContext(CatalogContextNum);
  const { t } = useTranslation();

  const fetchStores = async () => {
    const result: ShopifyStoreResponseType[] = await fetchShopifyStatusList();
    const newStores: CatalogStateType<number>[] = result.map((store) => ({
      id: store.id,
      name: store.name,
      isShowInInbox: store.isShowInInbox,
      isPaymentEnabled: false,
      usersMyShopifyUrl: store.usersMyShopifyUrl,
    }));
    dispatch({
      type: "INITIATE_CATALOG",
      catalog: newStores,
    });
  };

  const catalogDiff: CatalogStateType<number>[] = findingCatalogDiff(
    state.stores,
    state.storesRef
  );
  const isCatalogChanged = catalogDiff.length > 0;

  const updateCatalog = async () => {
    return await Promise.all(
      catalogDiff.map((request) =>
        updateShopifyStatus(
          request.id as number,
          request.name,
          request.isShowInInbox
        )
      )
    );
  };

  const changeName = (name: string, id: number) => {
    dispatch({
      type: "UPDATE_STORE_NAME",
      id,
      name,
    });
  };
  const changeShowStatus = (show: boolean, id: number) => {
    dispatch({
      type: "UPDATE_STATUS",
      id: id as number,
      isShowInInbox: show,
    });
  };
  return {
    fetchStores,
    updateCatalog,
    isCatalogChanged,
    stores: state.stores,
    changeName,
    changeShowStatus,
    getError: (id: number) => getErrorGeneric(catalogDiff, id, t),
    hasErrors: catalogDiff.some((c) => !!getErrorGeneric(catalogDiff, c.id, t)),
  };
}

function findingCatalogDiff(
  stores: CatalogStateType<number>[],
  storesRef: CatalogStateType<number>[]
) {
  return differenceWith(
    eqBy(pick(["name", "isShowInInbox"])),
    stores,
    storesRef
  );
}
