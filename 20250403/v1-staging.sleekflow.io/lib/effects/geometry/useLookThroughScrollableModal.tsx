import React, { useLayoutEffect, useState } from "react";
import { ModalContentProps } from "semantic-ui-react";

export function useLookThroughScrollableModal(props: {
  modalContentElement: HTMLElement | null;
}) {
  const { modalContentElement } = props;
  const [wrapper, setWrapper] = useState<HTMLElement | null>(null);

  useLayoutEffect(() => {
    if (!(wrapper && modalContentElement)) {
      return;
    }
    const observer = new ResizeObserver((changes) => {
      const [mainChange] = changes;
      if (!modalContentElement) {
        return;
      }
      const modalHeight = modalContentElement.getBoundingClientRect().height;
      const contentHeight = mainChange.contentRect.height;
      const overflows = modalHeight < contentHeight;

      if (overflows) {
        modalContentElement.style.overflow = "auto";
      } else {
        modalContentElement.style.overflow = "visible";
      }
    });
    observer.observe(wrapper);

    return () => {
      if (observer && wrapper) {
        observer.unobserve(wrapper);
      }
    };
  }, [modalContentElement, wrapper]);

  return {
    wrapContent: (content: ModalContentProps["children"]) => (
      <div ref={setWrapper}>{content}</div>
    ),
  };
}
