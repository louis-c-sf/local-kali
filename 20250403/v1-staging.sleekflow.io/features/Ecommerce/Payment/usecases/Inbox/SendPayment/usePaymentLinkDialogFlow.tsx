import { submitCreatePaymentLinks } from "api/StripePayment/submitCreatePaymentLinks";
import { useAppDispatch, useAppSelector } from "AppRootContext";
import { PaymentFormType } from "features/Ecommerce/Payment/usecases/Inbox/SendPayment/contracts/PaymentFormType";
import { FormikHelpers } from "formik";
import { isAjaxHttpError, isAxiosHttpError } from "api/apiRequest";
import { useTranslation } from "react-i18next";
import { useFlashMessageChannel } from "component/BannerMessage/flashBannerMessage";
import { useState } from "react";
import { PaymentLinkResponseType } from "core/models/Ecommerce/Payment/PaymentLinkResponseType";
import {
  PaymentLinkSetType,
  PaymentLinkType,
} from "core/models/Ecommerce/Payment/PaymentLinkType";
import { useSupportedRegions } from "core/models/Region/useSupportedRegions";
import { useSendPaymentLinkContext } from "features/Ecommerce/Payment/usecases/Inbox/SendPayment/contracts/SendPaymentLinkContext";
import { normalizePaymentLinkRequest } from "features/Ecommerce/Payment/usecases/Inbox/SendPayment/models/normalizePaymentLinkRequest";
import { normalizeToPaymentLink } from "features/Ecommerce/Payment/usecases/Inbox/SendPayment/models/normalizeToPaymentLink";
import { getTotal } from "features/Ecommerce/Payment/usecases/Inbox/SendPayment/models/getTotal";

const CURRENCY_MAP = {
  aed: 2.0,
  aud: 0.5,
  bgn: 1.0,
  brl: 0.5,
  cad: 0.5,
  chf: 0.5,
  czk: 15.0,
  dkk: 2.5,
  eur: 0.5,
  gbp: 0.3,
  hkd: 4.0,
  hrk: 0.5,
  huf: 175.0,
  inr: 0.5,
  jpy: 50,
  mxn: 10,
  myr: 2,
  nok: 3.0,
  nzd: 0.5,
  pln: 2.0,
  ron: 2.0,
  sek: 3.0,
  sgd: 0.5,
  thb: 10,
  usd: 0.5,
};

const MAX_UPLOAD_SIZE = 20_000_000;

export function usePaymentLinkDialogFlow(props: {
  linkMessageTemplate: string | undefined;
  onSubmitRequest?: (linkRequest: PaymentLinkSetType) => void;
}) {
  const loginDispatch = useAppDispatch();
  const { t } = useTranslation();
  const userId = useAppSelector((s) => s.profile.id);
  const flash = useFlashMessageChannel();
  const [result, setResult] = useState<{
    response: PaymentLinkResponseType;
    paymentLinks: PaymentLinkType[];
  }>();
  const { currenciesSupported } = useSupportedRegions();
  const sendPaymentContext = useSendPaymentLinkContext();

  function cancel() {
    loginDispatch({ type: "INBOX.PAYMENT_LINK.CANCEL" });
  }

  function stepBack() {
    setResult(undefined);
  }

  function complete() {
    if (result) {
      loginDispatch({
        type: "INBOX.PAYMENT_LINK.COMPLETE",
        link: result.response,
        lineItems: result.paymentLinks,
        messageTemplate:
          props.linkMessageTemplate ?? t("chat.paymentLink.sendTemplate"),
      });
    }
  }

  async function submitForm(
    values: PaymentFormType,
    formikHelpers: FormikHelpers<PaymentFormType>
  ) {
    const totalAmount = getTotal(values);
    const currencyMin =
      CURRENCY_MAP[values.overall.currency.toLowerCase()] ??
      Math.max(...Object.values(CURRENCY_MAP));
    if (totalAmount.lessThan(currencyMin)) {
      formikHelpers.setErrors({
        overall: {
          amount: t("chat.paymentLink.generate.form.amount.error.minStripe", {
            count: currencyMin,
          }),
        },
      });
      return;
    }

    let currencyHits = 0;
    for (let i = 0; i < values.payments.length; i++) {
      let pmt = values.payments[i];
      if (pmt.currency !== values.overall.currency) {
        currencyHits++;
        formikHelpers.setFieldError(
          `payments[${i}].currency`,
          t("chat.paymentLink.generate.form.amount.error.commonCurrency")
        );
      }
    }
    if (currencyHits > 0) {
      return;
    }
    const totalUploadSize = values.payments.reduce(
      (acc, next) => acc + (next.imageFile?.size ?? 0),
      0
    );

    if (totalUploadSize > MAX_UPLOAD_SIZE) {
      formikHelpers.setErrors({
        overall: {
          amount: t(
            "chat.paymentLink.generate.form.amount.error.maxUploadSize",
            {
              size: MAX_UPLOAD_SIZE / 1_000_000,
            }
          ),
        },
      });
      return;
    }

    try {
      const regionMatch = currenciesSupported.find(
        (c) =>
          c.currencyCode.toUpperCase() === values.overall.currency.toUpperCase()
      );
      const discountRate = values.discount.rate ?? 0;
      const itemsNormalized = await Promise.all(
        values.payments.map((p) =>
          normalizePaymentLinkRequest(
            p,
            discountRate,
            sendPaymentContext.supportImageUpload
              ? p.imageFile ?? undefined
              : undefined
          )
        )
      );
      const submitCreatePaymentLinkRequest = {
        userprofileId: userId,
        expiredAt: values.expiredAt.toISOString(),
        lineItems: itemsNormalized,
      };
      const result = await submitCreatePaymentLinks(
        {
          userprofileId: userId,
          expiredAt: values.expiredAt.toISOString(),
          lineItems: itemsNormalized,
        },
        regionMatch?.countryCode
      );
      if (props.onSubmitRequest) {
        props.onSubmitRequest(
          regionMatch?.countryCode
            ? {
                ...submitCreatePaymentLinkRequest,
                platformCountry: regionMatch.countryCode,
              }
            : submitCreatePaymentLinkRequest
        );
      }

      setResult({
        response: result,
        paymentLinks: values.payments.map(normalizeToPaymentLink),
      });
    } catch (e) {
      if (isAjaxHttpError(e) || isAxiosHttpError(e)) {
        console.error(e);
        formikHelpers.setErrors({});
        const errorCode = isAjaxHttpError(e)
          ? e.xhr.status
          : e.response?.status;
        if (errorCode === 400) {
          flash(t("system.error.http.400"));
        } else {
          flash(t("system.error.http.500"));
        }
      } else {
        formikHelpers.setErrors(e);
      }
    }
  }

  return {
    submitForm,
    stepBack,
    cancel,
    complete,
    linkGenerated: result?.response,
  };
}
