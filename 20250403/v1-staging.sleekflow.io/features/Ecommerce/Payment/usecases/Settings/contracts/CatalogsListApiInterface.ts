import { CatalogStateType } from "features/Ecommerce/Payment/usecases/Settings/Catalog/types";
import * as yup from "yup";
import { ValidationError } from "yup";
import { TFunction } from "i18next";

export interface CatalogsListApiInterface<Id extends number | string> {
  changeName: (name: string, id: Id) => void;
  changeShowStatus: (show: boolean, id: Id) => void;
  updateCatalog: () => Promise<any[]>;
  isCatalogChanged: boolean;
  stores: CatalogStateType<Id>[];
  fetchStores: () => Promise<void>;
  changePaymentEnabled?: (value: boolean, id: Id) => void;
  getError: (id: Id) => string | undefined;
  hasErrors: boolean;
}

export function getErrorGeneric<Id extends number | string>(
  diff: CatalogStateType<Id>[],
  id: Id,
  t: TFunction
) {
  const record = diff.find((d) => d.id === id);
  if (!record) {
    return;
  }
  try {
    const validator = yup
      .string()
      .required(t("settings.commerce.createStore.field.any.error.required"))
      .trim()
      .max(128);
    validator.validateSync(record.name);
    validator.isValidSync(record.name, {});
  } catch (e) {
    console.error(e);
    if (ValidationError.isError(e)) {
      return e.errors[0];
    }
  }
}
