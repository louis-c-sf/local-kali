import React, { useContext } from "react";
import styles from "./SentMessage.module.css";
import demoStyles from "./InboxDemo.module.css";
import { Image } from "semantic-ui-react";
import { Button } from "../../../shared/Button/Button";
import { useTranslation } from "react-i18next";
import iconStyles from "../../../shared/Icon/Icon.module.css";
import InstagramIcon from "../../../../assets/images/channels/Instagram.svg";
import WechatIcon from "../../../../assets/images/channels/wechat.svg";
import LineIcon from "../../../../assets/images/channels/line.svg";
import MessengerIcon from "../../../../assets/images/channels/facebook-messenger.svg";
import InboxDemoContext from "./inboxDemoContext";
import MobileInterface from "./MobileInterface";

export default function DemoStart() {
  const { demoDispatch, conversations, loading } = useContext(InboxDemoContext);
  const firstConversation = conversations[0];
  const { t } = useTranslation();

  function handleGoToInbox() {
    demoDispatch({ type: "GO_TO_MOCK_INBOX" });
  }

  return (
    <div className="main getting-started">
      <div className="main-content">
        <div className={demoStyles.mainContent}>
          <div className={`${demoStyles.cardWrapper} ${styles.cardWrapper}`}>
            <div className={`container ${demoStyles.card}`}>
              <div className={demoStyles.title}>
                {t("onboarding.inboxDemo.sentMessage.title")}
              </div>
              <div className={demoStyles.desc}>
                {t("onboarding.inboxDemo.sentMessage.description")}
              </div>
              <div className={styles.nextStepBtn}>
                <Button customSize="mid" primary onClick={handleGoToInbox}>
                  {t("onboarding.inboxDemo.buttons.goToInbox")}
                </Button>
              </div>
            </div>
            <div className={styles.tips}>
              <div className={styles.tipsIconWrapper}>
                <span className={`${iconStyles.icon} ${styles.tipsIcon}`} />
              </div>
              <div className={styles.tipsContent}>
                <div className={styles.tipsDesc}>
                  {t("onboarding.inboxDemo.sentMessage.tips")}
                </div>
                <div className={`${styles.channelWrapper} ${styles.messenger}`}>
                  <Image src={MessengerIcon} className={styles.channelIcon} />
                </div>
                <div className={`${styles.channelWrapper} ${styles.instagram}`}>
                  <Image src={InstagramIcon} className={styles.channelIcon} />
                </div>
                <div className={`${styles.channelWrapper} ${styles.wechat}`}>
                  <Image src={WechatIcon} className={styles.channelIcon} />
                </div>
                <div className={`${styles.channelWrapper} ${styles.line}`}>
                  <Image src={LineIcon} className={styles.channelIcon} />
                </div>
              </div>
            </div>
          </div>
          <MobileInterface
            loading={loading}
            firstConversation={firstConversation}
          />
        </div>
      </div>
    </div>
  );
}
