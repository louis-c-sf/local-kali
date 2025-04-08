import React, { useContext } from "react";
import styles from "./Settings.module.css";
import { useTranslation } from "react-i18next";
import { UserProfileGroupType } from "../../../container/Contact/Imported/UserProfileGroupType";
import { prop } from "ramda";
import BroadcastContext from "../BroadcastContext";
import { ChannelLabel } from "./ChannelLabel";
import { useAppSelector } from "AppRootContext";
import moment from "moment";

export function Settings(props: {
  isDisplayWhatsAppWarning: boolean;
  isDisplayOfficialAPIWarning: boolean;
  isIncludedChatAPI: boolean;
  recipientsCount: number;
  lists: UserProfileGroupType[];
}) {
  const {
    isDisplayWhatsAppWarning,
    isDisplayOfficialAPIWarning,
    recipientsCount,
    isIncludedChatAPI,
  } = props;
  const { name, channelsWithIds, channelWithId, scheduledAt } =
    useContext(BroadcastContext);

  const { lists } = props;
  const { t } = useTranslation();
  const selectedTimeZone = useAppSelector((s) => s.selectedTimeZone);
  const listNames = lists.map(prop("importName")).join(", ");

  return (
    <div>
      <div className={styles.title}>{t("broadcast.edit.sidebar.title")}</div>
      <div className={styles.subtitle}>{t("broadcast.edit.confirm.intro")}</div>
      <div className={styles.grid}>
        <div className={styles.gridLabel}>
          {t("broadcast.edit.field.title.label")}
        </div>
        <div className={styles.gridValue}>{name}</div>
        <div className={styles.gridLabel}>
          {t("broadcast.edit.field.addChannels.label")}
        </div>
        <div className={styles.gridValue}>
          {channelsWithIds.map((ch, i) => (
            <ChannelLabel channel={ch} key={`${ch.channel}/${i}`} />
          ))}
        </div>
        {channelWithId && (
          <>
            <div className={styles.gridLabel}>
              {t("broadcast.edit.field.channel.label")}
            </div>

            <div className={styles.gridValue}>
              <ChannelLabel channel={channelWithId} />
            </div>
          </>
        )}
        <div className={styles.gridLabel}>
          {t("broadcast.edit.field.lists.label")}
        </div>
        <div className={styles.gridValue}>{recipientsCount}</div>
        <div className={styles.gridLabel}>
          {t("broadcast.edit.confirm.grid.list")}
        </div>
        <div className={styles.gridValue}>
          {lists.map((l) => l.importName).join()}
        </div>
        <div className={styles.gridLabel}>
          {t("broadcast.edit.field.schedule.label")}
        </div>
        <div className={styles.gridValue}>
          {scheduledAt
            ? moment(scheduledAt)
                .utcOffset(selectedTimeZone)
                .format("DD/MM/yyyy h:mm a")
            : t("broadcast.send.option.immediately")}
        </div>
      </div>
      {/*{isDisplayWhatsAppWarning
        && <StatusAlert className="center" type="warning">
          <>
            {
              isDisplayOfficialAPIWarning
              && <WhatsAppChannelWarning
                header={t("broadcast.edit.confirm.official.warning.header")}
                content={<Trans
                  i18nKey={"broadcast.edit.confirm.official.warning.content"}>
                  Messages will be sent to more than 1000 recipients, which might exceed
                  the
                  <a
                    target="_blank"
                    className="link" rel="noreferrer noopener"
                    href="https://support.twilio.com/hc/en-us/articles/360024008153-WhatsApp-Rate-Limiting">
                    WhatsApp daily rate limit
                  </a>
                </Trans>}/>
            }
            {
              isIncludedChatAPI
              && <WhatsAppChannelWarning
                header={t("broadcast.edit.confirm.chatapi.warning.header")}
                content={<Trans
                  i18nKey={"broadcast.edit.confirm.chatapi.warning.content"}>
                  Messages will be sent with a <span
                  className="bold">10-second interval</span> to avoid account suspension
                </Trans>}
              />
            }
          </>
        </StatusAlert>
      }*/}
    </div>
  );
}

function WhatsAppChannelWarning(props: {
  header: string;
  content: React.ReactElement;
}) {
  return (
    <div className="channel-warning">
      <div className="header">{props.header}:</div>
      <div className="content">{props.content}</div>
    </div>
  );
}
