import React from "react";
import { Image } from "semantic-ui-react";
import styles from "./PaymentLinkCancel.module.css";
import paymentStyles from "./StripePayment.module.css";
import cancelBanner from "./assets/cancelBanner.svg";
import { useTranslation } from "react-i18next";
import Footer from "./Footer";

function PaymentLinkCancel() {
  const { t } = useTranslation();

  return (
    <div className={paymentStyles.contentWrapper}>
      <div className={paymentStyles.content}>
        <Image src={cancelBanner} />
        <div className={styles.title}>
          {t("chat.paymentResult.cancel.title")}
        </div>
        <p className={styles.desc}>
          {t("chat.paymentResult.cancel.description")}
        </p>
        <Footer className={styles.footer} />
      </div>
    </div>
  );
}

export default PaymentLinkCancel;
