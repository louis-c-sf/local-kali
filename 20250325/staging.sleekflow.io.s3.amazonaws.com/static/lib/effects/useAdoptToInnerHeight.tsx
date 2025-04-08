import { useLayoutEffect } from "react";
import { fromResize } from "../rxjs/fromResize";
import { fromMutate } from "../rxjs/fromMutate";
import { merge } from "rxjs";

export function useAdoptToInnerHeight<
  E extends HTMLElement,
  I extends HTMLElement
>(props: {
  wrapper: E | null;
  getInnerElement: (wrapper: E) => I | null;
  isValidMutation: (record: MutationRecord) => boolean;
  speed: number; //pixels per sec
}) {
  const { getInnerElement, wrapper, speed, isValidMutation } = props;

  useLayoutEffect(() => {
    if (!wrapper) {
      return;
    }
    const wrapperNode = wrapper!;
    const inner = getInnerElement(wrapperNode);
    if (!inner) {
      return;
    }
    const getHeight = () => inner.getBoundingClientRect().height;
    const setHeight = (height: number) => {
      wrapperNode.style.height = `${height}px`;
    };

    wrapperNode.style.overflowY = "hidden";
    wrapperNode.style.transitionProperty = "height";
    setHeight(getHeight());

    const resize$ = fromResize(inner);
    const mutate$ = fromMutate(inner);
    let prevHeight = getHeight();

    const observer = merge(resize$, mutate$).subscribe((value) => {
      if (value[0] instanceof MutationRecord) {
        if (!(value as MutationRecord[]).some(isValidMutation)) {
          return;
        }
      }
      const newHeight = getHeight();
      const distance = Math.abs(newHeight - prevHeight);
      const duration = (distance / Math.max(10, speed)) * 1000;
      wrapperNode.style.transitionDuration = `${duration.toFixed(0)}ms`;
      setHeight(newHeight);
      prevHeight = newHeight;
    });

    return () => {
      observer.unsubscribe();
    };
  }, [wrapper]);
}
