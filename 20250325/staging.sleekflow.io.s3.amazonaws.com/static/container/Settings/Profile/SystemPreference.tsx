import React from "react";
import { Trans, useTranslation } from "react-i18next";
import { Dimmer, Form, Loader, Radio } from "semantic-ui-react";
import styles from "./SystemPreference.module.css";
import iconStyles from "../../../component/shared/Icon/Icon.module.css";
import { VersionDic, VersionType } from "./types";
import mixpanel from "mixpanel-browser";
export const SystemPreference = (props: {
  selectedVersion: VersionType;
  setSelectedVersion: (version: VersionType) => void;
  loading: boolean;
}) => {
  const { t } = useTranslation();
  const { selectedVersion, setSelectedVersion, loading } = props;

  const handleVersionChange = (version: VersionType) => () => {
    mixpanel.track("Version Switched", { "To Version": `Web ${version}` });
    setSelectedVersion(version);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        {t("account.systemPreference.header")}
      </div>
      <div className={styles.description}>
        {t("account.systemPreference.description")}
      </div>
      <Form className={styles.content}>
        {loading ? (
          <Dimmer active inverted>
            <Loader inverted></Loader>
          </Dimmer>
        ) : (
          <>
            <Form.Field className={styles.selectionCard}>
              <div className={styles.titleWrapper}>
                <Radio
                  label={t("account.systemPreference.selections.v2.label")}
                  value={VersionDic.v2}
                  checked={selectedVersion === VersionDic.v2}
                  onChange={handleVersionChange(VersionDic.v2)}
                />
                <span className={styles.versionTag}>
                  {t("account.systemPreference.selections.v2.version")}
                </span>
              </div>
              <ul>
                <li>
                  <span className={`${iconStyles.icon} ${styles.tickIcon}`} />
                  {t(
                    "account.systemPreference.selections.v2.description.inbox"
                  )}
                </li>
                <li>
                  <span className={`${iconStyles.icon} ${styles.tickIcon}`} />

                  {t(
                    "account.systemPreference.selections.v2.description.contact"
                  )}
                </li>
                <li>
                  <span className={`${iconStyles.icon} ${styles.tickIcon}`} />

                  {t(
                    "account.systemPreference.selections.v2.description.broadcast"
                  )}
                </li>
                <li>
                  <span className={`${iconStyles.icon} ${styles.tickIcon}`} />

                  {t(
                    "account.systemPreference.selections.v2.description.automation"
                  )}
                </li>
              </ul>
            </Form.Field>
            <Form.Field className={styles.selectionCard}>
              <Radio
                label={t("account.systemPreference.selections.v1.label")}
                value={VersionDic.v1}
                checked={selectedVersion === VersionDic.v1}
                onChange={handleVersionChange(VersionDic.v1)}
              />
              <ul>
                <li>
                  <span className={`${iconStyles.icon} ${styles.tickIcon}`} />

                  {t(
                    "account.systemPreference.selections.v1.description.classic"
                  )}
                </li>
              </ul>
            </Form.Field>
          </>
        )}
      </Form>
      <div className={styles.hint}>
        <Trans i18nKey={"account.systemPreference.hint"}>
          Click
          <a href="https://sleekflow.io/v2" target="_blank" rel="noreferrer">
            here
          </a>
          to learn more about SleekFlow 2.0.
        </Trans>
      </div>
    </div>
  );
};
