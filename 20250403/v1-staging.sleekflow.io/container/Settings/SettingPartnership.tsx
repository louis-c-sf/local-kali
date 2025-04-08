import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Dimmer, Divider, Header, Loader, Table } from "semantic-ui-react";
import styles from "./SettingPartnership.module.css";
import settingStyles from "./Setting.module.css";
import { Button } from "../../component/shared/Button/Button";
import iconStyles from "../../component/shared/Icon/Icon.module.css";
import fetchPartnerStatus from "../../api/User/fetchPartnerStatus";
import fetchPartnerCommission from "../../api/User/fetchPartnerCommission";
import { CommissionType } from "../../types/PartnershipType";
import { useFlashMessageChannel } from "../../component/BannerMessage/flashBannerMessage";

export default function ScheduleDemoSuccessContainer() {
  const { t } = useTranslation();
  const [isPartner, setIsPartner] = useState<boolean>(false);
  const [commission, setCommission] = useState<CommissionType | undefined>();
  const flash = useFlashMessageChannel();

  useEffect(() => {
    async function getStatus() {
      try {
        const status = await fetchPartnerStatus();
        setIsPartner(status.isRewardfulUser);
      } catch (error) {
        console.log("fetchPartnerStatus", error);
      }
    }

    getStatus();
  }, []);

  useEffect(() => {
    async function getCommission() {
      try {
        const detail = await fetchPartnerCommission();
        setCommission(detail);
      } catch (error) {
        console.log(error);
      }
    }

    if (isPartner) {
      getCommission();
    } else {
      setCommission(undefined);
    }
  }, [isPartner]);

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text).then(
      function () {
        flash(t("settings.partnership.copySuccess"));
      },
      function (err) {
        console.error("copy text error", err);
      }
    );
  }

  return (
    <div className={settingStyles.content}>
      <div className={settingStyles.hideScrollableTable}>
        <div className={settingStyles.container}>
          <div className={`${settingStyles.header}`}>
            <Header as="h1" content={t("settings.partnership.header")} />
          </div>
          <Divider />
          {isPartner ? (
            <Dimmer.Dimmable>
              <div className={styles.content}>
                {!commission ? (
                  <Dimmer active={true} inverted>
                    <Loader active />
                  </Dimmer>
                ) : (
                  <>
                    <p className={styles.desc}>
                      {t("settings.partnership.referCommission")}
                    </p>
                    <div className={styles.block}>
                      <div className={styles.blockTitle}>
                        {t("settings.partnership.linkTitle")}
                      </div>
                      <div className={styles.linkTableWrapper}>
                        <Table singleLine className={styles.linkTable}>
                          <Table.Header>
                            <Table.Row>
                              <Table.HeaderCell
                                className={`${styles.linkTableHeader} ${styles.first}`}
                              >
                                {t("settings.partnership.linkToken")}
                              </Table.HeaderCell>
                              <Table.HeaderCell
                                className={`${styles.linkTableHeader} ${styles.last}`}
                              >
                                {t("settings.partnership.linkUrl")}
                              </Table.HeaderCell>
                            </Table.Row>
                          </Table.Header>
                          <Table.Body>
                            {commission.links.map((link) => (
                              <Table.Row key={link.token}>
                                <Table.Cell
                                  className={`${styles.linkTableCell} ${styles.first}`}
                                >
                                  {link.token}
                                </Table.Cell>
                                <Table.Cell
                                  className={`${styles.linkTableCell} ${styles.last}`}
                                >
                                  <a href={link.url} rel="noreferrer noopener">
                                    {link.url}
                                  </a>
                                  <Button
                                    customSize="mid"
                                    className={styles.copyButton}
                                    onClick={() => handleCopy(link.url)}
                                  >
                                    {t("settings.partnership.button.copy")}
                                  </Button>
                                </Table.Cell>
                              </Table.Row>
                            ))}
                          </Table.Body>
                        </Table>
                      </div>
                    </div>
                    <div className={styles.block}>
                      <div className={styles.blockTitle}>
                        {t("settings.partnership.overviewTitle")}
                      </div>
                      <div className={`container ${styles.commissionBlock}`}>
                        <div className={styles.commissionTitle}>
                          {t("settings.partnership.commissionTitle")}
                        </div>
                        <div
                          className={styles.commissionValue}
                        >{`${commission.commission.total.currency}$ ${commission.commission.total.value}`}</div>
                      </div>
                      <p className={styles.commissionDesc}>
                        {t("settings.partnership.commissionDesc")}
                      </p>
                      <Button
                        primary
                        customSize="mid"
                        className={`${styles.button}`}
                        target="_blank"
                        as="a"
                        href="https://app.tolt.io/"
                        rel="noreferrer noopener"
                      >
                        {t("settings.partnership.button.loginRewardful")}
                        <span
                          className={`${iconStyles.icon} ${styles.exitIcon}`}
                        />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </Dimmer.Dimmable>
          ) : (
            <div className={styles.content}>
              <h2>{t("settings.partnership.subHeader")}</h2>
              <p className={styles.desc}>
                {t("settings.partnership.becomePartner")}
              </p>
              <ul className={styles.list}>
                <li className={styles.checkedItem}>
                  {t("settings.partnership.listItem1")}
                </li>
                <li className={styles.checkedItem}>
                  {t("settings.partnership.listItem2")}
                </li>
                <li className={styles.checkedItem}>
                  {t("settings.partnership.listItem3")}
                </li>
              </ul>
              <Button
                primary
                customSize="mid"
                className={`${styles.button}`}
                target="_blank"
                as="a"
                href="https://sleekflow.io/partner/affiliate"
                rel="noreferrer noopener"
              >
                {t("settings.partnership.button.becomePartner")}
                <span className={`${iconStyles.icon} ${styles.exitIcon}`} />
              </Button>
              <div className={styles.tips}>
                <div className={styles.tipsTitle}>
                  {t("settings.partnership.tipsTitle")}
                  <span className={`${iconStyles.icon} ${styles.tipsIcon}`} />
                </div>
                <p>{t("settings.partnership.tipContent")}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
