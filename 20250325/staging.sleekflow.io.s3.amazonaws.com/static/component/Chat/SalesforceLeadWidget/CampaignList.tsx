import { fetchCampaignByLead } from "features/Salesforce/API/Campaigns/fetchCampaignByLead";
import { ObjectNormalizedType } from "features/Salesforce/API/Objects/contracts";
import { CampaignLinkList } from "features/Salesforce/usecases/Leads/CampaignLink";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "./SalesforceLeadWidget.module.css";

export default function CampaignList({ listIds }: { listIds: string[] }) {
  const { t } = useTranslation();
  const [campaignsCached, setCampaignsCached] =
    useState<ObjectNormalizedType[]>();
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (listIds.length === 0) {
      return;
    }
    setLoading(true);
    fetchCampaignByLead(listIds, 200, [])
      .then((res) => {
        setCampaignsCached(res.records);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [listIds]);
  if (loading) {
    return null;
  }
  if (!campaignsCached || campaignsCached?.length === 0) {
    return (
      <div className={styles.noRecord}>
        {t("chat.salesforces.campaign.noRecord")}
      </div>
    );
  }

  return <CampaignLinkList data={campaignsCached} />;
}
