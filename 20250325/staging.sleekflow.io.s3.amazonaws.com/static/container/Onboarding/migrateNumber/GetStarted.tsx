import React, { useContext } from "react";
import { MigrateBspHeader } from "./MigrateBspHeader";
import styles from "./GetStarted.module.css";
import { useTranslation } from "react-i18next";
import { Checkbox } from "semantic-ui-react";
import { MigrateNumberContext } from "./MigrateNumberContext";

export const GetStarted = () => {
  const { t } = useTranslation();
  const migrateNumberContext = useContext(MigrateNumberContext);
  return (
    <div className={styles.container}>
      <MigrateBspHeader
        title={t("guideContainer.migrateNumber.getStarted.title")}
        description={t("guideContainer.migrateNumber.getStarted.description")}
      />
      <div className={styles.subHeader}>
        {t("guideContainer.migrateNumber.getStarted.subHeader")}
      </div>
      <ul className={styles.list}>
        <li>{t("guideContainer.migrateNumber.getStarted.list.turnoff")}</li>
        <div className={styles.disableInstruction}>
          {t("guideContainer.migrateNumber.getStarted.hint")}
        </div>
        <li>{t("guideContainer.migrateNumber.getStarted.list.sameAccount")}</li>
        <li>{t("guideContainer.migrateNumber.getStarted.list.verified")}</li>
        <li>{t("guideContainer.migrateNumber.getStarted.list.confirm")}</li>
      </ul>
      <div className={styles.checkboxWrapper}>
        <Checkbox
          label={t("guideContainer.migrateNumber.getStarted.checkbox")}
          checked={migrateNumberContext.isCompleted}
          onChange={() =>
            migrateNumberContext.dispatch({
              type: "SET_IS_TURN_OFF_PIN",
              isCompleted: !migrateNumberContext.isCompleted,
            })
          }
        />
      </div>
    </div>
  );
};
