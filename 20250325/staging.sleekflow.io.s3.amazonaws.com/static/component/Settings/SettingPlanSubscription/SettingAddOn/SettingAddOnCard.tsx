import { Trans, useTranslation } from "react-i18next";
import React, { useState } from "react";
import { Card } from "semantic-ui-react";
import styles from "./SettingAddOnCard.module.css";
import { Button } from "../../../shared/Button/Button";
import TickIcon from "../../../../assets/tsx/icons/TickIcon";
import { useFlashMessageChannel } from "../../../BannerMessage/flashBannerMessage";
import { InfoTooltip } from "../../../shared/popup/InfoTooltip";
import { onClickRedirectToStripe } from "../SettingPlanUtils";
import { Link } from "react-router-dom";
import ConsultUsButton from "../ConsultUsButton";
import BadgeTag from "component/shared/BadgeTag/BadgeTag";
import {
  FreeTrialHubDict,
  FreeTrialStatus,
} from "features/FreeTrial/modules/types";
import moment from "moment";
import { useCurrentUtcOffset } from "component/Chat/hooks/useCurrentUtcOffset";

const SettingAddOnButton = ({
  allowEdit,
  href,
  added,
  consultUs,
  planId,
  stripePublicKey,
  isAdditionalContactsSubscribed,
  isNotUsedFreeTrial,
  hasFreeTrialMode,
  isUnlimitedContactsSubscribed,
}: {
  allowEdit: boolean | undefined;
  href?: string;
  isAdditionalContactsSubscribed: boolean | undefined;
  isUnlimitedContactsSubscribed: boolean | undefined;
  planId: string | undefined;
  stripePublicKey: string | undefined;
  added?: boolean;
  consultUs?: string;
  hasFreeTrialMode: boolean;
  isNotUsedFreeTrial: boolean;
}) => {
  const { t } = useTranslation();
  const flash = useFlashMessageChannel();
  const [buttonLoading, setButtonLoading] = useState(false);
  const isadditionalContactsButtonDisabled =
    (planId?.includes("additional_2000_contact") ||
      planId?.includes("additional_5000_contact")) &&
    isUnlimitedContactsSubscribed;

  const isUnlimitedContactsButtonDisabled =
    planId?.includes("unlimited_contact") && isAdditionalContactsSubscribed;
  const isAddButtonDisabled =
    buttonLoading ||
    isadditionalContactsButtonDisabled ||
    isUnlimitedContactsButtonDisabled;

  const contactSupport =
    isadditionalContactsButtonDisabled || isUnlimitedContactsButtonDisabled;

  if (added && !allowEdit) {
    return null;
  }

  if (hasFreeTrialMode ? false : consultUs) {
    return <ConsultUsButton consultUsMessage={consultUs} />;
  }

  if (contactSupport) {
    return (
      <InfoTooltip
        placement={"left"}
        trigger={
          <div>
            <Button
              className={styles.addOnButtonDisabled}
              disabled={isAddButtonDisabled}
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
              {t("settings.plan.addOn.button.add")}
            </Button>
          </div>
        }
      >
        {t("settings.plan.addOn.button.contactSupport")}
      </InfoTooltip>
    );
  }

  if (href) {
    return (
      // <Link
      //   to={{
      //     pathname: href,
      //     state: { back: "/settings/plansubscription" },
      //   }}
      // >
      <Link to={href}>
        <Button disabled={isAddButtonDisabled} loading={buttonLoading} primary>
          {isNotUsedFreeTrial
            ? t("settings.plan.addOn.freeTrial.button.try")
            : t("settings.plan.addOn.button.add")}
        </Button>
      </Link>
    );
  }

  const freeTrialRequestParam = isNotUsedFreeTrial
    ? {
        isFreeTrial: true,
        data: {
          info: "freeTrial",
          freeTrialType: planId?.includes("additionalStaffLogin")
            ? FreeTrialHubDict.additionalStaff
            : planId?.includes(FreeTrialHubDict.hubspot)
            ? FreeTrialHubDict.hubspot
            : FreeTrialHubDict.salesforce,
        },
      }
    : {};

  return (
    <Button
      disabled={isAddButtonDisabled}
      loading={buttonLoading}
      onClick={() =>
        onClickRedirectToStripe({
          setLoading: setButtonLoading,
          flash,
          planId,
          stripePublicKey,
          t,
          ...freeTrialRequestParam,
        })
      }
      primary
    >
      {t("settings.plan.addOn.button.add")}
    </Button>
  );
};

const SettingAddOnCard = ({
  isPaidPlanSubscribed,
  addOnTitle,
  price,
  currentQuotaLabel,
  description,
  consultUs,
  stripePublicKey,
  planId,
  addOnLink,
  allowEdit,
  id,
  hasFreeTrialMode = false,
  freeTrialStatus,
  periodEnd,
  isUnlimitedContactsSubscribed,
  isAdditionalContactsSubscribed,
}: {
  allowEdit?: boolean;
  stripePublicKey: string | undefined;
  planId: string | undefined;
  isPaidPlanSubscribed: boolean | undefined;
  description: string | undefined;
  addOnTitle: string;
  price: string | number | React.ReactNode | undefined;
  currentQuotaLabel?: string | undefined;
  isMaskedContact?: boolean;
  consultUs?: string;
  addOnLink?: string;
  id: string;
  hasFreeTrialMode?: boolean;
  freeTrialStatus?: string;
  periodEnd?: string;
  isAdditionalContactsSubscribed?: boolean | undefined;
  isUnlimitedContactsSubscribed?: boolean;
}) => {
  const { t } = useTranslation();
  const freeTrialMonth = id === "additionalStaffLogin" ? 3 : 1;
  const utcOffset = useCurrentUtcOffset();
  const formatPeriodEnd = moment(periodEnd)
    .utcOffset(utcOffset)
    .format("DD MMM YYYY");
  const isAdditionalStaff = id === "additionalStaffLogin";
  const isNotUsedFreeTrial =
    hasFreeTrialMode && freeTrialStatus === FreeTrialStatus.notUsed;
  const isDuringFreeTrial =
    hasFreeTrialMode && freeTrialStatus === FreeTrialStatus.during;

  return (
    <Card className={styles.addOnCardWrapper}>
      <Card.Content>
        <div className={styles.addOnCardPriceTitle}>
          <div>
            <div className={styles.cardHeader}>
              <div className={styles.addOnCardTitleLabel}>{addOnTitle}</div>
              {isNotUsedFreeTrial &&
                (["hubspotIntegration", "salesforceCRMIntegration"].includes(id)
                  ? !isPaidPlanSubscribed
                  : true) && (
                  <BadgeTag
                    text={
                      <Trans
                        i18nKey="settings.plan.addOn.freeTrial.tag"
                        values={{ number: freeTrialMonth }}
                      >
                        {freeTrialMonth}-month free trial
                      </Trans>
                    }
                    noMargins
                    compact
                    className={styles.freeTrialTag}
                  />
                )}
            </div>
            <div className={styles.addOnCardDescriptionLabel}>
              {description}
            </div>
            {(isPaidPlanSubscribed || isDuringFreeTrial) && (
              <div className={styles.addedLabelWrapper}>
                <TickIcon className={styles.addedTick} />{" "}
                <span className={styles.addedLabel}>
                  {isDuringFreeTrial
                    ? t("settings.plan.addOn.freeTrial.freeTrialLabel")
                    : t("settings.plan.addOn.button.added")}
                </span>
                {currentQuotaLabel}
                {isDuringFreeTrial && (
                  <div
                    className={
                      isAdditionalStaff
                        ? styles.periodEnd
                        : styles.periodEndNoPadding
                    }
                  >
                    <Trans
                      i18nKey="settings.plan.addOn.freeTrial.periodEnd"
                      values={{
                        periodEnd: formatPeriodEnd,
                      }}
                    >
                      until <span>{formatPeriodEnd}</span>
                    </Trans>
                  </div>
                )}
              </div>
            )}
          </div>
          <div
            className={`${styles.addOnCardRightSection} ${
              consultUs ? styles.consultUsRightSection : ""
            }`}
          >
            {(!consultUs || hasFreeTrialMode) && (
              <div className={styles.addOnCardPrice}>{price}</div>
            )}
            <SettingAddOnButton
              isAdditionalContactsSubscribed={isAdditionalContactsSubscribed}
              isUnlimitedContactsSubscribed={isUnlimitedContactsSubscribed}
              allowEdit={allowEdit}
              href={addOnLink}
              planId={planId}
              stripePublicKey={stripePublicKey}
              consultUs={consultUs}
              added={
                isPaidPlanSubscribed ||
                freeTrialStatus === FreeTrialStatus.during
              }
              isNotUsedFreeTrial={isNotUsedFreeTrial}
              hasFreeTrialMode={hasFreeTrialMode}
            />
          </div>
        </div>
      </Card.Content>
    </Card>
  );
};

export default SettingAddOnCard;
