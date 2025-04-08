import React, { useCallback, useContext } from "react";
import { useTranslation } from "react-i18next";
import { Checkbox, Dimmer, Loader } from "semantic-ui-react";
import styles from "./SelectWaba.module.css";
import StatusAlert from "component/shared/StatusAlert";
import { ConnectFailWarning } from "component/WhatsappOfficialVideo/WarningComponent";
import { useFacebookLogin } from "features/Facebook/helper/useFacebookLogin";
import { MigrateNumberContext } from "./MigrateNumberContext";
import { MigrateBspHeader } from "./MigrateBspHeader";
import { Button } from "component/shared/Button/Button";
import { submitFacebookAccessToken } from "api/Channel/submitFacebookAccessToken";

export const SelectWaba = () => {
  const migrateNumberContext = useContext(MigrateNumberContext);
  const { t } = useTranslation();
  const facebookLogin = useFacebookLogin({
    updateEvent: useCallback(
      async (token) => {
        const result = await submitFacebookAccessToken(token);
        const wabaPhoneNumber = result.connectedWaba;
        if (token && wabaPhoneNumber) {
          migrateNumberContext.dispatch({
            type: "UPDATE_FACEBOOK_ACCESS_TOKEN",
            token,
          });
          migrateNumberContext.dispatch({
            type: "ADD_UNCONNECTED_BUSINESS",
            unconnectedBusiness: wabaPhoneNumber,
          });
          const [firstRecord] = wabaPhoneNumber;
          migrateNumberContext.dispatch({
            type: "SET_BUSINESS_INFO",
            businessId: firstRecord.facebookWabaBusinessId,
            businessNmae: firstRecord.facebookWabaBusinessName,
          });
          if (migrateNumberContext.isSleekFlowNumberExist) {
            migrateNumberContext.dispatch({
              type: "NEXT_STEP",
            });
          }
        } else {
          console.error("fb token error");
        }
      },
      [
        migrateNumberContext.dispatch,
        migrateNumberContext.isSleekFlowNumberExist,
      ]
    ),
  });

  return (
    <div className={styles.container}>
      <MigrateBspHeader
        title={t("guideContainer.migrateNumber.selectWaba.title")}
        description={t("guideContainer.migrateNumber.selectWaba.description")}
      />
      <div className={styles.description}>
        {t("guideContainer.migrateNumber.selectWaba.subHeader")}
      </div>
      {facebookLogin.isReady ? (
        <>
          <div className={styles.steps}>
            <div className={styles.step}>
              {t("guideContainer.migrateNumber.selectWaba.steps.loginFB")}
            </div>
            <div className={styles.step}>
              {t("guideContainer.migrateNumber.selectWaba.steps.grantAccess")}
            </div>
            <div className={styles.step}>
              {t("guideContainer.migrateNumber.selectWaba.steps.fillWaba")}
            </div>
            <div className={styles.step}>
              {t("guideContainer.migrateNumber.selectWaba.steps.closePopup")}
              <div className={styles.screenshot} />
            </div>
          </div>
          <StatusAlert
            type={"info"}
            headerText={t(
              "guideContainer.migrateNumber.selectWaba.alert.title"
            )}
            className={styles.alert}
          >
            <ul>
              <li>
                {t(
                  "guideContainer.migrateNumber.selectWaba.alert.list.templates"
                )}
              </li>
              <li>
                {t(
                  "guideContainer.migrateNumber.selectWaba.alert.list.process"
                )}
              </li>
            </ul>
          </StatusAlert>
          {facebookLogin.showConnectError && <ConnectFailWarning />}
          <div className={styles.checkboxWrapper}>
            <Checkbox
              label={t("guideContainer.migrateNumber.getStarted.checkbox")}
              checked={migrateNumberContext.isSleekFlowNumberExist}
              onChange={() =>
                migrateNumberContext.dispatch({
                  type: "IS_SLEEKFLOW_NUMBER_EXIST",
                  isSleekFlowNumberExist:
                    !migrateNumberContext.isSleekFlowNumberExist,
                })
              }
            />
          </div>
          {facebookLogin.loader.isLoading ? (
            <Loader className={styles.fbLoginLoader} size="small" />
          ) : (
            <>
              {!migrateNumberContext.isSleekFlowNumberExist ? (
                <Button
                  primary
                  fluid
                  centerText
                  onClick={() =>
                    facebookLogin.handleClick({ type: "cloudAPIConnect" })
                  }
                  loading={facebookLogin.loader.isLoading}
                  disabled={facebookLogin.loader.isLoading}
                  className={styles.newButton}
                >
                  {t("guideContainer.migrateNumber.selectWaba.buttons.new")}
                </Button>
              ) : (
                <div
                  className={styles.existingButton}
                  onClick={() =>
                    facebookLogin.loader.isLoading
                      ? () => {}
                      : facebookLogin.handleClick({ type: "cloudAPIConnect" })
                  }
                >
                  {t(
                    "guideContainer.migrateNumber.selectWaba.buttons.existing"
                  )}
                  →
                </div>
              )}
            </>
          )}
        </>
      ) : (
        <Dimmer active inverted>
          <Loader inverted />
        </Dimmer>
      )}
    </div>
  );
};
