import React, { useState } from "react";
import moment from "moment";
import CancelSubscriptionModal from "../../CancelSubscriptionModal";
import { isFreemiumPlan } from "../../../../types/PlanSelectionType";
import { Trans, useTranslation } from "react-i18next";
import { fetchCompany } from "../../../../api/Company/fetchCompany";
import { InfoTooltip } from "../../../shared/popup/InfoTooltip";
import { useAppDispatch, useAppSelector } from "../../../../AppRootContext";
import { equals, pick } from "ramda";
import { postWithExceptions } from "../../../../api/apiRequest";
import { POST_CREATE_CUSTOMER_PORTAL_SESSION } from "../../../../api/apiPath";
import styles from "../SettingPlanSubscription.module.css";
import { Button } from "../../../shared/Button/Button";
import { getWhatsAppSupportUrl } from "utility/getWhatsAppSupportUrl";
import SettingInvoiceTable from "./SettingInvoiceTable";

export default SettingInvoice;

function SettingInvoice() {
  const { company, selectedTimeZone, currentPlan } = useAppSelector(
    pick(["selectedTimeZone", "company", "currentPlan"]),
    equals
  );
  const loginDispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [show, isShow] = useState(false);
  const { t } = useTranslation();

  const handleCancelSubscription = () => {
    isShow(false);
    fetchCompany()
      .then((res) => {
        loginDispatch({ type: "ADD_COMPANY", company: { ...res } });
      })
      .catch((e) => {
        console.error(e);
      });
  };

  // const openCancelSubscriptionModal = () => {
  //   isShow(true);
  // }
  async function manageSubscription() {
    try {
      setLoading(true);
      const result = await postWithExceptions(
        POST_CREATE_CUSTOMER_PORTAL_SESSION,
        {
          param: {},
        }
      );
      window.open(result.url, "_blank");
    } catch (e) {
      console.error(`fetch POST_CREATE_CUSTOMER_PORTAL_SESSION error ${e}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.invoiceGrid}>
      <div className={styles.paymentHeader}>
        <span className={styles.title}>
          {t("settings.plan.modal.invoice.header")}
        </span>
        <div className={styles.description}>
          <Trans i18nKey={"settings.plan.modal.invoice.content"}>
            Need help reading your invoice? Check out
            <a
              className={styles.link}
              rel="noreferrer noopener"
              href="https://docs.sleekflow.io/settings/plans-and-subscription"
              target="_blank"
            >
              this article
            </a>
            .
          </Trans>
        </div>
      </div>
      {company?.isSubscriptionActive && (
        <div className={styles.buttonContainer}>
          <div className={styles.linkContainer}>
            {company?.isSubscriptionActive ? (
              <InfoTooltip
                placement={"left"}
                children={t("settings.tooltip.plan.invoice.cancel")}
                trigger={
                  <a
                    href={getWhatsAppSupportUrl(
                      "Hi, I would like to cancel my subscription"
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.link}
                  >
                    {company?.isFreeTrial
                      ? t("settings.plan.modal.invoice.button.cancelAddOn")
                      : t("settings.plan.modal.invoice.button.cancel")}
                  </a>
                }
              />
            ) : (
              !isFreemiumPlan(currentPlan) && (
                <div className="cancellation-text">
                  {t("settings.plan.modal.invoice.button.canceled")}
                </div>
              )
            )}
          </div>
        </div>
      )}

      <div className={styles.contentContainer}>
        <div className="box no-scrollbars">
          <SettingInvoiceTable />
        </div>
      </div>
      <CancelSubscriptionModal
        show={show}
        onCancel={() => isShow(false)}
        onConfirm={handleCancelSubscription}
      />
    </div>
  );
}
