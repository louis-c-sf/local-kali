import { useFormik, FormikHelpers } from "formik";
import moment from "moment/moment";
import { object, array, number, string } from "yup";
import { createEmptyItem } from "features/Ecommerce/Payment/usecases/Inbox/SendPayment/PaymentLinkDialog";
import { useSupportedRegions } from "core/models/Region/useSupportedRegions";
import {
  PaymentFormType,
  PaymentLinkFormItemType,
} from "features/Ecommerce/Payment/usecases/Inbox/SendPayment/contracts/PaymentFormType";
import { useAppSelector } from "AppRootContext";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";

export function usePaymentLinkDialogForm(props: {
  submitForm: (
    values: PaymentFormType,
    formikHelpers: FormikHelpers<PaymentFormType>
  ) => void;
}) {
  const { currenciesSupported, booted } = useSupportedRegions();
  const { t } = useTranslation();
  const initCurrency =
    currenciesSupported[0]?.currencyCode.toUpperCase() ?? "HKD";

  const mode = useAppSelector(
    (s) => s.inbox.messenger.paymentLink.sendDialog.mode
  );
  const initCart = useAppSelector((s) => {
    const mode = s.inbox.messenger.paymentLink.sendDialog.mode;
    if (mode === "custom") {
      return;
    }
    if (mode === "userCart") {
      const cartMessage = s.inbox.messenger.paymentLink.sendDialog.cartMessage;
      const payload =
        cartMessage?.extendedMessagePayload?.extendedMessagePayloadDetail;
      return payload?.whatsappCloudApiOrderObject.product_items?.map<PaymentLinkFormItemType>(
        (item) => {
          const currency = item.currency.toUpperCase();
          return {
            key: item.product_retailer_id,
            quantity: item.quantity,
            amount: currency === initCurrency ? item.item_price : 0,
            currency: currency,
            description: item.name,
            name: item.name,
            imageUrl: item.image_url ?? null,
            imageFile: null,
            metadata: null,
          };
        }
      );
    }
  });

  const form = useFormik<PaymentFormType>({
    initialValues: {
      payments: initCart ?? [createEmptyItem(initCurrency)],
      overall: {
        amount: 0, //whatever, not changes, only for errors output
        currency: initCurrency,
      },
      expiredAt: moment(),
      discount: { rate: null },
    },
    isInitialValid: false,
    validateOnChange: true,
    validationSchema: object({
      overall: object({
        currency: string().required(
          t("chat.paymentLink.generate.form.amount.error.commonCurrency")
        ),
      }),
      payments: array(
        object({
          amount: number().required().min(0.01),
          quantity: number().required().min(0.01),
          name: string().ensure().required(),
        })
      ).min(1),
    }),
    onSubmit: props.submitForm,
  });
  useEffect(() => {
    if (booted) {
      form.setFieldValue("overall", {
        amount: 0, //whatever, not changes, only for errors output
        currency: initCurrency,
      });
    }
  }, [booted, initCurrency]);
  const canSubmit = form.isValid && form.values.payments.length > 0;

  return {
    form,
    canSubmit,
    mode,
  };
}
