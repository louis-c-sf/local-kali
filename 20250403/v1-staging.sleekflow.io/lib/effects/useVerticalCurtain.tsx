import { useCallback, useState, useLayoutEffect, useRef } from "react";
import { parseCssTime } from "../utility/parseCssTime";
import { append } from "ramda";

type CollapseHandler = (ev: TransitionEvent) => void;

export function useVerticalCurtain(props: {
  curtain: HTMLElement | null;
  contents: HTMLElement | null;
  opened: boolean;
}) {
  const { curtain, contents, opened } = props;
  const [timeoutsQueue, setTimeoutsQueue] = useState<NodeJS.Timeout[]>([]);
  const openHandlers = useRef<CollapseHandler[]>([]);
  const closeHandlers = useRef<CollapseHandler[]>([]);

  function addOpenHandler(handler: CollapseHandler) {
    openHandlers.current = append(handler, openHandlers.current);
  }

  function addCloseHandler(handler: CollapseHandler) {
    closeHandlers.current = append(handler, closeHandlers.current);
  }

  function resetOpenHandlers() {
    openHandlers.current.forEach((handler) => {
      curtain?.removeEventListener("transitionend", handler);
    });
    openHandlers.current = [];
  }

  function resetCloseHandlers() {
    closeHandlers.current.forEach((handler) => {
      curtain?.removeEventListener("transitionend", handler);
    });
    closeHandlers.current = [];
  }

  function resetCollapseTimeouts() {
    for (let timeout of timeoutsQueue) {
      clearTimeout(timeout);
    }
    setTimeoutsQueue([]);
  }

  useLayoutEffect(() => {
    // initialize opened/closed size
    // !!! "opened" var should not be a dependency
    if (!(curtain && contents)) {
      return;
    }
    if (opened) {
      // reset any particular height set before
      toggle(true);
    } else {
      toggle(false);
    }
  }, [curtain, contents, opened]);

  const toggle = useCallback(
    (open: boolean) => {
      if (!(curtain && contents)) {
        return;
      }
      resetCollapseTimeouts();
      resetOpenHandlers();
      resetCloseHandlers();

      function fireOpenedEvent(ev: TransitionEvent) {
        if (curtain && ev.target === curtain) {
          curtain.removeEventListener("transitionend", fireOpenedEvent);
          expandStatically(curtain);
        }
      }

      function fireClosedEvent(ev: TransitionEvent) {
        if (curtain && ev.target === curtain) {
          curtain.removeEventListener("transitionend", fireClosedEvent);
        }
      }

      const durationStyled =
        window.getComputedStyle(curtain).transitionDuration;
      const duration = parseCssTime(durationStyled);

      const contentHeight = contents.getBoundingClientRect().height;

      if (open) {
        // open
        if (duration) {
          curtain.addEventListener("transitionend", fireOpenedEvent);
          // run animation with a micro-delay, to avoid listener losing race condition
          const timeout = setTimeout(() => {
            expandToHeight(curtain, contentHeight);
          }, 10);
          setTimeoutsQueue(append(timeout));
          addOpenHandler(fireOpenedEvent);
        } else {
          // when there is no duration, set height to auto immediately
          expandStatically(curtain);
        }
      } else {
        // close
        if (duration) {
          curtain.addEventListener("transitionend", fireClosedEvent);

          // set animation start value instead of "auto"
          curtain.style.height = `${contentHeight}px`;

          // run animation with a micro-delay, to avoid listener losing race condition
          const timeout = setTimeout(() => collapseByBrowser(curtain), 10);
          setTimeoutsQueue(append(timeout));
          addCloseHandler(fireClosedEvent);
        } else {
          collapseByBrowser(curtain);
        }
      }
    },
    [curtain, contents]
  );
}

function expandStatically(curtain: HTMLElement) {
  curtain.style.height = "auto";
  curtain.style.overflowY = "visible";
}

function collapseByBrowser(curtain: HTMLElement) {
  curtain.style.overflowY = "hidden";
  curtain.style.height = `0`;
}

function expandToHeight(curtain: HTMLElement, height: number) {
  curtain.style.overflowY = "hidden";
  curtain.style.height = `${height}px`;
}
