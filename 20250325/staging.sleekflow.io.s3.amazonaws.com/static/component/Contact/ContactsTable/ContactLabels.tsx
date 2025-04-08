import React from "react";
import styles from "./ContactLabels.module.css";
import { ChatLabel } from "../../Chat/ChatLabel";
import { HashTagType } from "../../../types/ConversationType";
import { Popup } from "semantic-ui-react";

export function ContactLabels(props: { tags: HashTagType[]; limit: number }) {
  const { tags, limit } = props;
  const [tagsVisible, tagsOutstanding] = [
    tags.slice(0, limit),
    tags.slice(limit),
  ];

  return (
    <div className={styles.container}>
      {tagsVisible.length > 0 ? (
        <>
          {tagsVisible.map((tag, t) => (
            <ChatLabel tag={tag} key={t} size={"big"} />
          ))}
          {tagsOutstanding.length > 0 && (
            <LabelsPopup hashTagTypes={tagsOutstanding} />
          )}
        </>
      ) : (
        "-"
      )}
    </div>
  );
}

function LabelsPopup(props: { hashTagTypes: HashTagType[] }) {
  return (
    <Popup
      trigger={
        <span className={styles.counterLabel}>
          +{props.hashTagTypes.length}
        </span>
      }
      className={styles.popupWrap}
      openOnTriggerMouseEnter
      closeOnTriggerMouseLeave
      openOnTriggerClick={false}
    >
      <div className={styles.popup}>
        {props.hashTagTypes.map((tag) => (
          <span className={styles.label} key={tag.hashtag}>
            <ChatLabel tag={tag} key={tag.id} size={"big"} />
          </span>
        ))}
      </div>
    </Popup>
  );
}
