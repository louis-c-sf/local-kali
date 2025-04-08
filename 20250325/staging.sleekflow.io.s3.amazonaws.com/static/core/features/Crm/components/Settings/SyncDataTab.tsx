import React from "react";
import settingsStyles from "./SettingCrm.module.css";
import { Button } from "component/shared/Button/Button";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export default function SyncDataTab(props: {
  syncDataPath: string;
  twoWaysSyncPath: string;
  crmName: string;
}) {
  const { syncDataPath, twoWaysSyncPath, crmName } = props;
  const { t } = useTranslation();

  return (
    <div>
      <div className={settingsStyles.sectionWrapper}>
        <div>
          <div className={settingsStyles.title}>
            {t("settings.crm.syncData.syncPropertiesTitle")}
          </div>
          <div className={settingsStyles.description}>
            {t("settings.crm.syncData.syncPropertiesDesc", { crm: crmName })}
          </div>
        </div>
        <div className={settingsStyles.buttonWrapper}>
          <Link to={syncDataPath}>
            <Button primary>{t("settings.crm.button.sync")}</Button>
          </Link>
        </div>
      </div>
      <div className={settingsStyles.sectionWrapper}>
        <div>
          <div className={settingsStyles.title}>
            {t("settings.crm.syncData.syncAndImportContactTitle", {
              crm: crmName,
            })}
          </div>
          <div className={settingsStyles.description}>
            {t("settings.crm.syncData.syncAndImportContactDesc", {
              crm: crmName,
            })}
          </div>
        </div>
        <div className={settingsStyles.buttonWrapper}>
          <Link to={twoWaysSyncPath}>
            <Button primary>{t("settings.crm.button.manage")}</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
