import React, { useState, useEffect } from "react";
import { useLeadsContext, LeadFilterFormType } from "./LeadsContext";
import { FieldIterator } from "../../API/Objects/FieldReader/FieldIterator";
import { Detail } from "../../components/Detail/Detail";
import { useObjectsGridContext } from "../../components/ObjectsGrid/ObjectsGridContext";
import { LeadNormalizedType } from "../../API/Leads/fetchLeads";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";
import { getConversationUrlPath } from "component/Contact/Individual/useOpenInboxChat";
import styles from "../../components/Detail/Header.module.css";
import { Button } from "component/shared/Button/Button";
import { ObjectNormalizedType } from "../../API/Objects/contracts";
import { CampaignLinkList } from "./CampaignLink";
import { DisableControls } from "core/components/DisableControls/DisableControls";
import { Loader } from "semantic-ui-react";
import { fetchObjectsV2 } from "../../API/Objects/fetchObjectsV2";
import { NoValue } from "features/Salesforce/components/Detail/Body";

export function LeadDetail(props: { data: LeadNormalizedType }) {
  const { fieldTypesScalar, campaignChoices } = useLeadsContext();

  const { dispatch, fieldReader, getObjectConversation } =
    useObjectsGridContext<LeadNormalizedType, LeadFilterFormType>();
  const { t } = useTranslation();
  const [campaignsCached, setCampaignsCached] =
    useState<ObjectNormalizedType[]>();

  const status = fieldReader.getValue(props.data, "Status");

  const [chatBooted, setChatBooted] = useState<string>();

  useEffect(() => {
    getObjectConversation(props.data.id)
      .then((response) => {
        if (response !== null) {
          setChatBooted(response);
        }
      })
      .catch(console.error);
  }, [props.data.id]);

  useEffect(() => {
    fetchObjectsV2(
      "CampaignMember",
      [
        {
          filters: [
            {
              value: fieldReader.getValue(props.data, "SalesforceIntegratorId"),
              field_name: "unified:SalesforceIntegratorLeadId",
              operator: "=",
            },
          ],
        },
      ],
      [],
      40,
      [
        {
          from_field_name: "unified:SalesforceIntegratorCampaignId",
          to_entity_type_name: "Campaign",
          to_field_name: "unified:SalesforceIntegratorId",
          as_field_name: "Campaigns",
        },
      ]
    )
      .then((result) => {
        setCampaignsCached(
          result.records
            .map((res) => res["expanded:Campaigns"])
            .reduce((acc, curr) => (curr ? [...(acc ?? []), ...curr] : acc), [])
        );
      })
      .catch(() => {});
  }, [props.data.id]);

  const iterator = new FieldIterator([
    ...fieldTypesScalar,
    {
      label: t("salesforce.table.column.campaigns.head"),
      name: "expanded:CampaignMembers",
      types: ["string"],
    },
  ]);

  const disabled = campaignsCached === undefined;
  return (
    <DisableControls disabled={disabled}>
      <Detail
        close={() => dispatch({ type: "HIDE_LEAD" })}
        data={props.data}
        fieldIterator={iterator}
        name={fieldReader.getValue(props.data, "Name")}
        headerButtons={
          <Button
            as={(props: any) =>
              chatBooted === undefined ? (
                <a {...props} />
              ) : (
                <NavLink {...props} to={getConversationUrlPath(chatBooted)} />
              )
            }
            primary
            className={styles.button}
            disabled={chatBooted === undefined}
            content={t("salesforce.actions.message")}
          />
        }
        statusText={
          status ? (
            <>
              {t("salesforce.lead.detail.status")}: {status}
            </>
          ) : null
        }
        renderFieldCustom={(fieldName) => {
          if (fieldName !== "CampaignMembers") {
            return null;
          }
          if (campaignsCached === undefined) {
            return (
              <Loader
                active
                size={"mini"}
                inverted
                inline
                className={styles.loader}
              />
            );
          }
          if (campaignsCached.length === 0) {
            return NoValue;
          }
          return <CampaignLinkList data={campaignsCached} />;
        }}
      />
    </DisableControls>
  );
}
