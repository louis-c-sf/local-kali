import React, { useEffect } from "react";
import { findClosestParent } from "../../../utility/dom";

export function useCloseOnClickOutside(props: {
  wrapRef: React.RefObject<HTMLElement | null>;
  onClose: () => void;
  isOpened: boolean;
}) {
  const { wrapRef, onClose, isOpened } = props;

  useEffect(() => {
    if (!wrapRef.current) {
      return;
    }
    const clickListener = (event: Event) => {
      const clickedElement = event.target as HTMLElement;
      if (!clickedElement) {
        return;
      }
      if (
        isOpened &&
        !findClosestParent(clickedElement, (p) => p === wrapRef.current)
      ) {
        onClose();
      }
    };
    document.addEventListener("click", clickListener);

    return () => {
      document.removeEventListener("click", clickListener);
    };
  }, [wrapRef.current, isOpened]);
}
