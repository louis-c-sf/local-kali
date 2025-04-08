import moment from "moment";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory, useLocation } from "react-router";
import { POST_STRIPE_UPDATE_CARD } from "../../../api/apiPath";
import { postWithExceptions } from "../../../api/apiRequest";
import useStripeCheckout from "../../../api/User/useStripeCheckout";
import { useAppSelector } from "../../../AppRootContext";
import useRouteConfig from "../../../config/useRouteConfig";
import { useFlashMessageChannel } from "../../BannerMessage/flashBannerMessage";
import { Button } from "../../shared/Button/Button";
import { ExcludedAddOn } from "./SettingPlan/SettingPlan";
import styles from "./SettingPlanSubscription.module.css";

export default function SettingPaymentInformation() {
  const { t } = useTranslation();
  const location = useLocation<{ updatedPayment?: boolean }>();
  const history = useHistory();
  const periodEnd = useAppSelector(
    (s) => s.company?.billRecords.find(ExcludedAddOn)?.periodEnd
  );
  const { stripeCheckout } = useStripeCheckout();
  const { routeTo } = useRouteConfig();
  const [loading, setLoading] = useState(false);
  const flash = useFlashMessageChannel();
  useEffect(() => {
    if (location.state?.updatedPayment) {
      flash(t("flash.plan.updatePayment.success")).then(() =>
        history.push(routeTo("/settings/plansubscription"))
      );
    }
  }, [location.state?.updatedPayment]);

  async function onClick() {
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
      setLoading(false);
      console.error(`onClick error ${error}`);
    }
  }

  return (
    <div className={`${styles.paymentGrid} ${styles.bottomBorder}`}>
      <div className={styles.paymentHeader}>
        <span className={styles.title}>
          {t("settings.plan.payment.header")}
        </span>
        <div className={styles.description}>
          {t("settings.plan.payment.subHeader")}{" "}
          {moment(periodEnd).format("MMM D, YYYY")}
        </div>
      </div>
      <div className={styles.buttonContainer}>
        <Button primary customSize="mid" loading={loading} onClick={onClick}>
          {t("settings.plan.payment.paymentManagement")}
        </Button>
      </div>
    </div>
  );
}
