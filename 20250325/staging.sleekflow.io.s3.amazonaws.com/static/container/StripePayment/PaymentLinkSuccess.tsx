import React, { useEffect, useState } from "react";
import { Image } from "semantic-ui-react";
import styles from "./PaymentLinkSuccess.module.css";
import paymentStyles from "./StripePayment.module.css";
import SuccessImg from "./assets/success.svg";
import fetchPaymentResult from "../../api/Chat/fetchPaymentResult";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Footer from "./Footer";
import { formatCurrency } from "utility/string";
import { PaymentLinkResultType } from "core/models/Ecommerce/Payment/PaymentLinkType";
import Helmet from "react-helmet";

function PaymentLinkSuccess() {
  const location = useLocation();
  const param = new URLSearchParams(location.search);
  const { t } = useTranslation();
  const [paymentResult, setPaymentResult] = useState<
    PaymentLinkResultType | undefined
  >();

  useEffect(() => {
    async function getResult() {
      const key = param.get("key");
      if (key) {
        try {
          const result = await fetchPaymentResult(key);
          setPaymentResult(result);
        } catch (error) {
          console.error("fetchPaymentResult", error);
        }
      }
    }

    getResult();
  }, []);

  const totalAmount = paymentResult ? paymentResult.payAmount : 0;
  const pageTitle = t("chat.paymentResult.success.title");
  return (
    <div className={paymentStyles.contentWrapper}>
      <Helmet defaultTitle={t("nav.common.title", { page: pageTitle })} />
      <div className={paymentStyles.content}>
        <Image src={SuccessImg} />
        <div className={styles.title}>
          {t("chat.paymentResult.success.title")}
        </div>
        <p className={styles.desc}>
          {t("chat.paymentResult.success.description", {
            companyName: paymentResult?.companyName,
          })}
        </p>
        {paymentResult ? (
          <div className={styles.paymentDetail}>
            <div className={styles.companyName}>
              {paymentResult.companyName}
            </div>
            <div className={styles.price}>
              {formatCurrency(totalAmount, paymentResult.currency)}
            </div>
          </div>
        ) : null}
        <Footer className={styles.footer} />
      </div>
    </div>
  );
}

export default PaymentLinkSuccess;
