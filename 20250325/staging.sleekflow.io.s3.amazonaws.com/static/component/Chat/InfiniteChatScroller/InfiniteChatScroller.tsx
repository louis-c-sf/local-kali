import React, { useCallback, useEffect, useLayoutEffect } from "react";
import { Loader } from "semantic-ui-react";

function InfiniteChatScroller(props: {
  conversationId: string;
  threshold: number;
  loadMore: () => Promise<void>;
  hasMore: boolean;
  children: any;
  scrollToBottom: boolean;
  scrollParent: HTMLDivElement | null;
  onScrollToBottom: () => void;
  loading: boolean;
  autoloadFirstPage: boolean;
}) {
  const { hasMore, loadMore, scrollParent, scrollToBottom, threshold } = props;
  const {
    children,
    onScrollToBottom,
    conversationId,
    loading,
    autoloadFirstPage,
  } = props;

  const loadAndScroll = useCallback(
    async (canvas: HTMLDivElement) => {
      const prevScrollHeight = canvas.scrollHeight;
      try {
        await props.loadMore();
        if (canvas.scrollTop === 0) {
          const scrollTo =
            canvas.scrollHeight - prevScrollHeight + canvas.scrollTop;
          canvas.scrollTop = scrollTo;
        }
      } catch (e) {
        console.error(`#scroll loadMore: ${e}`);
      }
    },
    [loadMore]
  );

  //first scroll effect
  useLayoutEffect(() => {
    if (scrollParent && autoloadFirstPage) {
      loadAndScroll(scrollParent);
    }
  }, [conversationId, scrollParent]);

  useLayoutEffect(() => {
    // add scroll listener(s) while there is something to load yet
    if (loading || !hasMore || !scrollParent) {
      return;
    }
    const scrollListener = () => {
      if (shouldLoadMore(scrollParent)) {
        loadAndScroll(scrollParent);
      }
    };

    scrollParent.addEventListener("scroll", scrollListener);
    scrollParent.addEventListener("resize", scrollListener);

    return () => {
      scrollParent.removeEventListener("scroll", scrollListener);
      scrollParent.removeEventListener("resize", scrollListener);
    };
  }, [loading, hasMore, scrollParent, loadAndScroll]);

  useEffect(() => {
    if (scrollParent && scrollToBottom) {
      //todo animate
      scrollParent.scrollTop = scrollParent.scrollHeight;
      onScrollToBottom();
    }
  }, [scrollParent, scrollToBottom]);

  function shouldLoadMore(canvas: HTMLDivElement) {
    // Here we make sure the element is visible as well as checking the offset
    return canvas.scrollTop < threshold && canvas.offsetParent !== null;
  }

  return (
    <>
      <div className={`loader ${loading ? "visible" : "hidden"}`}>
        <Loader active={true} inline={"centered"} />
      </div>
      {children}
    </>
  );
}

export default InfiniteChatScroller;
