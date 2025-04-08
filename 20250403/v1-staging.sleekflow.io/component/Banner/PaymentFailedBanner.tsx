import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Portal } from "semantic-ui-react";
import { CloseButton } from "./ChannelConnectionBanner";
import { equals, pick } from "ramda";
import { useAppSelector } from "../../AppRootContext";
import useStripeCheckout from "../../api/User/useStripeCheckout";
import { POST_STRIPE_UPDATE_CARD } from "../../api/apiPath";
import { postWithExceptions } from "../../api/apiRequest";
import {
  BannerOrderAndClassNameList,
  getIsCurrentBannerShow,
} from "./helper/getIsCurrentBannerShow";
import { BannerEnum } from "./types/BannerEnum";
import styles from "./PaymentFailedBanner.module.css";

export default function PaymentFailedBanner() {
  const { t } = useTranslation();
  const { stripeCheckout } = useStripeCheckout();
  const { company } = useAppSelector(pick(["company"]), equals);
  const isPaymentFailed = useAppSelector((s) => s.company?.isPaymentFailed);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = document.body;
  const currentBanner = BannerEnum.paymentFailed;
  const isOpen = isPaymentFailed && getIsCurrentBannerShow(ref, currentBanner);

  useEffect(() => {
    setVisible(isOpen ?? false);
  }, [isOpen]);

  const action = (
    <div className="action">
      <Button
        loading={loading}
        onClick={handleManageClick}
        className="ui button"
      >
        {t("account.paymentFailedBanner.button.manage")}
      </Button>
    </div>
  );
  const text = t("account.paymentFailedBanner.content");

  const closeButtonClick = () => {
    setVisible(false);
    delete ref.dataset[BannerOrderAndClassNameList.paymentFailedBanner];
  };

  async function handleManageClick() {
    try {
      if (stripeCheckout) {
        setLoading(true);
        const result = await postWithExceptions(POST_STRIPE_UPDATE_CARD, {
          param: {},
        });
        const stripe = window.Stripe(stripeCheckout.publicKey);
        if (stripe) {
          stripe.redirectToCheckout({
            sessionId: result.id,
          });
        }
      }
    } catch (error) {
      console.error(`onClick error ${error}`);
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen || !company || !isPaymentFailed) {
    return null;
  }
  if (isOpen && visible) {
    ref.dataset[BannerOrderAndClassNameList.paymentFailedBanner] = "true";
  }

  return (
    <Portal open={isOpen && visible} mountNode={ref}>
      <div className={`top-display-banner ${styles.banner}`}>
        <div className="content">
          {text}
          {action}
        </div>
        <CloseButton onClick={closeButtonClick} />
      </div>
    </Portal>
  );
}
