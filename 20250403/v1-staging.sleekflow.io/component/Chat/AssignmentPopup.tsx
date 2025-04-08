import React, { useState } from "react";
import { usePopperPopup } from "../shared/popup/usePopperPopup";
import { Portal } from "semantic-ui-react";
import { Placement } from "@popperjs/core";

export function AssignmentPopup(props: {
  opened: boolean;
  setOpened: (opened: boolean) => void;
  anchorNode: HTMLElement | null;
  children: React.ReactChild;
  className?: string;
  offset: [number, number];
  placement?: Placement;
  mountNode?: HTMLElement | null;
}) {
  const {
    opened,
    setOpened,
    anchorNode,
    offset,
    placement = "bottom-end",
    mountNode,
  } = props;
  const [popupNode, setPopupNode] = useState<HTMLElement | null>(null);

  usePopperPopup(
    {
      popupRef: popupNode,
      anchorRef: anchorNode,
      onClose: () => setOpened(false),
      onTriggerClick: () => setOpened(!opened),
      placement,
      offset,
      closeOnOutsideClick: true,
    },
    [opened, popupNode, anchorNode]
  );

  return (
    <Portal open mountNode={mountNode || document.body}>
      <div
        className={`ui popup dialog compact collapsible-teams ${
          opened ? "visible" : ""
        } ${props.className}`}
        ref={setPopupNode}
      >
        {props.children}
      </div>
    </Portal>
  );
}
