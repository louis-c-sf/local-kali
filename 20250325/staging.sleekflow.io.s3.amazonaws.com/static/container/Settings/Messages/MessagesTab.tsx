import { Button } from "component/shared/Button/Button";
import produce from "immer";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "./MessagesTab.module.css";
import { Dimmer, Loader } from "semantic-ui-react";
import {
  fetchStripeMessageTemplate,
  MessageTypeEnum,
  StripeMessageTemplateType,
} from "api/Stripe/fetchStripeMessageTemplate";
import { useFlashMessageChannel } from "component/BannerMessage/flashBannerMessage";
import { submitMessageTemplate } from "api/Stripe/submitMessageTemplate";
import { usePaymentSettingsContext } from "features/Ecommerce/Payment/usecases/Settings/contracts/PaymentSettingsContext";
import {
  MessageBox,
  PAYMENT_URL,
} from "container/Settings/Messages/MessageBox";

const getDefaultMessageValue = (
  messageType: string
): StripeMessageTemplateType => {
  return {
    messageType: MessageTypeEnum[messageType],
    messageBody: "",
    createdAt: "",
    updatedAt: "",
    params: [],
  };
};

export default function MessagesTab() {
  const [message, setMessage] = useState<StripeMessageTemplateType>(
    getDefaultMessageValue("payment")
  );
  const [saveLoading, setSaveLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<StripeMessageTemplateType[]>();
  const { t } = useTranslation();
  const flash = useFlashMessageChannel();
  const settings = usePaymentSettingsContext();

  const messageMapping = {
    payment: {
      title: t("settings.paymentLink.message.payment.title"),
      subTitle: t("settings.paymentLink.message.payment.subTitle"),
      placeholder: t("settings.paymentLink.message.payment.placeholder"),
    },
    product: {
      title: t("settings.paymentLink.message.product.title"),
      subTitle: t("settings.paymentLink.message.product.subTitle"),
      placeholder: t("settings.paymentLink.message.product.placeholder"),
    },
  };

  useEffect(() => {
    setLoading(true);
    fetchStripeMessageTemplate(settings.country.countryCode)
      .then((res) => {
        setData(res);
      })
      .catch((e) => {
        console.error(e);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [settings.country.countryCode]);

  useEffect(() => {
    if (!data) {
      return;
    }
    const payment = data.find((m) => m.messageType === MessageTypeEnum.payment);
    if (payment) {
      setMessage({
        ...payment,
        messageBody: payment.messageBody.replace(PAYMENT_URL, `{0}`),
      });
    }
  }, [data]);

  async function saveChange() {
    try {
      setSaveLoading(true);
      await submitMessageTemplate([message]);
      flash(t("flash.settings.payment.success"));
    } catch (e) {
      console.error(`POST_STRIPE_PRODUCT_MESSAGE_TEMPLATE error${e}`);
      flash(t("flash.settings.payment.error"));
    } finally {
      setSaveLoading(false);
    }
  }

  function setParams(param: string) {
    setMessage(
      produce(message, (draft) => {
        draft.params = param ? [param] : [];
        if (param) {
          draft.messageBody += `{0}`;
        } else {
          draft.messageBody = draft.messageBody.replace(`{0}`, "");
        }
      })
    );
  }

  return (
    <div className={styles.container}>
      <Dimmer.Dimmable>
        <Dimmer active={loading} inverted>
          <Loader inverted />
        </Dimmer>
        <MessageBox
          paymentType="PaymentMessage"
          setMessage={(type, messageNew) => {
            setMessage((message) => ({
              ...message,
              messageBody: messageNew,
            }));
          }}
          content={message}
          setParams={setParams}
          message={messageMapping["payment"]}
        />
      </Dimmer.Dimmable>
      <Button
        primary
        className={styles.saveButton}
        onClick={saveChange}
        loading={saveLoading}
        disabled={saveLoading}
        content={t("form.button.save")}
      />
    </div>
  );
}
