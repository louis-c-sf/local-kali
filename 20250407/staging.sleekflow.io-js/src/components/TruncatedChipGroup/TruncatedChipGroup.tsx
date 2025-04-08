import {
  Chip,
  ChipProps,
  Tooltip,
  useTheme,
  useThemeProps,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import * as React from 'react';
import {
  ReactElement,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { flushSync } from 'react-dom';

import {
  TruncatedChipGroupOwnerState,
  TruncatedChipGroupProps,
} from './ChipTypes';

const TruncatedChipGroupRoot = styled('div', {
  name: 'SfTruncatedChipGroup',
  slot: 'root',
})<{ ownerState: TruncatedChipGroupOwnerState }>(({ theme, ownerState }) => ({
  display: 'flex',
  height: 'max-content',
  position: 'relative',
  width: '100%',
  overflow: 'hidden',
  gap: theme.spacing(ownerState.spacing),
  alignItems: 'center',
}));

function getVisibleTagCount({
  containerBounds,
  containerBoundsXOffset,
  tags,
  totalTagCount,
  spacing,
}: {
  containerBoundsXOffset: number;
  spacing: number;
  totalTagCount: number;
  tags: HTMLElement[];
  containerBounds: DOMRect;
}) {
  let newVisibleTagCount = totalTagCount;
  for (let i = 0; i < tags.length; i += 1) {
    const tag = tags[i];
    // sometimes value can be null when removing values.
    // Ignoring these produces no bugs but can improve implementation
    if (!tag) {
      continue;
    }
    const tagBounds = tag.getBoundingClientRect();

    const chipPadding = spacing;
    if (
      tagBounds.right + chipPadding >
      containerBounds.right - containerBoundsXOffset
    ) {
      newVisibleTagCount = i;
      break;
    }
  }
  return newVisibleTagCount;
}

export function TruncatedChipGroup(inProps: TruncatedChipGroupProps) {
  const props = useThemeProps({ props: inProps, name: 'SfTruncatedChipGroup' });
  const {
    children,
    spacing = 1,
    containerBoundsXOffset = 5,
    renderOverflowIndicator = (remainingChildren, count) => {
      return (
        <Tooltip
          title={remainingChildren
            .map((child) => {
              return child?.props?.label;
            })
            .join(', ')}
        >
          <Chip color="lightGray" label={`+${count}`} />
        </Tooltip>
      );
    },
    ...others
  } = props;
  const theme = useTheme();
  // slices the 'px' from the returned string of theme and converts it to a number to get the spacing factor
  const spacingFactor = Number(theme.spacing(1).slice(0, -2));
  const itemList = useRef<HTMLDivElement | null>(null);
  const shadowItemList = useRef<HTMLElement[]>([]);
  const childrenArray = React.Children.toArray(children);
  const reversedChildren = [...childrenArray].reverse();
  const [visibleTagCount, setVisibleTagCount] = useState(childrenArray.length);
  const ownerState = {
    children,
    spacing,
    ...others,
  };

  if (process.env.NODE_ENV !== 'production') {
    const isChildrenValidChips = childrenArray.every((child) => {
      return (
        React.isValidElement(child) &&
        JSON.stringify(child.type) === JSON.stringify(Chip)
      );
    });

    if (!isChildrenValidChips) {
      throw new Error(
        'invalid child element present in TruncatedChipGroup. All Children must be instances of Chip',
      );
    }
  }

  useLayoutEffect(() => {
    if (itemList.current) {
      const newVisibleTagCount = getVisibleTagCount({
        containerBounds: itemList.current.getBoundingClientRect(),
        tags: shadowItemList.current,
        totalTagCount: reversedChildren.length,
        spacing: spacing * spacingFactor,
        containerBoundsXOffset: containerBoundsXOffset * spacingFactor,
      });
      queueMicrotask(() => {
        flushSync(() => {
          setVisibleTagCount(newVisibleTagCount);
        });
      });
    }
  }, [containerBoundsXOffset, reversedChildren.length, spacing]);

  useEffect(() => {
    const observer = new ResizeObserver(() => {
      if (itemList.current) {
        const newVal = getVisibleTagCount({
          containerBounds: itemList.current.getBoundingClientRect(),
          tags: shadowItemList.current,
          totalTagCount: reversedChildren.length,
          spacing: spacing * spacingFactor,
          containerBoundsXOffset: containerBoundsXOffset * spacingFactor,
        });

        flushSync(() => {
          setVisibleTagCount(newVal);
        });
      }
    });

    if (itemList.current) {
      observer.observe(itemList.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [containerBoundsXOffset, reversedChildren.length, spacing]);

  return (
    <TruncatedChipGroupRoot ownerState={ownerState} ref={itemList}>
      {reversedChildren.slice(0, visibleTagCount)}
      {visibleTagCount < reversedChildren.length &&
        renderOverflowIndicator(
          reversedChildren.slice(visibleTagCount) as Array<
            ReactElement<ChipProps, typeof Chip>
          >,
          reversedChildren.length - visibleTagCount,
        )}
      {React.cloneElement(<TruncatedChipGroupRoot ownerState={ownerState} />, {
        children: reversedChildren.map((child, index) => {
          if (!React.isValidElement(child)) {
            return null;
          }
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return React.cloneElement(child as any, {
            ref: (_ref: HTMLElement) => {
              shadowItemList.current[index] = _ref;
            },
          });
        }),
        style: {
          position: 'absolute',
          pointerEvents: 'none',
          visibility: 'hidden',
          left: 0,
          top: 0,
        },
      })}
    </TruncatedChipGroupRoot>
  );
}
