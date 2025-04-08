import { FacebookAdExtendedMessagePayloadType } from "types/MessageType";
import styles from "component/Chat/Records/MessageRecord/FacebookAdMessage.module.css";
import { AdMessageGeneric } from "component/Chat/Records/MessageRecord/AdMessageGeneric";
import MessageContent from "component/Chat/Records/MessageContent";
import React from "react";
import { TFunction } from "i18next";

export function FacebookAdMessage(props: {
  t: TFunction;
  payload: Exclude<
    FacebookAdExtendedMessagePayloadType["facebookAdClickToMessengerObject"],
    undefined
  >;
  userId: string;
  pickingMessagesActive: boolean;
}): JSX.Element | null {
  return (
    <div className={styles.root}>
      <div className={styles.source}>
        {props.t("chat.message.ad.fromMetaAd")}
      </div>
      <div className={styles.message}>
        <AdMessageGeneric
          title={props.payload.ad_title}
          body={props.payload.ad_text}
          sourceId={props.payload.ad_id}
          url={props.payload.ad_permalink_url}
        />
      </div>
      <MessageContent message={props.payload.message} />
    </div>
  );
}
