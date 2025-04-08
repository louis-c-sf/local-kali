import React, {
  ReactNode,
  RefObject,
  useLayoutEffect,
  useState,
  useRef,
} from "react";
import { Placement } from "@popperjs/core";
import { Portal, Ref } from "semantic-ui-react";
import { findClosestParent } from "../../../utility/dom";
import { identical } from "ramda";
import useSetPopper from "./hooks/useSetPopper";
import { positionClassMap } from "./types/positionClassMap";
import { isFunction } from "../../../utility/function";

export function InfoTooltipClick(props: {
  trigger: JSX.Element;
  placement: Placement;
  children:
    | ((setIsOpened: (isOpened: boolean) => void) => ReactNode)
    | ReactNode;
  className?: string;
  triggerRef?: RefObject<HTMLElement>;
}) {
  const {
    trigger,
    className,
    children,
    triggerRef,
    placement = "right",
  } = props;

  const [opened, setOpened] = useState(false);
  const { popperInst, popupNode, setPopupNode, triggerNode, setTriggerNode } =
    useSetPopper({ placement, triggerRef }, [opened]);
  const hideTimeoutRef = useRef<NodeJS.Timeout | undefined>();
  const showTimeoutRef = useRef<NodeJS.Timeout | undefined>();
  function resetHideTimeout() {
    hideTimeoutRef.current && clearTimeout(hideTimeoutRef.current);
  }
  function resetShowTimeout() {
    showTimeoutRef.current && clearTimeout(showTimeoutRef.current);
  }
  function cancelHiding() {
    // console.debug(`#pop ◀️ 🚩`, popupNode.innerText.substring(0, 5));
    resetHideTimeout();
  }
  useLayoutEffect(() => {
    // Set up mouse in/out in a separate effect
    if (!triggerNode) {
      return;
    }

    function clickOutside(e: MouseEvent) {
      const hoverTo = e.relatedTarget as HTMLElement;
      if (!(triggerNode && hoverTo)) {
        // console.debug(`#pop ◀️ ⛔️`, popupNode.innerText.substring(0, 5));
        return;
      }
      const isInsideTrigger = !!findClosestParent(
        hoverTo,
        identical(triggerNode)
      );
      const isToPopup =
        popupNode && !!findClosestParent(hoverTo, identical(popupNode));
      if (!isInsideTrigger && !isToPopup) {
        // console.debug(`#pop ◀️ ⏱`, popupNode.innerText.substring(0, 5));
        resetHideTimeout();
        hideTimeoutRef.current = setTimeout(() => {
          // console.debug(`#pop ◀️ 🏁`, popupNode.innerText.substring(0, 5));
          setOpened(false);
          popupNode?.classList.add("invisible");
          resetShowTimeout();
        }, 100);
      }
    }

    function clickIcon(e: MouseEvent) {
      e.stopPropagation();
      popupNode?.classList.remove("invisible");
      setOpened(true);
    }
    triggerNode.addEventListener("mouseover", clickIcon);
    triggerNode.addEventListener("mouseout", clickOutside);
    triggerNode.addEventListener("click", clickIcon);
    popupNode?.addEventListener("mouseover", cancelHiding);
    popupNode?.addEventListener("mouseout", clickOutside);
    return () => {
      triggerNode.removeEventListener("click", clickIcon);
      triggerNode.removeEventListener("mouseout", clickOutside);
      triggerNode.removeEventListener("mouseover", clickIcon);
      popupNode?.removeEventListener("mouseover", cancelHiding);
      popupNode?.removeEventListener("mouseout", clickOutside);
    };
  }, [triggerNode, popupNode]);

  useLayoutEffect(() => {
    if (!triggerNode || !popupNode || !opened || !popperInst) {
      return;
    }
    popperInst.update();
  }, [placement, opened, popperInst, triggerNode, popupNode, children]);

  const positionClass = positionClassMap[placement] ?? "no-arrow";

  const visibleClass = opened ? "visible" : "invisible";

  if (null === children) {
    return trigger;
  }

  return (
    <>
      <Ref
        innerRef={(node: HTMLElement) => {
          if (triggerRef) {
            setTriggerNode(triggerRef.current);
          } else {
            setTriggerNode(node);
          }
        }}
      >
        {trigger}
      </Ref>
      <Portal open={opened} mountNode={document.body}>
        <div
          className={`ui popup info-tooltip ${
            className ?? ""
          } ${visibleClass} ${positionClass}`}
          ref={setPopupNode}
        >
          {isFunction(children) ? children(setOpened) : children}
        </div>
      </Portal>
    </>
  );
}
