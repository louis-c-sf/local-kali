import React, { RefObject, useLayoutEffect, useState } from "react";
import { createPopper, Instance, Placement } from "@popperjs/core";
import { findClosestParent } from "../../../utility/dom";
import { identical } from "ramda";
import { isRef } from "../../../utility/isRef";

export function usePopperPopup<
  TAnchor extends HTMLElement,
  TPopup extends HTMLElement
>(
  props: {
    anchorRef: React.RefObject<TAnchor | null> | TAnchor | null;
    popupRef: React.RefObject<TPopup | null> | TPopup | null;
    placement: Placement;
    onClose?: () => void;
    onTriggerClick?: () => void;
    closeOnOutsideClick?: boolean;
    ignoreOutsideClickNodes?: Array<RefObject<Element | null> | Element | null>;
    offset?: [number, number];
  },
  dependencies: any[]
) {
  const {
    onClose,
    popupRef,
    anchorRef,
    placement,
    offset,
    closeOnOutsideClick = true,
    ignoreOutsideClickNodes = [],
    onTriggerClick,
  } = props;

  const [popper, setPopper] = useState<Instance>();

  const anchorNode: TAnchor | null = isRef(anchorRef)
    ? anchorRef.current
    : anchorRef;
  const popupNode: TPopup | null = isRef(popupRef)
    ? popupRef.current
    : popupRef;

  useLayoutEffect(() => {
    if (!anchorNode || !popupNode) {
      return;
    }
    let options: any = {
      placement,
    };
    if (offset) {
      options.modifiers = [
        {
          name: "offset",
          options: { offset },
        },
      ];
    }

    let pop: Instance | null = createPopper(
      anchorNode as Element,
      popupNode,
      options
    );

    document.addEventListener("click", closeHandler);
    setPopper(pop);

    return () => {
      pop?.destroy();
      pop = null;
      document.removeEventListener("click", closeHandler);
    };

    function closeHandler(e: MouseEvent) {
      const targetElement = e.target as HTMLElement;
      const popupElement = popupNode;
      const insideTrigger =
        targetElement.isConnected &&
        findClosestParent(targetElement, identical(anchorNode as Element));
      if (insideTrigger && onTriggerClick) {
        onTriggerClick();
      } else {
        const isOutsidePopup =
          targetElement.isConnected &&
          popupElement &&
          !findClosestParent(
            targetElement,
            identical(popupElement as HTMLElement)
          );
        if (isOutsidePopup && closeOnOutsideClick && onClose) {
          const clickedInIgnoredNode = ignoreOutsideClickNodes.some((node) => {
            const nodeObject = isRef(node) ? node.current : node;
            return (
              nodeObject &&
              Boolean(findClosestParent(targetElement, identical(nodeObject)))
            );
          });
          if (clickedInIgnoredNode) {
            return;
          }
          onClose();
        }
      }
    }
  }, [
    popupNode,
    anchorNode,
    closeOnOutsideClick,
    JSON.stringify(offset),
    placement,
    ...dependencies,
  ]);

  return {
    popper,
  };
}
