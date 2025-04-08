import React from "react";
import styles from "./SuccessScreen.module.css";
import SuccessImg from "./assets/success-circle.svg";
import { useTranslation } from "react-i18next";
import { CopyField } from "component/Channel/CopyField";
import { Button } from "component/shared/Button/Button";
import { Icon } from "component/shared/Icon/Icon";
import { PaymentLinkResponseType } from "core/models/Ecommerce/Payment/PaymentLinkResponseType";
import { money } from "utility/math/money";
import Decimal from "decimal.js-light";
import { formatNumber } from "utility/string";

export function SuccessScreen(props: {
  link: PaymentLinkResponseType;
  amount: Decimal;
  goBack: () => void;
  send: () => void;
  disabled: boolean;
  currency: string;
}) {
  const { amount, goBack, link, send, disabled } = props;
  const { t } = useTranslation();
  return (
    <div className={styles.root}>
      <div className={styles.nav}>
        <div onClick={goBack} className={styles.back}>
          <div className={styles.icon}>
            <Icon type={"arrowLeft"} />
          </div>
          {t("nav.backShort")}
        </div>
      </div>
      <div className={styles.body}>
        <div className={styles.pic}>
          <img src={SuccessImg} />
        </div>
        <div className={styles.head}>
          {t("chat.paymentLink.generate.success.head")}
        </div>
        <div className={styles.total}>
          {t("chat.paymentLink.generate.success.total", {
            //@ts-ignore
            count: formatNumber(amount.toNumber(), {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
              useGrouping: true,
            }) as number,
            currency: props.currency.toUpperCase(),
          })}
        </div>
        <div className={styles.link}>
          <div className={styles.field}>
            <CopyField text={link.trackingUrl} label={""} long={true} />
          </div>
          <div className={styles.actions}>
            <Button
              content={t("chat.paymentLink.generate.success.actions.send")}
              primary
              fluid
              centerText
              onClick={!disabled ? send : undefined}
              disabled={disabled}
            />
            <div className={styles.preview}>
              <a
                href={link.url}
                className={styles.previewLink}
                target={"_blank"}
                rel={"noopener noreferrer"}
              >
                <span className={styles.icon}>
                  <Icon type={"eye"} />
                </span>
                <span className={styles.text}>
                  {t("chat.paymentLink.generate.success.actions.preview")}
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
