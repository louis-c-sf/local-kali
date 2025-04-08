import React, { useEffect, useState } from "react";
import Helmet from "react-helmet";
import { useTranslation } from "react-i18next";
import { Divider, Header, Tab } from "semantic-ui-react";
import settingStyles from "../Setting.module.css";
import styles from "./SettingBilling.module.css";
import { useAccessRulesGuard } from "../../../component/Settings/hooks/useAccessRulesGuard";
import SettingTwilioTopUp from "../../../component/Settings/SettingBilling/SettingTwilioTopUp";
import Setting360DialogTopUp from "../../../component/Settings/SettingBilling/Setting360DialogTopUp";
import Setting360DialogDirectPayment from "../../../component/Settings/SettingBilling/Setting360DialogDirectPayment";
import SettingCloudAPITopUp from "component/Settings/SettingBilling/SettingCloudAPITopUp";
import { useLocation } from "react-router";
import { useFlashMessageChannel } from "component/BannerMessage/flashBannerMessage";
import useFetchUsageRecord from "api/CloudAPI/useFetchUsageRecord";
import { WhatsappCloudApiUsageRecordType } from "types/CompanyType";
import SettingCloudAPIBusinessWaba from "./SettingCloudAPIBusinessWaba";
import { ChannelLabel } from "component/Broadcast/ConfirmSend/ChannelLabel";
import useCompanyChannels from "component/Chat/hooks/useCompanyChannels";
import { WhatsappCloudAPIConfigType } from "features/WhatsappCloudAPI/models/WhatsappCloudAPIConfigType";
import ModuleNewVersion from "component/Settings/SettingPlanSubscription/ModuleNewVersion";
import { useRequireRBAC } from "component/shared/useRequireRBAC";
import { PERMISSION_KEY } from "types/Rbac/permission";

export enum TabEnum {
  dialog,
  twilio,
}

export default function SettingTopUp() {
  useRequireRBAC([PERMISSION_KEY.channelBillingManage]);

  const { t } = useTranslation();
  const location = useLocation<{ isTopUpSuccess: boolean }>();
  const flash = useFlashMessageChannel();
  useEffect(() => {
    if (location.state?.isTopUpSuccess) {
      flash(t("flash.topupCredit.success"));
    }
  }, [location.state?.isTopUpSuccess]);
  const pageTitle = t("nav.menu.settings.billing");

  return process.env.REACT_APP_FEATURE_DEPRECATION?.split(",").includes(
    "whatsappBilling"
  ) ? (
    <ModuleNewVersion moduleName="whatsappBilling" />
  ) : (
    <div className={settingStyles.content}>
      <div className={settingStyles.hideScrollableTable}>
        <div className={settingStyles.container}>
          <div className={settingStyles.header}>
            <Helmet title={t("nav.common.title", { page: pageTitle })} />
            <Header as="h4" content={pageTitle} />
          </div>
          <div>
            <SettingBillingContent />
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingBillingContent() {
  const accessRuleGuard = useAccessRulesGuard();
  const is360Dialog = accessRuleGuard.is360DialogAccount();
  const isTwilio = accessRuleGuard.isTwilioAccount();
  const is360DialogDirectPayment = accessRuleGuard.is360DialogDirectPayment();
  const isCloudAPIAccount = accessRuleGuard.isCloudAPIUsageRecordExist();
  const { loading, usageRecords } = useFetchUsageRecord();
  const [selectedCloudAPI, setSelectedCloudAPI] =
    useState<WhatsappCloudApiUsageRecordType>();
  const Setting360DialogContent = is360DialogDirectPayment ? (
    <Setting360DialogDirectPayment />
  ) : (
    <Setting360DialogTopUp />
  );
  const { t } = useTranslation();
  useEffect(() => {
    if (usageRecords.length > 0) {
      setSelectedCloudAPI(usageRecords[0]);
    }
  }, [usageRecords.length]);
  const mainPanes = [
    {
      menuItem: t("settings.billing.tab.cloudAPI"),
      visible: isCloudAPIAccount,
      render: () => {
        return (
          <Tab.Pane
            attached={false}
            key={TabEnum.dialog}
            className={styles.paneContainer}
          >
            <>
              <SettingCloudBalanceList
                selectedBusinessId={
                  selectedCloudAPI?.facebook_business_id ?? ""
                }
                usageRecords={usageRecords}
                onSelect={(id) =>
                  setSelectedCloudAPI(
                    usageRecords.find(
                      (record) => record.facebook_business_id === id
                    )
                  )
                }
              />
              <Divider />
              {selectedCloudAPI && (
                <SettingCloudAPITopUp
                  loading={loading}
                  selectedBalance={selectedCloudAPI}
                />
              )}
            </>
          </Tab.Pane>
        );
      },
    },
    {
      menuItem: t("settings.billing.tab.360Dialog"),
      visible: is360Dialog,
      render: () => {
        return (
          <Tab.Pane
            attached={false}
            key={TabEnum.dialog}
            className={styles.paneContainer}
          >
            <>
              <Divider />
              {Setting360DialogContent}
            </>
          </Tab.Pane>
        );
      },
    },
    {
      menuItem: t("settings.billing.tab.twilio"),
      visible: isTwilio,
      render: () => {
        return (
          <Tab.Pane
            attached={false}
            key={TabEnum.twilio}
            className={styles.paneContainer}
          >
            <>
              <Divider />
              <SettingTwilioTopUp />
            </>
          </Tab.Pane>
        );
      },
    },
  ];
  const displayedPanes = mainPanes.filter((p) => p.visible);
  if (displayedPanes.length > 1) {
    return (
      <Tab
        menu={{ secondary: true, pointing: true }}
        className={styles.billingPanel}
        panes={displayedPanes}
      />
    );
  }
  return (
    <>
      <SettingCloudBalanceList
        selectedBusinessId={selectedCloudAPI?.facebook_business_id ?? ""}
        usageRecords={usageRecords}
        onSelect={(id) =>
          setSelectedCloudAPI(
            usageRecords.find((record) => record.facebook_business_id === id)
          )
        }
      />
      <Divider />
      {is360Dialog && Setting360DialogContent}
      {isTwilio && <SettingTwilioTopUp />}
      {isCloudAPIAccount && selectedCloudAPI && (
        <SettingCloudAPITopUp
          loading={loading}
          selectedBalance={selectedCloudAPI}
        />
      )}
    </>
  );
}

function SettingCloudBalanceList({
  usageRecords,
  selectedBusinessId,
  onSelect,
}: {
  usageRecords: WhatsappCloudApiUsageRecordType[] | undefined;
  selectedBusinessId: string;
  onSelect: (id: string) => void;
}) {
  const channels = useCompanyChannels();
  if (!usageRecords) {
    return null;
  }
  const selectedUsageRecord = usageRecords.find(
    (record) => record.facebook_business_id === selectedBusinessId
  );
  const channelPhoneNumbers = channels
    .find((ch) => ch.type === "whatsappcloudapi")
    ?.configs?.filter((c: WhatsappCloudAPIConfigType) =>
      selectedUsageRecord?.facebook_business_wabas.some(
        (waba) => waba.facebook_waba_id === c.facebookWabaId
      )
    )
    .map((c: WhatsappCloudAPIConfigType) => c.whatsappPhoneNumber);
  return (
    <>
      <div className={styles.cloudAPIList}>
        {usageRecords.map((record) => (
          <>
            <SettingCloudAPIBusinessWaba
              key={record.facebook_business_id}
              isSelected={selectedBusinessId === record.facebook_business_id}
              wabaId={record.facebook_business_id}
              isLowerAmount={record.balance.amount < 50}
              wabaName={record.facebook_business_name}
              onSelect={(id) => onSelect(id)}
            />
          </>
        ))}
      </div>
      {selectedUsageRecord && (
        <div className={styles.wabaLabel}>
          <ChannelLabel
            channel={{
              channel: "whatsappcloudapi",
              ids: channelPhoneNumbers,
            }}
          />
        </div>
      )}
    </>
  );
}
