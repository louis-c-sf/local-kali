import { Trans, useTranslation } from "react-i18next";
import useRouteConfig from "../../../config/useRouteConfig";
import EmptyContent from "../../EmptyContent";
import { Link } from "react-router-dom";
import React from "react";

export function EmptyContactContent(props: {
  openEditColumnModal: () => void;
}) {
  const { openEditColumnModal } = props;
  const { t } = useTranslation();
  const { routeTo } = useRouteConfig();
  return (
    <EmptyContent
      header={t("profile.contacts.empty.header")}
      subHeader={
        <Trans i18nKey="profile.contacts.empty.content">
          Import contacts with CSV or sync your existing contacts from
          <br />
          different channels. Customise contact columns to match your
          <br />
          business needs. Add filters and segment customers into lists.
        </Trans>
      }
      actionContent={
        <>
          <Link to={routeTo("/channels")} className="ui button primary">
            {t("profile.contacts.empty.button.addChannel")}
          </Link>
          <div className="ui button" onClick={openEditColumnModal}>
            {t("profile.contacts.empty.button.editColumns")}
          </div>
        </>
      }
    />
  );
}
