import { Observable } from "rxjs";

export function fromMutate(element: HTMLElement) {
  return new Observable<MutationRecord[]>((subscriber) => {
    const resizeObserver = new MutationObserver((entries) => {
      subscriber.next(entries);
    });
    resizeObserver.observe(element, { subtree: true, childList: true });

    return () => {
      resizeObserver.disconnect();
    };
  });
}
