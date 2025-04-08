import React, { ReactNode } from "react";
import styles from "./WhatsappQuickReplyRecord.module.css";
import { MessageRecordBaseProps } from "component/Chat/Records/MessageRecord/MessageRecordBase";
import { WhatsappTemplateComponentButtonType } from "types/WhatsappTemplateResponseType";
import MessageRecord from "component/Chat/Records/MessageRecord";
import { Button } from "component/shared/Button/Button";
import { withLoop } from "utility/array";
import { Icon } from "component/shared/Icon/Icon";

export function WhatsappQuickReplyRecord(
  props: MessageRecordBaseProps & {
    buttons: WhatsappTemplateComponentButtonType[];
    pickingMessagesActive: boolean;
    userId: string;
    children: ReactNode;
  }
): JSX.Element | null {
  function getIcon(btn: WhatsappTemplateComponentButtonType) {
    if (btn.type.toLowerCase() === "url") {
      return <Icon type={"extLinkBlue"} colored />;
    }
  }

  return (
    <MessageRecord
      message={props.message}
      senderName={props.senderName}
      senderPic={props.senderPic}
      isShowIcon={props.isShowIcon}
      channelTitle={props.channelTitle}
      channelTypeName={props.channelTypeName}
      t={props.t}
      setContentHeight={props.setContentHeight}
      messageClasses={[]}
      parentHeight={props.parentHeight}
      profile={props.profile}
      onHeightChange={props.onHeightChange}
      disabledHover={props.disabledHover}
      pickingMessagesActive={props.pickingMessagesActive}
      userId={props.userId}
      beforeContent={props.beforeContent}
      afterContent={
        <div
          className={`
              ${styles.buttons}
              ${props.buttons.length === 3 ? styles.three : styles.any} 
            `}
        >
          {props.buttons.map(
            withLoop((btn, i, _, { isLast }) => (
              <Button
                key={btn.text}
                centerText
                content={
                  <>
                    {btn.text} {getIcon(btn)}
                  </>
                }
                className={`${styles.button} ${isLast ? styles.last : ""}`}
              />
            ))
          )}
        </div>
      }
    >
      <>
        <div className={"message-content"}>{props.children}</div>
      </>
    </MessageRecord>
  );
}
