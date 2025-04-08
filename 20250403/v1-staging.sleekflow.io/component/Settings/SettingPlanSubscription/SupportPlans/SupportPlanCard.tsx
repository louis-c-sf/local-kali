import React from "react";
import { Card } from "semantic-ui-react";
import styles from "./SupportPlans.module.css";
import TickIcon from "../../../../assets/tsx/icons/TickIcon";
import { Trans, useTranslation } from "react-i18next";
import { SupportPurchaseButton } from "./SupportPurchaseButton";

const SupportPlanCard = ({
  isPlanSubscribed,
  supportTitle,
  price,
  selectedCurrency,
  consultUs,
  stripePublicKey,
  planId,
  listItems,
  yearlyOnly,
}: {
  yearlyOnly: boolean;
  listItems: Record<any, any>;
  stripePublicKey: string | undefined;
  planId?: string | undefined;
  isPlanSubscribed?: boolean | undefined;
  supportTitle: string;
  price?: string;
  isMaskedContact?: boolean;
  selectedCurrency?: string;
  consultUs?: string;
}) => {
  const { t } = useTranslation();
  return (
    <Card className={styles.supportCardWrapper}>
      <Card.Content>
        <div className={styles.supportCardPriceTitle}>
          <div>
            <div className={styles.supportTitleLabel}>{supportTitle}</div>
            <div className={styles.supportCardDescriptionLabel}>
              {Object.values(listItems).map((l) => {
                if (typeof l === "object") {
                  return (
                    <div key={l.title}>
                      <div className={styles.listItemTitle}>{l.title}</div>
                      {Object.values(l.listItems).map((subListItem) => {
                        return (
                          <div
                            key={subListItem as string}
                            className={styles.listItemWrapper}
                          >
                            <TickIcon className={styles.tickIcon} />
                            {subListItem}
                          </div>
                        );
                      })}
                    </div>
                  );
                }
                return (
                  <div key={l} className={styles.listItemWrapper}>
                    <TickIcon className={styles.tickIcon} />
                    {l}
                  </div>
                );
              })}
            </div>
          </div>
          <div className={styles.supportCardRightSection}>
            {!consultUs && (
              <div className={styles.supportCardPrice}>
                {
                  <Trans
                    values={{ currency: selectedCurrency, price: price }}
                    i18nKey={"settings.plan.priceLabel"}
                  >
                    Free
                    <span className={styles.pricePeriodLabel}>Lifetime</span>
                  </Trans>
                }
              </div>
            )}

            <SupportPurchaseButton
              planId={planId}
              stripePublicKey={stripePublicKey}
              consultUs={consultUs}
              added={isPlanSubscribed}
            />

            {yearlyOnly && (
              <div className={styles.billedYearly}>
                {t("settings.plan.supportPlans.billedYearly")}
              </div>
            )}
          </div>
        </div>
      </Card.Content>
    </Card>
  );
};

export default SupportPlanCard;
