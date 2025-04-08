import React, { useLayoutEffect } from "react";

export function useTableHeaderAdaptive(props: {
  tableNode: HTMLTableElement | null;
  cssVarName: string;
}) {
  const { tableNode, cssVarName } = props;
  useLayoutEffect(() => {
    if (!tableNode) {
      return;
    }

    function updateHeadHeight() {
      const head = tableNode?.querySelector("thead");
      if (tableNode && head) {
        tableNode.style.setProperty(
          cssVarName,
          `${head.getBoundingClientRect().height}px`
        );
      }
    }

    if (ResizeObserver === undefined) {
      return;
    }
    const observer = new ResizeObserver((ev) => {
      updateHeadHeight();
    });
    observer.observe(tableNode);

    return () => {
      observer.disconnect();
      if (tableNode) {
        observer.unobserve(tableNode);
      }
    };
  }, [tableNode]);
}
