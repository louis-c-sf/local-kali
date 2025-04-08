import { useTranslation } from "react-i18next";
import { useFlashMessageChannel } from "../../../BannerMessage/flashBannerMessage";
import React, { useState } from "react";
import styles from "./SupportPlans.module.css";
import { Button } from "../../../shared/Button/Button";
import TickIcon from "../../../../assets/tsx/icons/TickIcon";
import { onClickRedirectToStripe } from "../SettingPlanUtils";
import ConsultUsButton from "../ConsultUsButton";

export const SupportPurchaseButton = ({
  added,
  consultUs,
  planId,
  stripePublicKey,
}: {
  planId: string | undefined;
  stripePublicKey: string | undefined;
  added?: boolean;
  consultUs?: string;
}) => {
  const { t } = useTranslation();
  const flash = useFlashMessageChannel();
  const [buttonLoading, setButtonLoading] = useState(false);

  if (added) {
    return (
      <div className={styles.addedLabelWrapper}>
        <TickIcon className={styles.addedTick} />
        <span className={styles.addedLabel}>
          {t("settings.plan.supportPlans.button.purchased")}
        </span>
      </div>
    );
  }

  if (consultUs) {
    return <ConsultUsButton consultUsMessage={consultUs} />;
  }

  return (
    <Button
      className={styles.addOnButton}
      disabled={buttonLoading}
      loading={buttonLoading}
      onClick={() =>
        onClickRedirectToStripe({
          setLoading: setButtonLoading,
          flash,
          planId,
          stripePublicKey,
          t,
        })
      }
      primary
    >
      {t("settings.plan.supportPlans.button.purchase")}
    </Button>
  );
};
