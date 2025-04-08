import { WhatsappAdClickPayloadType } from "types/MessageType";
import styles from "../FacebookAdMessage.module.css";
import { AdMessageGeneric } from "../AdMessageGeneric";
import React from "react";
import { TFunction } from "i18next";

export function WhatsappAdMessage(props: {
  payload: Exclude<WhatsappAdClickPayloadType, undefined>;
  t: TFunction;
}): JSX.Element | null {
  return (
    <div className={styles.root}>
      <div className={styles.source}>
        {props.t("chat.message.ad.fromMetaAd")}
      </div>
      <div className={styles.message}>
        <AdMessageGeneric
          title={props.payload.headline}
          body={props.payload.body ?? null}
          sourceId={props.payload.source_id}
          url={props.payload.source_url}
        />
      </div>
    </div>
  );
}
