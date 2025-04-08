import React, { useEffect, useState } from "react";
import styles from "./SalesforceLeadWidget.module.css";
import iconStyles from "../../shared/Icon/Icon.module.css";
import { useTranslation } from "react-i18next";
import { useObjectsApi } from "features/Salesforce/API/Objects/useObjectsApi";
import { Tabs } from "../BaseWidget/Tabs";
import LeadList from "./LeadList";
import { ObjectNormalizedType } from "features/Salesforce/API/Objects/contracts";
import { BaseWidget } from "../BaseWidget/BaseWidget";
import CampaignList from "./CampaignList";

export function SalesforceLeadWidget(props: { phoneNumber: string }) {
  const { t } = useTranslation();
  const { phoneNumber } = props;
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState<Array<ObjectNormalizedType> | null>(
    null
  );
  const [selectedTab, setSelectedTab] = useState<"Lead" | "Campaign">("Lead");
  const { getObjectDetailsByIdentity, getObjectUrl } = useObjectsApi({
    type: selectedTab,
  });
  useEffect(() => {
    if (phoneNumber) {
      setLoading(true);
      getObjectDetailsByIdentity(
        phoneNumber.replace(/[^0-9]+/g, ""),
        "salesforce-integrator"
      )
        .then((res) => {
          setRecords(res?.records ?? null);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [phoneNumber]);
  const tabs = {
    Lead: t("chat.salesforces.lead.header"),
    Campaign: t("chat.salesforces.campaign.header"),
  };
  if (records && records.length === 0) {
    return null;
  }
  return (
    <>
      <BaseWidget
        loading={loading}
        header={t("chat.salesforces.widget.header")}
        icon={<div className={`${styles.icon} ${iconStyles.icon}`} />}
      >
        <Tabs
          active={selectedTab}
          key={selectedTab}
          setActive={(name) => setSelectedTab(name)}
          tabs={tabs}
          contents={{
            Lead: records && (
              <LeadList getObjectUrl={getObjectUrl} records={records} />
            ),
            Campaign: records && (
              <CampaignList
                listIds={records.map((res) => res["salesforce-integrator:Id"])}
              />
            ),
          }}
        />
      </BaseWidget>
    </>
  );
}
