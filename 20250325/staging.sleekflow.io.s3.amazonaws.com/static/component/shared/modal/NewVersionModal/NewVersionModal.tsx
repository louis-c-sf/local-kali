import { useAppSelector } from "AppRootContext";
import {
  ChannelContextType,
  ChannelsContext,
} from "component/Channel/ChannelsContext";
import { ModalForm } from "component/shared/ModalForm";
import React, { useContext } from "react";
import { Trans, useTranslation } from "react-i18next";
import styles from "./NewVersionModal.module.css";
export default function NewVersionModal() {
  const { t } = useTranslation();
  const { dispatch, state } = useContext<ChannelContextType>(ChannelsContext);
  const redirectMapping = {
    salesforce: {
      guide: "https://help.sleekflow.io/en_US/salesforce-integration",
      redirectLink: `https://${process.env.REACT_APP_V2_PATH}/integrations/salesforce/setup`,
    },
    facebookLeadAds: {
      guide:
        "https://help.sleekflow.io/integrations/facebook-lead-ads-integration",
      redirectLink: `https://${process.env.REACT_APP_V2_PATH}/integrations/facebook-lead-ad/setup`,
    },
  };
  function redirectToV2Salesforce() {
    return window.open(
      redirectMapping[state.selectedChannelName]?.redirectLink,
      "_self"
    );
  }
  return (
    <ModalForm
      opened={state.isNewVersionModalOpen}
      horizontalActions
      centeredContent
      title={t("newVersionModal.title")}
      isLoading={false}
      cancelText={t("newVersionModal.button.cancel")}
      confirmText={t("newVersionModal.button.confirm")}
      onCancel={() =>
        dispatch({
          type: "NEW_VERSION_MODAL_CLOSE",
        })
      }
      className={styles.modal}
      onConfirm={redirectToV2Salesforce}
    >
      <div className={`ui form ${styles.form}`}>
        <div className={`field ${styles.field}`}>
          <p>
            <Trans i18nKey={"newVersionModal.content"}>
              We've migrated this feature to the latest version. Explore the new
              features and enhancements by visiting SleekFlow 2.0. For more
              details, please visit our
              <a href={redirectMapping[state.selectedChannelName]?.guide}>
                Help Center
              </a>
              or contact our support team.
            </Trans>
          </p>
        </div>
      </div>
    </ModalForm>
  );
}
