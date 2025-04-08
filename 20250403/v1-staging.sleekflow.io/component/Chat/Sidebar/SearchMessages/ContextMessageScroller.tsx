import React, { ReactNode, useEffect } from "react";
import { fromEvent, Observable } from "rxjs";
import {
  debounceTime,
  distinctUntilChanged,
  mapTo,
  catchError,
} from "rxjs/operators";
import { useAppDispatch, useAppSelector } from "../../../../AppRootContext";
import { Dispatch } from "redux";
import { Action, LoginType } from "../../../../types/LoginType";

const THRESHOLD = 60;
export type DivEvent = Event & { target: HTMLDivElement };

function ContextMessageScroller(props: {
  children: ReactNode;
  scrollParentRef: HTMLDivElement | null;
  scrollRef: HTMLDivElement | null;
  selectHighlightMessageNode: (s: LoginType) => string | number | undefined;
  createScrollAction: (bound: "upper" | "lower") => Action;
}) {
  const {
    scrollParentRef,
    scrollRef,
    selectHighlightMessageNode,
    createScrollAction,
  } = props;
  const scrollToId = useAppSelector(selectHighlightMessageNode);

  const loginDispatch = useAppDispatch();

  useEffect(() => {
    if (!scrollParentRef || !scrollRef) {
      return;
    }
    const scroll$ = subscribeScrollEvents(
      scrollParentRef,
      scrollRef,
      loginDispatch,
      createScrollAction
    );

    return () => {
      scroll$.unsubscribe();
    };
  }, [scrollParentRef, scrollRef, loginDispatch]);

  useEffect(() => {
    // highlight message clicked after context load
    if (!scrollToId) {
      return;
    }
    if (!scrollParentRef || !scrollRef) {
      return;
    }
    const node: HTMLDivElement | null = scrollRef.querySelector(
      `[data-message-id="${scrollToId}"]`
    );
    if (!node) {
      return;
    }
    const viewportHeight = scrollParentRef.getBoundingClientRect().height;
    const nodeHeight = node.getBoundingClientRect().height;
    const nodeOffset = node.offsetTop;
    const scrollTo = nodeOffset - viewportHeight / 2 + nodeHeight / 2;

    node.classList.add("search-highlight");
    scrollParentRef.scrollTo(0, scrollTo);
    const unhighlightTime = setTimeout(() => {
      node && node.classList.remove("search-highlight");
    }, 500);

    return () => {
      if (unhighlightTime) {
        clearTimeout(unhighlightTime);
      }
      if (node) {
        node.classList.remove("search-highlight");
      }
    };
  }, [scrollParentRef, scrollToId, scrollRef, loginDispatch]);

  return <>{props.children}</>;
}

export default ContextMessageScroller;

function subscribeScrollEvents(
  scrollParentRef: HTMLDivElement,
  scrollRef: HTMLDivElement,
  loginDispatch: Dispatch<Action>,
  createScrollAction: (bound: "upper" | "lower") => Action
) {
  return fromParentScrollEvent(scrollParentRef, scrollRef)
    .pipe(
      debounceTime(100),
      // react only on significant scroll shifts
      distinctUntilChanged(
        (prev, next) => Math.abs(prev.scrollTop - next.scrollTop) < 30
      ),
      catchError((e, observable) => {
        console.error("scroll error", e);
        return observable; //retry
      })
    )
    .subscribe((evt) => {
      const maxScrollTop = evt.scrollHeight - evt.parentHeight;
      if (evt.scrollTop < THRESHOLD) {
        loginDispatch(createScrollAction("upper"));
      } else {
        if (maxScrollTop < 0) {
          return;
        }
        if (evt.scrollTop > maxScrollTop - THRESHOLD) {
          loginDispatch(createScrollAction("lower"));
        }
      }
    });
}

type ScrollEventType = {
  scrollTop: number;
  parentHeight: number;
  scrollHeight: number;
};

function fromParentScrollEvent(
  parent: HTMLDivElement,
  scroll: HTMLDivElement
): Observable<ScrollEventType> {
  return fromEvent<ScrollEventType>(parent, "scroll").pipe(
    mapTo({
      scrollTop: parent.scrollTop,
      parentHeight: parent.getBoundingClientRect().height,
      scrollHeight: scroll.scrollHeight,
    })
  );
}
