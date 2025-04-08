import { Trans, useTranslation } from "react-i18next";
import EmptyContent from "../../../../component/EmptyContent";
import React from "react";
import useRouteConfig from "config/useRouteConfig";

export function EmptyListContent() {
  const { t } = useTranslation();
  const { routeTo } = useRouteConfig();
  return (
    <EmptyContent
      header={t("profile.list.empty.header")}
      subHeader={
        <Trans i18nKey="profile.list.empty.subHeader">
          Select and add contacts to this list to segment customers.
          <br />
          You can also update the list dynamically using automation rules.
        </Trans>
      }
      content={
        <>
          <div className="action individual-list">
            <a
              target={"_blank"}
              rel="noopener noreferrer"
              href={routeTo("/contacts", true)}
              className="ui button primary"
            >
              {t("profile.list.empty.button.filter")}
            </a>
          </div>
          <div className="action individual-list">
            <a
              target={"_blank"}
              href={
                "https://docs.sleekflow.io/using-the-platform/automation/templates/11.-update-contact-data-and-add-and-remove-from-list"
              }
              className="ui button"
            >
              {t("profile.list.empty.button.exploreList")}
            </a>
          </div>
        </>
      }
    />
  );
}
