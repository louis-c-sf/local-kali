import React, { useEffect, useRef, useState } from "react";
import styles from "./Banner.module.css";
import { Trans, useTranslation } from "react-i18next";
import InfoIcon from "../../../../../assets/tsx/icons/InfoIcon";
import { FacebookOTNStateDict } from "../../../models/FacebookOTNTypes";
import ModalWrapper from "./ModalWrapper";
import useSelectedChat from "lib/effects/useSelectedChat";
import { useAppSelector } from "AppRootContext";

export default function Banner(props: {
  pageId: string | undefined;
  fbReceiverId: string | undefined;
  conversationId: string | undefined;
}) {
  const { pageId, fbReceiverId, conversationId } = props;
  const { t } = useTranslation();
  const [openModal, setOpenModal] = useState<boolean>(false);
  const {
    bannerState: state,
    validToken,
    refreshFacebookOTNState,
  } = useAppSelector((s) => s.inbox.facebook.messageType);
  const { latestSystemMessage } = useSelectedChat(conversationId);
  const latestChatId = useRef("");

  useEffect(() => {
    if (
      !latestSystemMessage ||
      !latestSystemMessage.messageUniqueID ||
      latestChatId.current === ""
    )
      return;
    if (latestSystemMessage.messageUniqueID !== latestChatId.current) {
      refreshFacebookOTNState();
      latestChatId.current = latestSystemMessage.messageUniqueID;
    }
  }, [latestSystemMessage, refreshFacebookOTNState]);

  useEffect(() => {
    if (latestSystemMessage && latestChatId.current === "") {
      latestChatId.current = latestSystemMessage.messageUniqueID;
    }
  }, [latestSystemMessage]);

  return (
    <div
      className={`${styles.banner} ${
        state === FacebookOTNStateDict.within ? styles.within : styles.over
      }`}
    >
      <InfoIcon
        className={`${styles.infoIcon} ${
          state === FacebookOTNStateDict.within ? styles.within : styles.over
        } `}
      />
      {state === FacebookOTNStateDict.within ? (
        <>
          <span className={styles.description}>
            <Trans i18nKey={"chat.facebookOTN.banner.within"}>
              Conversations with replies <b>within 24</b> hours can create any
              type of message.
            </Trans>
          </span>
          <span className={styles.button} onClick={() => setOpenModal(true)}>
            {t("chat.facebookOTN.banner.button")}
          </span>
        </>
      ) : (
        <>
          <div className={styles.description}>
            <Trans
              i18nKey={"chat.facebookOTN.banner.over"}
              values={{ count: validToken }}
            >
              The last reply was over 24 hours ago. You can only send message
              with
              {{ validToken }} OTN token or with limited message tag.
            </Trans>
          </div>
          <a
            href="https://docs.sleekflow.io/messaging-channels/facebook-messenger/otn&tags"
            target="_blank"
            rel="noreferrer"
          >
            {t("chat.facebookOTN.banner.guide")}
          </a>
        </>
      )}
      {openModal && (
        <ModalWrapper
          onClose={() => setOpenModal(false)}
          pageId={pageId}
          fbReceiverId={fbReceiverId}
          conversationId={conversationId}
        />
      )}
    </div>
  );
}
