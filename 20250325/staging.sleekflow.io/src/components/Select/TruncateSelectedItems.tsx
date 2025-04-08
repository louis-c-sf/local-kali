import { Chip, Stack, StackProps, Tooltip, useForkRef } from '@mui/material';
import {
  ReactNode,
  forwardRef,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useMeasure } from 'react-use';

const getPrefixLabelProps = () => ({
  'data-skip-truncate': true,
});

interface RenderProps {
  getPrefixLabelProps: typeof getPrefixLabelProps;
}

interface EllipsisProps {
  truncatedCount: number;
  truncatedContent: string;
}

interface TruncateSelectedItemsProps extends Omit<StackProps, 'children'> {
  children: ({ getPrefixLabelProps }: RenderProps) => ReactNode;
  ellipsis?: ({ truncatedCount, truncatedContent }: EllipsisProps) => ReactNode;
  maxWidth?: number;
}

export const TruncateSelectedItems = forwardRef<
  HTMLDivElement,
  TruncateSelectedItemsProps
>(({ children, ellipsis, maxWidth = 280, ...props }, refProp) => {
  const outerRef = useRef<HTMLDivElement>(null);
  const [outerRef2, outerRect] = useMeasure<HTMLDivElement>();

  const outerStackRef = useForkRef(outerRef, outerRef2, refProp);
  const ellipsisRef = useRef<HTMLDivElement>(null);

  const [truncatedCount, setTruncatedCount] = useState(0);
  const [truncatedContent, setTruncatedContent] = useState('');

  useLayoutEffect(() => {
    if (!outerRef.current || !ellipsisRef.current) return;

    const children = Array.from(outerRef.current.children).filter(
      (c) => !c.hasAttribute('data-skip-truncate'),
    );

    const { x: parentX } = outerRef.current.getBoundingClientRect();
    const { width: ellipsisWidth } =
      ellipsisRef.current.getBoundingClientRect();

    for (let i = 0; i < children.length; i++) {
      const child = children[i] as HTMLElement;
      const { x: childX, width: childWidth } = child.getBoundingClientRect();

      if (childX + childWidth > parentX + maxWidth - ellipsisWidth) {
        setTruncatedCount(children.length - i);
        setTruncatedContent(
          children
            .slice(i)
            .map((c) => c.textContent)
            .join(' '),
        );
        return;
      }
    }
  }, [maxWidth, outerRect]);

  const defaultEllipsisComponent = useMemo(() => {
    return (
      <Stack direction="row" spacing={0.5} alignItems="center">
        <span>...</span>
        <Tooltip title={truncatedContent}>
          <Chip label={`+${truncatedCount}`} />
        </Tooltip>
      </Stack>
    );
  }, [truncatedCount, truncatedContent]);

  return (
    <Stack
      ref={outerStackRef}
      position="relative"
      height="100%"
      direction="row"
      alignItems="center"
      overflow="hidden"
      maxWidth={maxWidth}
      style={{ background: 'inherit', backgroundColor: 'inherit' }}
      {...props}
    >
      {children({ getPrefixLabelProps })}
      <Stack
        ref={ellipsisRef}
        position="absolute"
        bgcolor="inherit"
        visibility={truncatedCount > 0 ? 'visible' : 'hidden'}
        sx={{
          insetInlineEnd: 0,
          pointerEvents: 'auto',
        }}
        data-skip-truncate
        aria-hidden
      >
        {ellipsis?.({ truncatedCount, truncatedContent }) ||
          defaultEllipsisComponent}
      </Stack>
    </Stack>
  );
});

TruncateSelectedItems.displayName = 'TruncateSelectedItems';
