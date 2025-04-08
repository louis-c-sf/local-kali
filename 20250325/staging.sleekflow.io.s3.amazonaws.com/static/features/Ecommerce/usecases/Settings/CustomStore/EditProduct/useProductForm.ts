import * as yup from "yup";
import {
  LocalizedValueType,
  PriceType,
  ProductType,
} from "core/models/Ecommerce/Catalog/ProductType";
import { submitUpdateProduct } from "api/CommerceHub/submitUpdateProduct";
import { submitCreateProduct } from "api/CommerceHub/submitCreateProduct";
import { createUpdateProductPayload } from "features/Ecommerce/usecases/Settings/CustomStore/EditProduct/createUpdateProductPayload";
import { denormalizeProduct } from "./denormalizeProduct";
import { useTranslation } from "react-i18next";
import LinkifyIt from "linkify-it";
import { useFormikDecorated } from "core/components/Form/useFormikDecorated";
import { CustomStoreType } from "core/models/Ecommerce/Catalog/CustomStoreType";
import { useFlashMessageChannel } from "component/BannerMessage/flashBannerMessage";

export interface ProductFormDescriptionType {
  type: "text";
  text: LocalizedValueType;
  image: null;
  youtube: null;
}
export interface ProductFormType {
  names: LocalizedValueType[];
  sku: string;
  url: string;
  descriptions: Array<ProductFormDescriptionType>;
  prices: PriceType[];
  uploadedImageUrl: string | null;
  uploadedImageBlobName: string | null;
  deleteImage: boolean;
}

export type ProductFormikType = ReturnType<typeof useProductForm>["form"];

export function useProductForm(props: {
  id: string | null;
  store: CustomStoreType | null;
  languages: string[];
  initValues?: ProductFormType;
  currencies: string[];
  productPrototype: ProductType | null;
  onUpdated: (result: ProductType) => void;
  onCreated: (newId: string) => void;
}) {
  const { t } = useTranslation();
  const flash = useFlashMessageChannel();

  const initValues: ProductFormType = {
    sku: "",
    url: "",
    uploadedImageUrl: null,
    uploadedImageBlobName: null,
    deleteImage: false,
    prices: props.currencies.map((code) => ({
      currency_iso_code: code,
      amount: 0,
    })),
    names: props.languages.map((lang) => ({
      language_iso_code: lang,
      value: "",
    })),
    descriptions: props.languages.map((lang) => ({
      text: { value: "", language_iso_code: lang },
      type: "text",
      image: null,
      youtube: null,
    })),
  };

  const form = useFormikDecorated<ProductFormType>({
    async onSubmit(values, helpers) {
      if (props.store === null) {
        throw "Boot is broken";
      }
      const dataNormalized = createUpdateProductPayload(
        values,
        props.store.id,
        props.id,
        props.productPrototype
      );

      try {
        if (props.id) {
          const result = await submitUpdateProduct(dataNormalized);
          helpers.setValues(
            denormalizeProduct(result.data.product, props.store)
          );
          props.onUpdated(result.data.product);
        } else {
          const result = await submitCreateProduct(dataNormalized);
          return props.onCreated(result.data.product.id);
        }
      } catch (e) {
        console.error(e, dataNormalized);
        flash(t("flash.settings.payment.error"));
      }
    },
    initialValues: { ...initValues },
    isInitialValid: true,
    enableReinitialize: false,
    validationSchema: yup.object({
      prices: yup
        .array(
          yup.object({
            amount: yup
              .number()
              .moreThan(0, t("settings.commerce.error.price.required")),
          })
        )
        .required(),
      names: yup.array(
        yup.object({
          value: yup.string().required(),
        })
      ),
      descriptions: yup.array(
        yup.object({
          text: yup.object({ value: yup.string().required() }),
        })
      ),
      url: yup
        .string()
        .ensure()
        .trim()
        .test("URL", t("form.error.string.url"), function (value) {
          if (value === undefined) {
            return true;
          }
          if (`${value}`.trim() === "") {
            return true;
          }
          const validator = new LinkifyIt();
          const valid = validator.test(value);
          return valid;
        }),
    }),
  });

  return {
    form,
  };
}
