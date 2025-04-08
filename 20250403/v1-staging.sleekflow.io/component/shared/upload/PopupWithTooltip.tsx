import React, { ReactElement, useLayoutEffect, useRef, useState } from "react";
import { findClosestParent } from "../../../utility/dom";
import { Portal, Ref } from "semantic-ui-react";
import { createPopper, Instance, Placement } from "@popperjs/core";
import { identical } from "ramda";
import { InfoTooltip } from "../popup/InfoTooltip";

export function PopupWithTooltip(props: {
  tooltipClassName?: string;
  tooltipText: string;
  tooltipPosition: Placement;
  tooltipOffset?: [number, number];
  tooltipTrigger: ReactElement;
  popupOffset?: [number, number];
  popupPositionPivot?: HTMLElement | null;
  popupClassName?: string;
  popupFlowing?: boolean;
  renderPopup: (closePopup: () => void) => JSX.Element;
}) {
  const [showPopup, setShowPopup] = useState(false);
  const [popupWindowNode, setPopupWindowNode] = useState<HTMLElement | null>(
    null
  );
  const [triggerNode, setTriggerNode] = useState<HTMLElement | null>(null);
  const [popper, setPopper] = useState<Instance | null>(null);

  const {
    popupOffset,
    popupPositionPivot,
    tooltipTrigger,
    tooltipText,
    tooltipPosition,
    renderPopup,
    tooltipClassName,
    popupClassName,
  } = props;

  useLayoutEffect(() => {
    const clickListener = (event: MouseEvent) => {
      const insideTrigger = findClosestParent(
        event.target as HTMLElement,
        identical(triggerNode)
      );
      event.stopPropagation();
      if (Boolean(insideTrigger)) {
        setShowPopup(!showPopup);
      } else {
        const insidePopup = findClosestParent(
          event.target as HTMLElement,
          identical(popupWindowNode)
        );
        if (!insidePopup) {
          setShowPopup(false);
        }
      }
    };
    document.addEventListener("click", clickListener);

    return () => {
      document.removeEventListener("click", clickListener);
    };
  }, [showPopup, popupWindowNode, triggerNode]);

  useLayoutEffect(() => {
    const pivot = popupPositionPivot ? popupPositionPivot : triggerNode;
    if (showPopup && popupWindowNode && pivot) {
      let modifiers = [];
      if (popupOffset) {
        modifiers.push({ name: "offset", options: { offset: popupOffset } });
      }
      const popper = createPopper(pivot, popupWindowNode, {
        placement: "top-start",
        modifiers: modifiers,
      });
      setPopper(popper);
    }
  }, [showPopup, popupWindowNode, popupPositionPivot, triggerNode]);

  function closePopup() {
    setShowPopup(false);
    setPopupWindowNode(null);
    popper?.destroy();
    setPopper(null);
  }

  return (
    <>
      <InfoTooltip
        className={tooltipClassName}
        placement={tooltipPosition}
        children={tooltipText}
        offset={props.tooltipOffset}
        trigger={<Ref innerRef={setTriggerNode}>{tooltipTrigger}</Ref>}
      />
      {showPopup && (
        <Portal open={true} mountNode={document.body}>
          <div
            className={`
            ui popup visible dialog ${popupClassName ?? ""}
              ${props.popupFlowing ? "flowing" : ""}
            `}
            ref={setPopupWindowNode}
          >
            {renderPopup(closePopup)}
          </div>
        </Portal>
      )}
    </>
  );
}
