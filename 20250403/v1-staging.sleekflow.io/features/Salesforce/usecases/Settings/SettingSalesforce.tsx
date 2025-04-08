import React from "react";
import styles from "./SettingSalesforce.module.css";
import ModuleNewVersion from "component/Settings/SettingPlanSubscription/ModuleNewVersion";

export default function SettingSalesforce() {
  return (
    <ModuleNewVersion moduleName="salesforce" />
    // <SettingCrm
    //   usersTab={() => {
    //     return (
    //       <Tab.Pane key="users" className={styles.tab}>
    //         <UsersTab />
    //       </Tab.Pane>
    //     );
    //   }}
    //   syncDataTab={() => {
    //     return (
    //       <Tab.Pane key="syncData" className={styles.tab}>
    //         <SyncDataTab
    //           syncDataPath={routeTo("/settings/salesforce/syncData")}
    //           twoWaysSyncPath={routeTo("/settings/salesforce/twoWaysSync")}
    //           crmName="Salesforce"
    //         />
    //       </Tab.Pane>
    //     );
    //   }}
    //   header={t("settings.salesforce.header")}
    // />
  );
}
