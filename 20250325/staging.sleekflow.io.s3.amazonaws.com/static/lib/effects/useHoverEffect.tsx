import { useEffect, useState } from "react";
import { findClosestParent } from "../../utility/dom";
import { identical } from "ramda";

export function useHoverEffect<TNode extends HTMLElement>(props: {
  node: TNode | null;
  onEnter?: (node: TNode) => void;
  onLeave?: (from: TNode, to: Element) => void;
}) {
  let { onEnter, onLeave, node } = props;
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (!node) {
      return;
    }

    function enter(event: Event) {
      if (onEnter && node && event.target) {
        if (
          findClosestParent(
            event.target as HTMLElement,
            identical(node as HTMLElement)
          )
        ) {
          onEnter(node);
        }
      }
      setHovered(true);
    }

    function leave(event: Event) {
      const relatedTarget = (event as MouseEvent).relatedTarget as HTMLElement;
      if (onLeave && node && relatedTarget) {
        if (!findClosestParent(relatedTarget, identical(node as HTMLElement))) {
          onLeave(node, relatedTarget);
        }
      }
      setHovered(false);
    }

    if (onEnter) {
      node.addEventListener("mouseover", enter);
    }
    if (onLeave) {
      node.addEventListener("mouseout", leave);
    }

    return () => {
      if (onEnter) {
        node?.removeEventListener("mouseover", enter);
      }
      if (onLeave) {
        node?.removeEventListener("mouseout", leave);
      }
    };
  }, [node, hovered]);

  return { hovered };
}
