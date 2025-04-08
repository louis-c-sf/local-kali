import { useLayoutEffect, useRef } from "react";

export function useStickedScroll(props: {
  containerNode: HTMLElement | null;
  stateSnapchot: string;
}) {
  const { containerNode, stateSnapchot } = props;
  const listScrollLatest = useRef(0);

  useLayoutEffect(() => {
    if (!containerNode) {
      return;
    }

    const rememberScroll = () => {
      listScrollLatest.current = containerNode.scrollTop;
    };

    containerNode.addEventListener("scroll", rememberScroll);
    containerNode.addEventListener("resize", rememberScroll);

    return () => {
      containerNode.removeEventListener("scroll", rememberScroll);
      containerNode.removeEventListener("resize", rememberScroll);
    };
  }, [containerNode]);

  useLayoutEffect(() => {
    if (!containerNode) {
      return;
    }
    containerNode.scrollTo(0, listScrollLatest.current);
  }, [containerNode, stateSnapchot]);
}
