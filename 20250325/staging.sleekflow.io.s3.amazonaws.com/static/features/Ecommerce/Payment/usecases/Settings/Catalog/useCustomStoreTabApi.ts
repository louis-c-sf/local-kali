import { useState } from "react";
import { CatalogStateType } from "./types";
import { adjust, assoc, differenceWith, eqBy, pick } from "ramda";
import { fetchCustomStoresList } from "api/CommerceHub/fetchCustomStoresList";
import { submitUpdateCustomStore } from "api/CommerceHub/submitUpdateCustomStore";
import { CustomStoreType } from "core/models/Ecommerce/Catalog/CustomStoreType";
import produce from "immer";
import {
  CatalogsListApiInterface,
  getErrorGeneric,
} from "features/Ecommerce/Payment/usecases/Settings/contracts/CatalogsListApiInterface";
import { useTranslation } from "react-i18next";

export function useCustomStoreTabApi(): CatalogsListApiInterface<string> {
  const [storesLoaded, setStoresLoaded] = useState<CatalogStateType<string>[]>(
    []
  );
  const [storesDirty, setStoresDirty] = useState<CatalogStateType<string>[]>(
    []
  );
  const [storesNormalized, setStoresNormalized] = useState<CustomStoreType[]>(
    []
  );
  const { t } = useTranslation();

  const fetchStores = async () => {
    const result = await fetchCustomStoresList();
    const newStores = result.map<CatalogStateType<string>>((store) => {
      let defaultLang = store.languages.find(
        (lang) => lang.is_default
      )?.language_iso_code;
      if (!defaultLang) {
        defaultLang = store.languages[0]?.language_iso_code ?? "en";
        console.error(`default language missing on load`, store);
      }
      const name = store.names.find(
        (name) => name.language_iso_code === defaultLang
      );
      return {
        id: store.id,
        name: name?.value ?? "",
        isShowInInbox: store.is_view_enabled,
        isPaymentEnabled: store.is_payment_enabled,
        usersMyShopifyUrl: null,
      };
    });
    setStoresNormalized(result);
    setStoresLoaded([...newStores]);
    setStoresDirty([...newStores]);
  };

  const catalogDiff: CatalogStateType<string>[] = findCatalogDiff(
    storesDirty,
    storesLoaded
  );

  const isCatalogChanged = catalogDiff.length > 0;

  const updateCatalog = async () => {
    return await Promise.all(
      catalogDiff.reduce<Promise<void>[]>((acc, next) => {
        const store = storesNormalized.find((store) => store.id === next.id);
        if (store) {
          const request = normalizeStore(next, store);
          return [...acc, submitUpdateCustomStore(request)];
        }
        return acc;
      }, [])
    );
  };

  function changeShowStatus(show: boolean, id: string) {
    setStoresDirty((data) => {
      const existedIdx = storesDirty.findIndex((s) => s.id === id);
      if (existedIdx > -1) {
        return adjust(existedIdx, assoc("isShowInInbox", show), data);
      }
      return data;
    });
  }

  function changeName(name: string, id: string) {
    setStoresDirty((data) => {
      const existedIdx = storesDirty.findIndex((s) => s.id === id);
      if (existedIdx > -1) {
        return adjust(existedIdx, assoc("name", name), data);
      }
      return data;
    });
  }

  function changePaymentEnabled(value: boolean, id: string) {
    setStoresDirty((data) => {
      const existedIdx = storesDirty.findIndex((s) => s.id === id);
      if (existedIdx > -1) {
        return adjust(existedIdx, assoc("isPaymentEnabled", value), data);
      }
      return data;
    });
  }

  return {
    fetchStores,
    updateCatalog,
    isCatalogChanged,
    stores: storesDirty,
    changeName,
    changeShowStatus,
    changePaymentEnabled,
    getError: (id) => getErrorGeneric(catalogDiff, id, t),
    hasErrors: catalogDiff.some((c) => !!getErrorGeneric(catalogDiff, c.id, t)),
  };
}

function normalizeStore(
  values: CatalogStateType<string>,
  target: CustomStoreType
) {
  return produce(target, (draft) => {
    const firstLanguage = draft.languages[0]?.language_iso_code;
    if (firstLanguage === undefined) {
      throw { message: "Languages are missing", values };
    }
    const defaultLang =
      draft.languages.find((lang) => lang.is_default)?.language_iso_code ??
      firstLanguage;
    const nameIdx = draft.names.findIndex(
      (n) => n.language_iso_code === defaultLang
    );

    if (nameIdx > -1) {
      draft.names[nameIdx].value = values.name;
    }
    draft.is_view_enabled = values.isShowInInbox;
    draft.is_payment_enabled = values.isPaymentEnabled;
    draft.metadata = { ...target.metadata };
  });
}

function findCatalogDiff(
  stores: CatalogStateType<string>[],
  storesRef: CatalogStateType<string>[]
) {
  return differenceWith(
    eqBy(pick(["name", "isShowInInbox", "isPaymentEnabled"])),
    stores,
    storesRef
  );
}
