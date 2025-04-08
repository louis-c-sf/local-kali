import { useFormikDecorated } from "core/components/Form/useFormikDecorated";
import * as yup from "yup";
import { useTranslation } from "react-i18next";
import { StripeMessageTemplateType } from "api/Stripe/fetchStripeMessageTemplate";
import { submitMessageTemplate } from "api/Stripe/submitMessageTemplate";
import { updateShopifyStatus } from "api/Stripe/updateShopifyStatus";
import {
  PaymentLinkSettingType,
  ShopifyStoreResponseType,
} from "features/Ecommerce/Payment/usecases/Settings/Catalog/types";
import { useFlashMessageChannel } from "component/BannerMessage/flashBannerMessage";

export interface ShopifyStoreFormType {
  name: string;
  active: boolean;
  sharingMessageTemplate: string | null;
  paymentLinkSetting?: PaymentLinkSettingType;
}

export function useEditShopifyStoreForm(props: {
  initialValues: null | {
    form: ShopifyStoreFormType;
    prototypeTemplate: StripeMessageTemplateType | null;
    prototypeStore: ShopifyStoreResponseType;
  };
}) {
  const { t } = useTranslation();
  const flash = useFlashMessageChannel();
  let { initialValues } = props;

  async function submit(values: ShopifyStoreFormType) {
    if (!initialValues) {
      return;
    }

    const id = Number(initialValues.prototypeStore.id) || 0;
    if (id === 0) {
      return;
    }
    const jobs = [
      updateShopifyStatus(
        id,
        values.name,
        values.active,
        values.paymentLinkSetting
      ),
    ];

    if (
      values.sharingMessageTemplate !== null &&
      initialValues.prototypeTemplate !== null
    ) {
      jobs.push(
        submitMessageTemplate([
          {
            ...initialValues.prototypeTemplate,
            messageBody: values.sharingMessageTemplate,
          },
        ])
      );
    }
    await Promise.all(jobs).catch(() => {
      flash(t("flash.settings.payment.error"));
    });
    flash(t("settings.commerce.flash.settingsSaved"));
  }

  return useFormikDecorated<ShopifyStoreFormType>({
    initialValues: initialValues?.form ?? {
      active: false,
      name: "",
      sharingMessageTemplate: "",
    },
    enableReinitialize: true,
    onSubmit: submit,
    validationSchema: yup.object({
      sharingMessageTemplate: yup.string().trim().nullable(true),
      name: yup
        .string()
        .required(t("settings.commerce.createStore.field.any.error.required"))
        .trim()
        .max(128),
    }),
  });
}
