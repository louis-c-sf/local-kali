import React, { useEffect, useState } from "react";
import { Modal } from "semantic-ui-react";
import { GenerateLinkForm } from "./GenerateLinkForm";
import { CloseIcon } from "component/shared/modal/CloseIcon";
import styles from "./PaymentLinkDialog.module.css";
import { SuccessScreen } from "./SuccessScreen";
import { useTranslation } from "react-i18next";
import { fetchMessageTemplate } from "api/Chat/Shopify/fetchMessageTemplate";
import { PAYMENT_LINK_TOKEN } from "App/reducers/Chat/paymentLinkReducer";
import { retryPromise } from "lib/rxjs/retryPromise";
import {
  PaymentLinkSetType,
  PaymentLinkType,
} from "core/models/Ecommerce/Payment/PaymentLinkType";
import { usePaymentLinkDialogFlow } from "features/Ecommerce/Payment/usecases/Inbox/SendPayment/usePaymentLinkDialogFlow";
import { usePaymentLinkDialogForm } from "features/Ecommerce/Payment/usecases/Inbox/SendPayment/usePaymentLinkDialogForm";
import { fetchSleekPayStatus } from "api/StripePayment/fetchSleekPayStatus";
import moment from "moment";
import { useSupportedRegions } from "core/models/Region/useSupportedRegions";
import { PaymentLinkFormItemType } from "features/Ecommerce/Payment/usecases/Inbox/SendPayment/contracts/PaymentFormType";
import uuid from "uuid";
import Decimal from "decimal.js-light";
import { getTotal } from "features/Ecommerce/Payment/usecases/Inbox/SendPayment/models/getTotal";

export function createEmptyItem(currency: string): PaymentLinkFormItemType {
  return {
    name: "",
    description: "",
    amount: "0",
    quantity: 1,
    currency: currency,
    imageFile: null,
    imageUrl: null,
    key: uuid(),
  };
}

export function PaymentLinkDialog(props: {
  onSubmit?: (link: PaymentLinkSetType) => void;
  onClose?: () => void;
}) {
  const { t } = useTranslation();
  const [linkMessageTemplate, setLinkMessageTemplate] = useState<string>();

  const regions = useSupportedRegions({ forceBoot: true });

  const flow = usePaymentLinkDialogFlow({
    linkMessageTemplate,
    onSubmitRequest: props.onSubmit,
  });

  const form = usePaymentLinkDialogForm({
    submitForm: flow.submitForm,
  });

  useEffect(() => {
    const fetchTemplate$ = retryPromise(fetchMessageTemplate(), 5, 500);

    const subscribed = fetchTemplate$.subscribe({
      next: ([template]) => {
        setLinkMessageTemplate(
          template.messageBody.replace("{0}", PAYMENT_LINK_TOKEN)
        );
      },
      error: () => {
        setLinkMessageTemplate(t("chat.paymentLink.sendTemplate"));
      },
    });

    return () => {
      subscribed.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const regionMatch = regions.currenciesSupported.find(
      (c) => c.currencyCode.toUpperCase() === form.form.values.overall.currency
    );
    if (!regionMatch) {
      return;
    }
    fetchSleekPayStatus(regionMatch.countryCode)
      .then((res) => {
        if (res.paymentLinkExpirationOption.expireNumberOfDaysAfter) {
          form.form.setFieldValue(
            "expiredAt",
            moment().add(
              res.paymentLinkExpirationOption.expireNumberOfDaysAfter,
              "day"
            ),
            false
          );
        }
      })
      .catch((e) => {
        console.error(`fetchSleekPayStatus ${e}`);
      });
  }, [form.form.values.overall.currency]);

  async function performGenerate() {
    try {
      await form.form.submitForm();
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    if (flow.linkGenerated && props.onSubmit && props.onClose) {
      props.onClose();
    }
  }, [flow.linkGenerated]);

  return (
    <Modal
      className={styles.modal}
      open
      closeIcon={<CloseIcon />}
      closeOnDimmerClick={false}
      closeOnDocumentClick={false}
      onClose={() => {
        flow.cancel();
        props.onClose && props.onClose();
      }}
    >
      <Modal.Content className={styles.content}>
        {!flow.linkGenerated ? (
          <GenerateLinkForm
            form={form.form}
            canSubmit={form.canSubmit}
            onSubmit={performGenerate}
            loading={form.form.isSubmitting}
          />
        ) : (
          <SuccessScreen
            amount={getTotal(form.form.values)}
            link={flow.linkGenerated}
            goBack={flow.stepBack}
            send={flow.complete}
            disabled={linkMessageTemplate === undefined}
            currency={form.form.values.overall.currency}
          />
        )}
      </Modal.Content>
    </Modal>
  );
}
