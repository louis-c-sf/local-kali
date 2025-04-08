import React, {
  ReactNode,
  RefObject,
  useLayoutEffect,
  useRef,
  useState,
  useEffect,
} from "react";
import { Placement } from "@popperjs/core";
import { findClosestParent } from "../../../utility/dom";
import { identical } from "ramda";
import { Portal, Ref } from "semantic-ui-react";
import useSetPopper from "./hooks/useSetPopper";
import { positionClassMap } from "./types/positionClassMap";
import iconStyles from "../Icon/Icon.module.css";

const HOVER_TIMEOUT = 500;

export function InfoTooltip(props: {
  trigger?: JSX.Element;
  placement: Placement;
  hoverable?: boolean;
  children?: ReactNode;
  className?: string;
  triggerRef?: RefObject<HTMLElement>;
  offset?: [number, number];
}) {
  const {
    trigger,
    className,
    children,
    triggerRef,
    placement,
    offset,
    hoverable = false,
  } = props;

  const [opened, setOpened] = useState(false);
  const hideTimeoutRef = useRef<NodeJS.Timeout | undefined>();
  const showTimeoutRef = useRef<NodeJS.Timeout | undefined>();
  const { popperInst, popupNode, setPopupNode, triggerNode, setTriggerNode } =
    useSetPopper({ placement, triggerRef, offset }, [opened]);

  function resetShowTimeout() {
    showTimeoutRef.current && clearTimeout(showTimeoutRef.current);
  }

  function resetHideTimeout() {
    hideTimeoutRef.current && clearTimeout(hideTimeoutRef.current);
  }

  useLayoutEffect(() => {
    // Set up mouse in/out in a separate effect
    if (!triggerNode) {
      return;
    }

    function hideNow() {
      resetShowTimeout();
      resetHideTimeout();
      popupNode?.classList.add("invisible");
      setOpened(false);
    }

    function startShowing(event: MouseEvent) {
      event.stopPropagation();
      hideTimeoutRef.current && clearTimeout(hideTimeoutRef.current);
      showTimeoutRef.current && clearTimeout(showTimeoutRef.current);
      popupNode?.classList.remove("invisible");
      showTimeoutRef.current = setTimeout(() => {
        setOpened(true);
      }, HOVER_TIMEOUT);
    }

    function startHiding(event: MouseEvent) {
      const hoverTo = event.relatedTarget as HTMLElement;
      if (!(triggerNode && hoverTo)) {
        return;
      }
      const isInsideTrigger = !!findClosestParent(
        hoverTo,
        identical(triggerNode as HTMLElement)
      );
      const isToPopup =
        popupNode &&
        !!findClosestParent(hoverTo, identical(popupNode as HTMLElement));

      if (!isInsideTrigger && !(hoverable && isToPopup)) {
        resetHideTimeout();
        hideTimeoutRef.current = setTimeout(() => {
          setOpened(false);
          popupNode?.classList.add("invisible");
          resetShowTimeout();
        }, 100);
      }
    }

    function cancelHiding() {
      resetHideTimeout();
    }

    triggerNode.addEventListener("mouseover", startShowing);
    triggerNode.addEventListener("mouseout", startHiding);
    triggerNode.addEventListener("click", hideNow);
    const styleOriginalVal =
      triggerNode.style.getPropertyValue("pointer-events");
    const styleOriginalPrty =
      triggerNode.style.getPropertyPriority("pointer-events");
    triggerNode.style.setProperty("pointer-events", "all", "important");

    if (hoverable) {
      popupNode?.addEventListener("mouseover", cancelHiding);
      popupNode?.addEventListener("mouseout", startHiding);
    }

    return () => {
      triggerNode.removeEventListener("mouseover", startShowing);
      triggerNode.removeEventListener("click", hideNow);
      triggerNode.removeEventListener("mouseout", startHiding);
      triggerNode.style.setProperty(
        "pointer-events",
        styleOriginalVal,
        styleOriginalPrty
      );

      if (hoverable) {
        popupNode?.removeEventListener("mouseover", cancelHiding);
        popupNode?.removeEventListener("mouseout", startHiding);
      }
    };
  }, [triggerNode, popupNode, hoverable]);

  useEffect(() => {
    if (!triggerNode || !popupNode || !opened || !popperInst) {
      return;
    }
    popperInst.update();
  }, [placement, opened, popperInst, triggerNode, popupNode, children]);

  const positionClass = positionClassMap[placement] ?? "no-arrow";

  const visibleClass = opened ? "visible" : "invisible";

  if (null === children) {
    return trigger ?? null;
  }

  return (
    <>
      <Ref
        innerRef={(node: HTMLElement) => {
          setTriggerNode(triggerRef ? triggerRef.current : node);
        }}
      >
        {trigger ?? <i className={`${iconStyles.icon} ${iconStyles.info}`} />}
      </Ref>
      <Portal open={opened} mountNode={document.body}>
        <div
          className={`ui popup info-tooltip ${
            className ?? ""
          } ${visibleClass} ${positionClass}`}
          ref={setPopupNode}
        >
          {children}
        </div>
      </Portal>
    </>
  );
}
