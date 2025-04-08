import React, { useContext } from "react";
import demoStyles from "./InboxDemo.module.css";
import styles from "./DemoStart.module.css";
import BadgeTag from "../../../shared/BadgeTag/BadgeTag";
import InboxDemoContext from "./inboxDemoContext";
import postDemoMessage from "api/Onboarding/postDemoMessage";
import fetchInboxDemoConversation from "api/Onboarding/fetchInboxDemoConversation";
import { Trans, useTranslation } from "react-i18next";
import MobileInterface from "./MobileInterface";

export default function DemoStart() {
  const { demoDispatch, conversations, loading } = useContext(InboxDemoContext);
  const firstConversation = conversations[0];
  const { t } = useTranslation();

  async function handleSendMsg(message: string) {
    const id = firstConversation.chatHistory[0].demoConversationId;
    try {
      await postDemoMessage(
        firstConversation.chatHistory[0].channel,
        id,
        message,
        false
      );
      const conversation = await fetchInboxDemoConversation(id);
      demoDispatch({ type: "SEND_CUSTOMER_MESSAGE", conversation });
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="main getting-started">
      <div className="main-content">
        <div className={demoStyles.mainContent}>
          <div className={`${demoStyles.cardWrapper} ${styles.cardWrapper}`}>
            <div className={`container ${demoStyles.card}`}>
              <div className={demoStyles.title}>
                {t("onboarding.inboxDemo.demoStart.title")}
              </div>
              <div className={demoStyles.desc}>
                <Trans i18nKey="onboarding.inboxDemo.demoStart.description">
                  Type something on the textbox and press
                  <BadgeTag
                    noMargins
                    compact
                    className={styles.enter}
                    text={"Enter"}
                  />
                  Key
                </Trans>
              </div>
            </div>
          </div>
          <MobileInterface
            loading={loading}
            firstConversation={firstConversation}
            enableKeyIn
            handleSendMsg={handleSendMsg}
          />
        </div>
      </div>
    </div>
  );
}
