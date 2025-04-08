import React, {
  ReactElement,
  ReactNode,
  useLayoutEffect,
  useState,
} from "react";
import { Ref, Transition } from "semantic-ui-react";

export function SlideShort(props: {
  children: ReactElement;
  visible: boolean;
  onShowStart?: (container: HTMLElement) => void;
  onShown?: (container: HTMLElement) => void;
  onHideStart?: (container: HTMLElement) => void;
  onHidden?: (container: HTMLElement) => void;
  onTransitionFrame?: (
    element: HTMLElement,
    direction: "show" | "hide"
  ) => void;
}) {
  const {
    children,
    onHidden,
    onHideStart,
    onShowStart,
    onShown,
    visible,
    onTransitionFrame,
  } = props;
  const [containerNode, setContainerNode] = useState<HTMLElement>();
  const [mounted, setMounted] = useState(props.visible);

  useLayoutEffect(() => {
    if (!containerNode || !onTransitionFrame) {
      return;
    }
    let listening = false;
    let tickId: number;

    function tickStart() {
      listening = true;
      tickId = window.requestAnimationFrame(tick);
    }

    function tickEnd() {
      listening = false;
    }

    function tick() {
      if (containerNode && onTransitionFrame) {
        onTransitionFrame(
          containerNode,
          containerNode.classList.contains("in") ? "show" : "hide"
        );
      }
      if (listening) {
        window.requestAnimationFrame(tick);
      }
    }

    containerNode.addEventListener("animationstart", tickStart);
    containerNode.addEventListener("animationend", tickEnd);
    containerNode.addEventListener("animationcancel", tickEnd);

    return () => {
      listening = false;
      window.cancelAnimationFrame(tickId);
      containerNode.removeEventListener("animationstart", tickStart);
      containerNode.removeEventListener("animationend", tickEnd);
      containerNode.removeEventListener("animationcancel", tickEnd);
    };
  }, [containerNode]);

  useLayoutEffect(() => {
    containerNode?.classList.add("slideShort");
  }, [containerNode]);

  useLayoutEffect(() => {
    if (!visible) {
      return;
    }
    if (!mounted) {
      setMounted(true);
    }
  }, [visible, mounted]);

  useLayoutEffect(() => {
    if (!containerNode) {
      return;
    }

    function handleShown() {
      onShown && containerNode && onShown(containerNode);
      containerNode?.classList.remove("in", "out", "transition");
    }

    function handleShowStart() {
      onShowStart && containerNode && onShowStart(containerNode);
    }

    function handleHideStart() {
      onHideStart && containerNode && onHideStart(containerNode);
    }

    function handleHidden() {
      onHidden && containerNode && onHidden(containerNode);
      containerNode?.classList.remove("out", "in", "visible", "transition");
      setMounted(false);
    }

    if (visible) {
      // run animation for showing
      containerNode.addEventListener("animationstart", handleShowStart);
      containerNode.addEventListener("animationend", handleShown);
      containerNode?.classList.add("transition", "in", "visible");
    } else {
      // run animation for hiding
      containerNode.addEventListener("animationstart", handleHideStart);
      containerNode.addEventListener("animationend", handleHidden);
      containerNode?.classList.add("transition", "out");
    }

    return () => {
      containerNode.removeEventListener("animationstart", handleHidden);
      containerNode.removeEventListener("animationstart", handleShowStart);
      containerNode.removeEventListener("animationend", handleHidden);
      containerNode.removeEventListener("animationend", handleShown);
    };
  }, [visible, containerNode]);

  return <>{mounted && <Ref innerRef={setContainerNode}>{children}</Ref>}</>;
}
