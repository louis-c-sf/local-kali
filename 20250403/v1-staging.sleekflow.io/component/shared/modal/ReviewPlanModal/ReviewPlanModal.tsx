import { useAppSelector } from "AppRootContext";
import {
  ChannelContextType,
  ChannelsContext,
} from "component/Channel/ChannelsContext";
import { ModalForm } from "component/shared/ModalForm";
import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import styles from "./ReviewPlanModal.module.css";
export default function ReviewPlanModal() {
  const { t } = useTranslation();
  const isGlobalPricingFeatureEnabled = useAppSelector(
    (s) => s.company?.isGlobalPricingFeatureEnabled
  );
  const { dispatch, state } = useContext<ChannelContextType>(ChannelsContext);
  function redirectToV2Settings() {
    window.open(
      `https://${process.env.REACT_APP_V2_PATH}/settings/subscriptions`,
      "_blank",
      "noopener noreferrer"
    );
  }
  if (!isGlobalPricingFeatureEnabled) {
    return null;
  }
  return (
    <ModalForm
      opened={state.isReviewPlanModalOpen}
      horizontalActions
      centeredContent
      title={t("reviewPlanModal.title")}
      isLoading={false}
      cancelText={t("reviewPlanModal.button.cancel")}
      confirmText={t("reviewPlanModal.button.confirm")}
      onCancel={() =>
        dispatch({
          type: "REVIEW_PLAN_MODAL_CLOSE",
        })
      }
      className={styles.modal}
      onConfirm={redirectToV2Settings}
    >
      <div className={`ui form ${styles.form}`}>
        <div className={`field ${styles.field}`}>
          <p>{t("reviewPlanModal.content")}</p>
        </div>
      </div>
    </ModalForm>
  );
}
