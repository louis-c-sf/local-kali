import React from "react";
import styles from "./CampaignLink.module.css";
import { Icon } from "../../../../component/shared/Icon/Icon";
import { Link, NavLink } from "react-router-dom";
import useRouteConfig from "../../../../config/useRouteConfig";
import { ObjectNormalizedType } from "../../API/Objects/contracts";
import { FieldReader } from "../../API/Objects/FieldReader/FieldReader";
import { LeadNormalizedType } from "../../API/Leads/fetchLeads";
import { OptionType } from "../../components/Filter/contracts";
import datePickerUTCAware from "../../../../component/shared/DatePickerUTCAware";

export function CampaignLink(props: { id: string; name: string }) {
  const { routeTo } = useRouteConfig();
  return (
    <Link
      className={"ui button"}
      to={{
        pathname: routeTo(`/contacts/salesforce/campaigns?id=${props.id}`),
        state: { campaignId: props.id },
      }}
      target="_blank"
      rel="noopener noreferrer"
    >
      <span className={styles.text}>{props.name}</span>
      <span className={styles.icon}>
        <Icon type={"extLinkBlue"} />
      </span>
    </Link>
  );
}

export function CampaignLinkList(props: { data: ObjectNormalizedType[] }) {
  const counter = props.data.length;

  return (
    <div className={`${styles.list}`}>
      {props.data.map((c, idx) => {
        const name = c["unified:Name"];
        const campaignId =
          c["unified:SalesforceIntegratorCampaignId"] ??
          c["unified:SalesforceIntegratorId"];
        if (!campaignId || !name) {
          return null;
        }
        return <CampaignLink key={c.id} id={campaignId} name={name} />;
      })}
    </div>
  );
}
