import React from "react";
import { Tab } from "semantic-ui-react";
import { useTranslation } from "react-i18next";
import SettingCrm from "core/features/Crm/components/Settings/SettingCrm";
import styles from "./SettingHubspot.module.css";
import UsersTab from "./UsersTab";
import SyncDataTab from "core/features/Crm/components/Settings/SyncDataTab";
import useRouteConfig from "config/useRouteConfig";

export default function SettingHubspot() {
  const { t } = useTranslation();
  const { routeTo } = useRouteConfig();

  return (
    <SettingCrm
      usersTab={() => {
        return (
          <Tab.Pane key="users" className={styles.tab}>
            <UsersTab />
          </Tab.Pane>
        );
      }}
      syncDataTab={() => {
        return (
          <Tab.Pane key="syncData" className={styles.tab}>
            <SyncDataTab
              syncDataPath={routeTo("/settings/hubspot/syncData")}
              twoWaysSyncPath={routeTo("/settings/hubspot/twoWaysSync")}
              crmName="HubSpot"
            />
          </Tab.Pane>
        );
      }}
      header={t("settings.hubspot.header")}
    />
  );
}
