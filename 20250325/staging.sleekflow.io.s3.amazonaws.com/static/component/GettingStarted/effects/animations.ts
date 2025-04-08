export function collapseSection(curtainElement: HTMLDivElement) {
  curtainElement.style.height = `${0}px`;
}

export function uncollapseSection(
  curtainElement: HTMLDivElement,
  measureElement: HTMLDivElement
) {
  curtainElement.style.height = `${measureElement.scrollHeight}px`;
}

export function scrollToY(element: HTMLElement) {
  window.scrollTo(0, element.offsetTop);
}
