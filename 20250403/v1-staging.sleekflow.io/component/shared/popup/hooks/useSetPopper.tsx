import React, { useLayoutEffect, useState, RefObject } from "react";
import { createPopper, Placement, Instance } from "@popperjs/core";

export const useSetPopper = (
  props: {
    placement?: Placement;
    triggerRef?: RefObject<HTMLElement>;
    offset?: [number, number];
    event?: string;
  },
  dependencies: any[]
) => {
  const {
    placement = "right",
    triggerRef,
    offset = [0, 15],
    event = "focus",
  } = props;
  const [popperInst, setPopperInst] = useState<Instance>();
  const [popupNode, setPopupNode] = useState<HTMLElement | null>(null);
  const [triggerNode, setTriggerNode] = useState<HTMLElement | null>(
    triggerRef?.current ?? null
  );

  useLayoutEffect(() => {
    // Set up Popper
    if (!triggerNode || !popupNode) {
      return;
    }
    let popper = createPopper(triggerNode, popupNode, {
      placement,
      modifiers: [{ name: "offset", options: { offset } }],
    });
    const resetPopper = () => {
      popper.destroy();
      setPopperInst(undefined);
    };

    window.addEventListener(event, resetPopper);

    setPopperInst(popper);

    return () => {
      // console.debug(`#pop ⚙️ ⛔️`, popupNode.innerText.substring(0, 5));
      popper.destroy();
      window.removeEventListener(event, resetPopper);
    };
  }, [triggerNode, popupNode, ...dependencies]);

  return {
    popperInst,
    popupNode,
    setPopupNode,
    triggerNode,
    setTriggerNode,
  };
};
export default useSetPopper;
