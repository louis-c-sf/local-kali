import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";
import useRouteConfig from "../../../config/useRouteConfig";
import { WhatsApp360DialogUsageRecordType } from "../../../types/CompanyType";
import { equals, pick } from "ramda";
import { useAppSelector } from "../../../AppRootContext";

interface defaultCreditType {
  balance: number;
  allTimeUsage: number;
  credit: number;
}

export default function SettingTopUp() {
  const { company, user } = useAppSelector(pick(["user", "company"]), equals);
  const [creditBalance, setCreditBalance] = useState<
    WhatsApp360DialogUsageRecordType | defaultCreditType
  >({
    balance: 0,
    allTimeUsage: 0,
    credit: 0,
  });
  const { t } = useTranslation();
  const history = useHistory();
  const { routeTo } = useRouteConfig();

  useEffect(() => {
    if (company?.whatsApp360DialogUsageRecords) {
      const [first360DialogUsageRecord] = company.whatsApp360DialogUsageRecords;
      if (first360DialogUsageRecord) {
        setCreditBalance(first360DialogUsageRecord);
      } else {
        history.push(routeTo(`/inbox/${user.id}`));
      }
    }
  }, [company?.whatsApp360DialogUsageRecords]);

  return (
    <div className="main-primary-column content topup-credit">
      <div className="header">{t("settings.billing.topupCredit.header")}</div>
      {creditBalance && (
        <div className="balance">
          <div
            className={`container ${
              creditBalance.balance > 0
                ? `positive`
                : !creditBalance.balance
                ? ""
                : `negative`
            }`}
          >
            <div className="container-header">
              {t("settings.billing.topupCredit.currentBalance.header")}
            </div>
            <span>{`US$ ${Math.abs(creditBalance.balance).toFixed(2)}`}</span>
          </div>
          <div className="container">
            <div className="container-header">
              {t("settings.billing.topupCredit.usage.header")}
            </div>
            <span>{`US$ ${creditBalance.allTimeUsage.toFixed(2)}`}</span>
          </div>
          <div className="container">
            <div className="container-header">
              {t("settings.billing.topupCredit.amountTopUp.header")}
            </div>
            <span>{`US$ ${creditBalance.credit.toFixed(2)}`}</span>
          </div>
        </div>
      )}
    </div>
  );
}
