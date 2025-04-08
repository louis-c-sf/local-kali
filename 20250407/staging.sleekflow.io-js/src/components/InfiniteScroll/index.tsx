import { CircularProgress, Stack } from '@mui/material';
import { ForwardedRef, forwardRef, useEffect, useMemo, useRef } from 'react';

import { ScrollArea, ScrollAreaProps } from '../ScrollArea';

export interface InfiniteScrollProps extends ScrollAreaProps {
  children: React.ReactNode;
  threshold?: number;
  // offset for trigger load more break point
  // support precise number, percentage and function with custom logic
  offset?: number | ((dimension: number) => number);
  loadingNext?: boolean;
  loadingPrevious?: boolean;
  loading?: boolean;
  isReverse?: boolean;
  direction?: 'vertical' | 'horizontal';
  slots?: {
    loadingIndicator?: React.ElementType;
  };
  hasPrevious?: boolean;
  hasNext?: boolean;
  onPrev?: () => void;
  onNext?: () => void;
}

const throttle = (callback: (args: any) => void, delay = 100) => {
  let throttleId: number | undefined;
  return (...args: any) => {
    clearTimeout(throttleId);
    throttleId = window.setTimeout(() => {
      // eslint-disable-next-line prefer-spread
      callback.apply(null, args);
    }, delay);
  };
};

const InfiniteScroll = forwardRef(
  (props: InfiniteScrollProps, ref: ForwardedRef<HTMLDivElement>) => {
    const {
      children,
      threshold = 0,
      offset = 0.3,
      hasPrevious = false,
      hasNext = false,
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      onNext = () => {},
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      onPrev = () => {},
      loading = false,
      loadingNext,
      loadingPrevious,
      isReverse = false,
      direction = 'vertical',
      slots = {},
      slotProps,
      ...restProps
    } = props;

    const {
      loadingIndicator: LoadingIndicator = () => (
        <CircularProgress sx={{ my: 4 }} />
      ),
    } = slots;
    const lastReached = useRef(0);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const shouldScrollToBottomRef = useRef(isReverse);

    const hasMore = hasPrevious || hasNext;

    const triggerOffset = useMemo(() => {
      const scrollEl = scrollAreaRef.current;
      if (!scrollEl) return 0;

      const dimension =
        direction === 'horizontal'
          ? scrollEl.clientWidth
          : scrollEl.clientHeight;
      if (typeof offset === 'function') {
        return offset(dimension);
      }
      return offset >= 0 && offset <= 1 ? offset * dimension : offset;
      // it doesn't recomputes without including the scrollAreaRef.current object
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [scrollAreaRef.current, direction, offset]);

    // Handle scroll event and load more if the user has reached the end
    const onScroll = throttle((e: Event & { target: HTMLElement }) => {
      if (loading) return;

      if (direction === 'horizontal') {
        const isReachedLeftEnd = e.target.scrollLeft - triggerOffset <= 0;
        const isReachedRightEnd =
          e.target.scrollLeft + e.target.clientWidth + triggerOffset >=
          e.target.scrollWidth;

        if (isReachedLeftEnd && hasPrevious) {
          onPrev();
          lastReached.current = e.target.scrollWidth;
        } else if (isReachedRightEnd && hasNext) {
          onNext();
          lastReached.current = 0;
        }
      } else {
        const isReachedTop = e.target.scrollTop - triggerOffset <= 0;
        const isReachedBottom =
          e.target.scrollTop + e.target.offsetHeight + triggerOffset >=
          e.target.scrollHeight - 1;

        if (isReachedTop && hasPrevious) {
          onPrev();
          lastReached.current = e.target.scrollHeight;
        } else if (isReachedBottom && hasNext) {
          onNext();
          lastReached.current = 0;
        }
      }
    }, threshold);

    // Load more if the screen has enough space
    useEffect(() => {
      if (loading) return;
      if (!hasMore) return;
      if (!scrollAreaRef.current) return;

      const scrollEl = scrollAreaRef.current;
      if (direction === 'horizontal') {
        if (scrollEl.clientWidth - scrollEl.scrollWidth >= 0) {
          if (hasPrevious) {
            onPrev();
          }
          if (hasNext) {
            onNext();
          }
        }
      } else {
        // Stop scroll to bottom if the height of the scroll area minus the height of the scroll area is not greater than zero
        if (shouldScrollToBottomRef.current) {
          if (isReverse) {
            scrollEl.scrollTop = scrollEl.scrollHeight;
          }
          shouldScrollToBottomRef.current = false;
        }
        // Load more if the height of the scroll area minus the height of the scroll area is greater than zero
        // And, automatically scroll to the bottom of the scroll area
        if (scrollEl.clientHeight - scrollEl.scrollHeight >= 0) {
          if (hasPrevious) {
            onPrev();
          }
          if (hasNext) {
            onNext();
          }
          shouldScrollToBottomRef.current = true;
        }
      }
    }, [
      loading,
      hasMore,
      isReverse,
      scrollAreaRef,
      hasPrevious,
      hasNext,
      onNext,
      onPrev,
      direction,
    ]);

    // Scroll to the last stored scroll position if the isReverse prop is true
    useEffect(() => {
      if (loading) return;
      if (!scrollAreaRef.current) return;

      if (isReverse) {
        // restored to the last position for vertical scrolling (scroll top)
        scrollAreaRef.current.scrollTop =
          scrollAreaRef.current.scrollHeight - lastReached.current;
      } else if (lastReached.current) {
        // restored to the last position for horizontal scrolling (scroll left)
        scrollAreaRef.current.scrollLeft =
          scrollAreaRef.current.scrollWidth - lastReached.current;
      }
    }, [isReverse, loading, lastReached]);

    // Expose scroll area ref
    useEffect(() => {
      if (!ref) return;
      typeof ref === 'function'
        ? ref(scrollAreaRef.current)
        : (ref.current = scrollAreaRef.current);
    }, [ref]);

    const { viewport, ...restSlotProps } = slotProps || {};

    return (
      <ScrollArea
        {...restProps}
        slotProps={{
          viewport: { onScroll, ref: scrollAreaRef, ...viewport },
          ...restSlotProps,
        }}
      >
        {loadingPrevious && (
          <Stack alignItems="center">
            <LoadingIndicator />
          </Stack>
        )}
        {children}
        {loadingNext && (
          <Stack alignItems="center">
            <LoadingIndicator />
          </Stack>
        )}
      </ScrollArea>
    );
  },
);

InfiniteScroll.displayName = 'InfiniteScroll';

export default InfiniteScroll;
