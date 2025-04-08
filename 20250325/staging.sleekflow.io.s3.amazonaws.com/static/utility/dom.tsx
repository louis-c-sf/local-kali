import React from "react";

export function findClosestParent(
  node: HTMLElement,
  predicate: (node: HTMLElement) => boolean
): HTMLElement | undefined {
  if (predicate(node)) {
    return node;
  }
  const parentElement = node?.parentElement;
  if (parentElement) {
    return findClosestParent(parentElement, predicate);
  }
  return undefined;
}

export function findClosestLink(
  node: HTMLElement
): HTMLAnchorElement | undefined {
  return findClosestParent(
    node,
    (node) => node instanceof HTMLAnchorElement
  ) as HTMLAnchorElement;
}

export function isClickedForNewWindow(event: React.MouseEvent) {
  if (event.button === 1) {
    return true;
  }
  if (/macintosh/i.test(navigator.userAgent)) {
    return event.metaKey;
  }
  return event.ctrlKey;
}

export function catchLinkClicked(event: React.MouseEvent) {
  const linkClicked = findClosestLink(event.target as HTMLElement);
  if (linkClicked) {
    event.stopPropagation();
    if (isClickedForNewWindow(event)) {
      event.preventDefault();
      window.open(linkClicked.href, "_blank")?.focus();
    }
    return true;
  }
  return false;
}
