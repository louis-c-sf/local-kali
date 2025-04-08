import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Portal } from "semantic-ui-react";
import { CloseButton } from "./ChannelConnectionBanner";
import { useAppSelector } from "../../AppRootContext";
import {
  BannerOrderAndClassNameList,
  getIsCurrentBannerShow,
} from "./helper/getIsCurrentBannerShow";
import { BannerEnum } from "./types/BannerEnum";
import styles from "./BalanceWarningBanner.module.css";
import { useHistory } from "react-router";
import useRouteConfig from "../../config/useRouteConfig";

const CREDIT_LIMIT_CLOUDAPI = 20;
const CREDIT_LIMIT_360DIALOG = 200;
export default function BalanceWarningBanner() {
  const { t } = useTranslation();
  const history = useHistory();
  const { routeTo } = useRouteConfig();
  const is360DialogBalanceTooLow = useAppSelector((s) =>
    s.company?.whatsApp360DialogUsageRecords?.some(
      (record) =>
        record.balance - record.upcomingCharges < CREDIT_LIMIT_360DIALOG
    )
  );
  const isCloudAPIBalanceTooLow = useAppSelector((s) =>
    s.company?.whatsappCloudApiUsageRecords?.some(
      (record) => record.balance.amount < CREDIT_LIMIT_CLOUDAPI
    )
  );
  const [visible, setVisible] = useState(true);
  const ref = document.body;
  const currentBanner = BannerEnum.paymentFailed;
  const balanceTooLow: string[] = [];
  const isDeprecated =
    process.env.REACT_APP_FEATURE_DEPRECATION?.split(",").includes(
      "whatsappBilling"
    );
  if (isCloudAPIBalanceTooLow) {
    balanceTooLow.push("Cloud API");
  }
  if (is360DialogBalanceTooLow) {
    balanceTooLow.push("360 Dialog");
  }
  const isOpen =
    balanceTooLow.length > 0 && getIsCurrentBannerShow(ref, currentBanner);
  useEffect(() => {
    setVisible(isOpen ?? false);
  }, [isOpen]);

  function closeButtonClick() {
    setVisible(false);
    delete ref.dataset[BannerOrderAndClassNameList.balanceWarningBanner];
  }

  function handleManageClick() {
    if (isDeprecated) {
      window.location.href = `https://${process.env.REACT_APP_V2_PATH}/channels/whatsapp/billing`;
    } else {
      history.push(routeTo(`/settings/topup`));
    }
  }

  if (!isOpen) {
    return null;
  }
  if (isOpen && visible) {
    ref.dataset[BannerOrderAndClassNameList.balanceWarningBanner] = "true";
  }

  return (
    <>
      {balanceTooLow.map((type, idx) => (
        <Portal open={isOpen && visible} mountNode={ref} key={idx}>
          <div className={`top-display-banner ${styles.banner}`}>
            <div className="content">
              {t("account.balanceWarningBanner.content", { type: type })}
              <div className="action">
                <Button onClick={handleManageClick} className="ui button">
                  {t("account.balanceWarningBanner.button.manage")}
                </Button>
              </div>
            </div>
            <CloseButton onClick={closeButtonClick} />
          </div>
        </Portal>
      ))}
    </>
  );
}
