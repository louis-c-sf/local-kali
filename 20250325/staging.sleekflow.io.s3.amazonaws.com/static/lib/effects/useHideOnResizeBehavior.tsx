import { useEffect, useState, useLayoutEffect } from "react";
import { debounce } from "lodash-es";

function getWidth(el: HTMLElement) {
  return el.getBoundingClientRect().width;
}

function getLeft(el: HTMLElement) {
  if (!el.parentElement || el.offsetParent === el.parentElement) {
    return el.offsetLeft;
  }
  return el.offsetLeft - el.parentElement.offsetLeft;
}

function getIsVisible(el: Node) {
  return window.getComputedStyle(el as Element).display !== "none";
}

function getLastSibling(wrapNode: HTMLElement) {
  return ([...wrapNode.childNodes] as HTMLElement[])
    .reverse()
    .find(getIsVisible);
}

function getWidthUpToNode(node: HTMLElement) {
  return getWidth(node) + getLeft(node);
}

function getContentWidth(parent: HTMLElement) {
  const lastSib = getLastSibling(parent);
  if (!lastSib) {
    return 0;
  }
  return getWidthUpToNode(lastSib);
}

export function useHideOnResizeBehavior(props: {
  withCounter: boolean;
  wrapElement: HTMLElement | null;
  selectCollapsibleSiblings: (wrapper: HTMLElement) => HTMLElement[];
  counterElement?: HTMLElement | undefined;
  hiddenClass?: string;
  fitToElement?: HTMLElement | null;
}) {
  const {
    counterElement,
    selectCollapsibleSiblings,
    withCounter,
    wrapElement,
    hiddenClass = "hidden",
    fitToElement,
  } = props;

  const [hasChildren, setHasChildren] = useState(false);

  useEffect(() => {
    if (!wrapElement) {
      return;
    }
    const getHasChildren = () =>
      selectCollapsibleSiblings(wrapElement).length > 0;
    const observer = new MutationObserver(() =>
      setHasChildren(getHasChildren())
    );
    observer.observe(wrapElement, {
      attributes: false,
      childList: true,
      subtree: false,
      characterData: false,
    });
    setHasChildren(getHasChildren());

    return () => {
      observer.disconnect();
    };
  }, [wrapElement]);

  useEffect(() => {
    if (!wrapElement || (withCounter && !counterElement)) {
      return;
    }
    if (!hasChildren) {
      return;
    }

    resizeHandler(wrapElement, counterElement);

    function resizeHandler(wrapNode: HTMLElement, counterNode?: HTMLElement) {
      const collapsibleItems = [...selectCollapsibleSiblings(wrapNode)];
      if (collapsibleItems.length === 0) {
        return;
      }

      // reset the flow
      for (const item of collapsibleItems) {
        item.classList.remove(hiddenClass);
      }
      if (withCounter && counterNode) {
        counterNode.classList.add(hiddenClass);
      }
      wrapNode.classList.remove("full");

      const lastSibling = getLastSibling(wrapNode);
      if (!lastSibling) {
        return;
      }
      const allWidth = Math.floor(
        fitToElement
          ? getContentWidth(fitToElement)
          : getWidthUpToNode(lastSibling)
      );

      const allowedWidth = getWidth(fitToElement ?? wrapNode);

      if (allWidth <= allowedWidth) {
        wrapNode.classList.add("full");
        return;
      }
      if (withCounter && counterNode) {
        // hide labels, show the counter
        counterNode.classList.remove(hiddenClass);
        counterNode.innerText = "0";
      }

      // hide the labels from the last one until fit
      const leftOverItems = [...collapsibleItems].reverse();
      const nextItem = leftOverItems.shift();
      hideItem(nextItem, leftOverItems);

      function hideItem(
        item: HTMLElement | undefined,
        leftOverItems: HTMLElement[]
      ) {
        if (!item) {
          return;
        }
        if (withCounter && counterNode) {
          counterNode.innerText = `${
            collapsibleItems.length - leftOverItems.length
          }`;
        }
        item.classList.add(hiddenClass);

        const [nextItem, ...restItems] = leftOverItems;

        const contentWidth = Math.floor(
          fitToElement
            ? getContentWidth(fitToElement)
            : getWidthUpToNode(counterNode ?? item)
        );
        const allowedWidth = getWidth(fitToElement ?? wrapNode);
        if (contentWidth > allowedWidth && nextItem) {
          hideItem(nextItem, restItems);
        }
      }
    }

    const resizeHandlerDebounced = debounce(
      () => resizeHandler(wrapElement, counterElement),
      40,
      { leading: true, trailing: true }
    );
    window.addEventListener("resize", resizeHandlerDebounced);

    return () => {
      window.removeEventListener("resize", resizeHandlerDebounced);
    };
  }, [hasChildren, wrapElement, counterElement, withCounter]);
}
