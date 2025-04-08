import React from "react";
import { FieldIterator } from "../../API/Objects/FieldReader/FieldIterator";
import { Detail } from "../../components/Detail/Detail";
import { useObjectsGridContext } from "../../components/ObjectsGrid/ObjectsGridContext";
import { useTranslation } from "react-i18next";
import { CampaignNormalizedType } from "./models/CampaignNormalizedType";
import { useCampaignDependenciesContext } from "./models/CampaignsDependencenciesProvider";
import { CampaignsFilterFormType } from "./models/CampaignsFilterFormType";
import styles from "./CampaignDetail.module.css";
import { NavLink, useHistory, useLocation } from "react-router-dom";
import { formatNumber } from "../../../../utility/string";

export function CampaignDetail(props: {
  data: CampaignNormalizedType;
  leadsCount: number;
}) {
  const { fieldTypesScalar } = useCampaignDependenciesContext();
  const { dispatch, fieldReader } = useObjectsGridContext<
    CampaignNormalizedType,
    CampaignsFilterFormType
  >();
  const iterator = new FieldIterator(fieldTypesScalar);
  const { t } = useTranslation();

  const campaignType = fieldReader.getValue(props.data, "Type");
  const history = useHistory();
  const location = useLocation();

  return (
    <Detail
      close={() => {
        dispatch({ type: "HIDE_LEAD" });
        history.replace(location.pathname);
      }}
      data={props.data}
      fieldIterator={iterator}
      name={fieldReader.getValue(props.data, "Name")}
      statusText={
        <>
          {campaignType && (
            <div className={styles.statusLine}>
              {t("salesforce.table.column.type.head")}: {campaignType}
            </div>
          )}
          {
            <div className={styles.statusLine}>
              {t("salesforce.table.column.totalLeads.head")}:{" "}
              {formatNumber(props.leadsCount)}{" "}
              {props.leadsCount > 0 && (
                <NavLink
                  to={{
                    pathname: `/contacts/salesforce/leads`,
                    state: {
                      campaignId: props.data["unified:SalesforceIntegratorId"],
                    },
                  }}
                >
                  {t("salesforce.campaigns.viewLeads")}
                </NavLink>
              )}
            </div>
          }
        </>
      }
      hasAddToContactListButton={true}
    />
  );
}
