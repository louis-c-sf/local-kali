import { useSlotProps } from '@mui/base';
import { Box, styled, useThemeProps } from '@mui/material';
import * as RadixScrollArea from '@radix-ui/react-scroll-area';
import { forwardRef } from 'react';

import { ScrollAreaOwnerState, ScrollAreaProps } from './ScrollAreaTypes';

const ScrollAreaRoot = styled(Box, {
  name: 'SfScrollArea',
  slot: 'innerRoot',
})<{ ownerState: ScrollAreaOwnerState }>(({ ownerState }) => ({
  overflow: 'hidden',
  '--radix-min-thumb-size': `${ownerState.minThumbSize}px`,
}));

const ScrollBar = styled(RadixScrollArea.Scrollbar)<{
  ownerState: ScrollAreaOwnerState;
}>(({ ownerState, theme }) => ({
  display: 'flex',
  userSelect: 'none',
  touchAction: 'none',
  transition: theme.transitions.create('all', {
    easing: theme.transitions.easing.easeInOut,
    duration: theme.transitions.duration.shortest,
  }),
  '&[data-orientation="vertical"]': {
    '--radix-scroll-area-thumb-width': `${ownerState.scrollbarSize}px`,
    marginBottom:
      'max(calc(var(--radix-min-thumb-size) - var(--radix-scroll-area-thumb-height)), 0px)',
    width: ownerState.scrollbarSize,
    '& div': {
      minHeight: 'var(--radix-min-thumb-size)',
    },
  },
  '&[data-orientation="horizontal"]': {
    height: ownerState.scrollbarSize,
    '--radix-scroll-area-thumb-height': `${ownerState.scrollbarSize}px`,
  },
  '&[data-orientation="horizontal"] div': {
    flexDirection: 'column',
  },
  '&:hover div': {
    opacity: 0.4,
  },
}));

const Thumb = styled(RadixScrollArea.Thumb)<{
  ownerState: ScrollAreaOwnerState;
}>(({ theme, ownerState }) => ({
  backgroundColor: theme.palette.gray[90],
  borderRadius: ownerState.scrollbarSize,
  position: 'relative',
  zIndex: 999,
  opacity: 0.1,
  transition: theme.transitions.create('opacity backgroundColor', {
    easing: theme.transitions.easing.easeInOut,
    duration: theme.transitions.duration.shortest,
  }),
  // increase target size for touch devices https://www.w3.org/WAI/WCAG21/Understanding/target-size.html
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '100%',
    height: '100%',
    minWidth: '12px',
    minHeight: '12px',
  },
}));

export const ScrollAreaViewport = styled(RadixScrollArea.Viewport)<{
  ownerState: ScrollAreaOwnerState;
}>({
  width: '100%',
  height: '100%',
  borderRadius: 'inherit',
});

export const ScrollArea = forwardRef<HTMLDivElement, ScrollAreaProps>(
  (inProps, ref) => {
    const props = useThemeProps({ props: inProps, name: 'SfScrollArea' });
    const {
      children,
      slotProps,
      onDark = false,
      scrollbarSize = 8,
      minThumbSize = 60,
      ...others
    } = props;

    const ownerState = { onDark, scrollbarSize, minThumbSize, ...others };

    const radixRootProps = useSlotProps({
      elementType: RadixScrollArea.Root,
      externalSlotProps: { ...slotProps?.root, asChild: true },
      ownerState,
      additionalProps: {
        ref,
      },
    });

    const innerRootProps = useSlotProps({
      elementType: ScrollAreaRoot,
      externalSlotProps: slotProps?.innerRoot,
      ownerState,
      externalForwardedProps: {
        ...others,
      },
    });

    const viewportProps = useSlotProps({
      elementType: ScrollAreaViewport,
      externalSlotProps: slotProps?.viewport,
      ownerState,
    });

    const scrollBarProps = useSlotProps({
      elementType: ScrollBar,
      externalSlotProps: {
        ...slotProps?.scrollBar,
      },
      ownerState,
    });

    const thumbProps = useSlotProps({
      elementType: Thumb,
      externalSlotProps: {
        ...slotProps?.thumb,
      },
      ownerState,
    });

    return (
      <RadixScrollArea.Root {...radixRootProps}>
        <ScrollAreaRoot {...innerRootProps}>
          <ScrollAreaViewport {...viewportProps}>{children}</ScrollAreaViewport>
          <ScrollBar forceMount {...scrollBarProps} orientation="vertical">
            <Thumb {...thumbProps} />
          </ScrollBar>
          <ScrollBar {...scrollBarProps} orientation="horizontal">
            <Thumb {...thumbProps} />
          </ScrollBar>
          <RadixScrollArea.Corner />
        </ScrollAreaRoot>
      </RadixScrollArea.Root>
    );
  },
);

ScrollArea.displayName = 'ScrollArea';
