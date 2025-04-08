import React, { useCallback, useEffect, useState } from "react";
import { getWithExceptions } from "../../../../../api/apiRequest";
import { GET_FbIg_STATISTICS } from "../../../../../api/apiPath";
import { Trans, useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import styles from "./Statistics.module.css";
import ArrowBackIcon from "../../../../../assets/tsx/icons/ArrowBackIcon";
import { InfoTooltip } from "../../../../shared/popup/InfoTooltip";
import InfoIcon from "../../../../../assets/images/info_gray.svg";
import { Image } from "semantic-ui-react";
import { AutomationFormType } from "../../../../../types/AutomationActionType";
import { DefaultTabInfo, TabInfoType } from "./PostCommentTypes";

const Statistics = (props: {
  form: AutomationFormType;
  allowViewRuleHistory: boolean;
}) => {
  const { form, allowViewRuleHistory } = props;
  const { t } = useTranslation();
  const [data, setData] = useState<TabInfoType>(DefaultTabInfo);
  const getStatistics = useCallback(async () => {
    if (form.values.id) {
      const result = await getWithExceptions(
        GET_FbIg_STATISTICS.replace("{assignmentId}", form.values.id),
        { param: {} }
      );
      setData({
        sent: result.uniqueCommentNumber,
        newContact: {
          number: result.newContactNumber,
          percentage: result.newContactPercentage,
        },
        replied: {
          number: result.uniqueInboxContactNumber,
          percentage: result.uniqueInboxContactNumberPercentage,
        },
      });
    }
  }, [form.values.id]);

  useEffect(() => {
    if (form.values.id) {
      getStatistics();
    }
  }, [form.values.id]);

  return (
    <div className={`${styles.statistics} ui form section-panel`}>
      <div className={styles.title}>
        {t("automation.history.statistics.title")}
      </div>
      <ul className={styles.blocks}>
        <li className={styles.block}>
          <div className={styles.subTitle}>
            <span>
              {t("automation.history.statistics.blocks.sent.subTitle")}
            </span>
            <InfoTooltip
              placement={"right"}
              children={t("automation.history.statistics.blocks.sent.hint")}
              trigger={<Image src={InfoIcon} size={"mini"} />}
            />
          </div>
          <div className={styles.count}>{data.sent}</div>
        </li>
        <li className={styles.block}>
          <div className={styles.subTitle}>
            <span>
              {t("automation.history.statistics.blocks.newContact.subTitle")}
            </span>
            <InfoTooltip
              placement={"right"}
              children={
                <Trans
                  i18nKey={
                    "automation.history.statistics.blocks.newContact.hint"
                  }
                >
                  Total number of new contacts that do not have existing profile
                  on SleekFlow.
                  <br />% = New Contact / Total amount of Unique Comments x 100%
                </Trans>
              }
              trigger={<Image src={InfoIcon} size={"mini"} />}
            />
          </div>
          <div className={styles.count}>
            {data.newContact.number} ({data.newContact.percentage}%)
          </div>
        </li>
        <li className={styles.block}>
          <div className={styles.subTitle}>
            <span>
              {t("automation.history.statistics.blocks.replied.subTitle")}
            </span>
            <InfoTooltip
              placement={"right"}
              children={
                <Trans
                  i18nKey={"automation.history.statistics.blocks.replied.hint"}
                >
                  Total number of user replied the automated message via Inbox.
                  <br />% = Users Replied via Inbox / Unique Comments x 100%
                </Trans>
              }
              trigger={<Image src={InfoIcon} size={"mini"} />}
            />
          </div>
          <div className={styles.count}>
            {data.replied.number} ({data.replied.percentage}%)
          </div>
        </li>
      </ul>
      {allowViewRuleHistory && (
        <div className={styles.view}>
          <Link to={`/automations/history/${form.values.id}`}>
            {t("automation.buttons.viewRuleHistory")}
          </Link>
          <div className={styles.arrowIcon}>
            <ArrowBackIcon />
          </div>
        </div>
      )}
    </div>
  );
};
export default Statistics;
