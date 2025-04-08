import { CloseButton } from "component/shared/CloseButton";
import React from "react";
import { useTranslation } from "react-i18next";
import { Image, Modal } from "semantic-ui-react";
import UpgradeImg from "../../../assets/images/upgrade.svg";
import { Link } from "react-router-dom";
import { useAppSelector } from "../../../AppRootContext";
import { equals } from "ramda";
import {
  isFreeOrFreemiumPlan,
  isPremiumPlan,
  isYearlyPlan,
} from "../../../types/PlanSelectionType";
import { useSettingsStripeCheckout } from "../../../api/User/useSettingsStipeCheckout";
import { Button } from "../../shared/Button/Button";
import useRouteConfig from "config/useRouteConfig";

const UserExceedLimitModal = ({ close }: { close: () => void }) => {
  const { t } = useTranslation();
  const { currentPlan, currentPlanCurrency } = useAppSelector(
    (s) => ({
      currentPlan: s.currentPlan,
      isSubscriptionActive: s.company?.isSubscriptionActive,
      currentPlanCurrency: s.currentPlan.currency,
    }),
    equals
  );
  const { routeTo } = useRouteConfig();
  const isCurrentPlanYearly = isYearlyPlan(currentPlan);
  const isCurrentPlanPremium = isPremiumPlan(currentPlan);
  const isCurrentPlanFree = isFreeOrFreemiumPlan(currentPlan);
  const { stripePlans, loading } = useSettingsStripeCheckout(
    currentPlanCurrency.toUpperCase()
  );
  const additionalStaffLoginPlanId =
    stripePlans?.addOnPlans?.coreFeatures[
      isCurrentPlanYearly ? "yearly" : "monthly"
    ][isCurrentPlanPremium ? "premium" : "pro"].additionalStaffLogin.id;

  return (
    <Modal open={true} className="contact-exceed-modal">
      <Modal.Content className="_content">
        <CloseButton onClick={close} />
        <div className="container">
          <div className="header">
            {t("settings.user.modal.addon.userExceedLimitModal.header")}
          </div>
          <Image src={UpgradeImg} />
          {t("settings.user.modal.addon.userExceedLimitModal.description")}
          <div className="content"></div>

          <Link
            to={
              !isCurrentPlanFree &&
              currentPlanCurrency &&
              additionalStaffLoginPlanId
                ? routeTo(
                    `/subscriptions/add-ons/additional-staff?planId=${additionalStaffLoginPlanId}&currency=${currentPlanCurrency.toUpperCase()}`
                  )
                : routeTo("/settings/plansubscription")
            }
          >
            <Button primary loading={loading}>
              {t("account.upgrade.button")}
            </Button>
          </Link>
        </div>
      </Modal.Content>
    </Modal>
  );
};

export default UserExceedLimitModal;
