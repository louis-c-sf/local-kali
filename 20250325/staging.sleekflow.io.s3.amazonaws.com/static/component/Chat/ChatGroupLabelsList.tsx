import { HashTagType } from "../../types/ConversationType";
import React, { useState } from "react";
import { ChatLabel } from "./ChatLabel";
import { useHideOnResizeBehavior } from "../../lib/effects/useHideOnResizeBehavior";
import labelStyles from "./../shared/Labels.module.css";

export function ChatGroupLabelsList(props: { tags: HashTagType[] }) {
  const [counterElement, setCounterElement] = useState<HTMLElement | null>(
    null
  );
  const [wrapElement, setWrapElement] = useState<HTMLElement | null>(null);

  useHideOnResizeBehavior({
    withCounter: true,
    counterElement: counterElement ?? undefined,
    wrapElement,
    selectCollapsibleSiblings: (wrap) =>
      Array.from(wrap.querySelectorAll(".label")),
    hiddenClass: labelStyles.hidden,
  });

  return (
    <div className={`extra labels`} ref={setWrapElement}>
      {props.tags.map((tag, index) => (
        <ChatLabel tag={tag} key={`${tag.id}_index_${index}` ?? index} />
      ))}
      <div
        className={`${labelStyles.chatCounterLabel} ${labelStyles.hidden}`}
        ref={setCounterElement}
      />
    </div>
  );
}
