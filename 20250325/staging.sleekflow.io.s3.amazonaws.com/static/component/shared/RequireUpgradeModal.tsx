import React from "react";
import { Modal } from "semantic-ui-react";
import { useHistory } from "react-router-dom";
import { CloseButton } from "./CloseButton";
import { useTranslation } from "react-i18next";
import useRouteConfig from "../../config/useRouteConfig";
import { useAppDispatch, useAppSelector } from "../../AppRootContext";
import { useAccessRulesGuard } from "../Settings/hooks/useAccessRulesGuard";
import { Button } from "./Button/Button";
import ResellerContactButton from "../Reseller/ResellerContactButton";
import { getWhatsAppSupportUrl } from "utility/getWhatsAppSupportUrl";

export default function RequireUpgradeModal() {
  const isDisplayUpgradePlanModal = useAppSelector(
    (s) => s.isDisplayUpgradePlanModal
  );
  const loginDispatch = useAppDispatch();
  const accessRulesGuard = useAccessRulesGuard();
  const isResellerClient = accessRulesGuard.isResellerClient();
  const history = useHistory();
  const { t } = useTranslation();
  const { routeTo } = useRouteConfig();
  const onConfirm = () => {
    onClose();
    history.push(routeTo("/settings/plansubscription"));
  };

  const onClose = () => {
    loginDispatch({
      type: "IS_DISPLAY_UPGRADE_PLAN_MODAL",
      isDisplayUpgradePlanModal: false,
    });
  };
  return (
    <Modal
      open={isDisplayUpgradePlanModal}
      closeOnDimmerClick={false}
      dimmer={"inverted"}
      className={"minimal upgrade-modal"}
      size={"small"}
      onClose={onClose}
    >
      <Modal.Content>
        <CloseButton onClick={onClose} />
        <h3>{t("account.upgrade.modal.header")}</h3>
        <div className={"sub-header"}>
          {t("account.upgrade.modal.subHeader")}
        </div>
      </Modal.Content>
      <Modal.Actions>
        {isResellerClient ? (
          <ResellerContactButton>
            <Button primary>{t("contactYourReseller")}</Button>
          </ResellerContactButton>
        ) : (
          <>
            <div className="ui button primary" onClick={onConfirm}>
              {t("account.upgrade.modal.button.planSubscriptions")}
            </div>
            <a
              className="ui button"
              target={"_blank"}
              rel="noopener noreferrer"
              href={getWhatsAppSupportUrl(
                "Hi SleekFlow. I'd like to learn more about the platform."
              )}
            >
              {t("account.upgrade.modal.button.talkToSales")}
            </a>
          </>
        )}
      </Modal.Actions>
    </Modal>
  );
}
