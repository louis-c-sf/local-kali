import { flip, offset, shift, size } from '@floating-ui/dom';
import { ClickAwayListener, Unstable_Popup as BasePopup } from '@mui/base';
import { useControlled, useThemeProps } from '@mui/material';
import { styled } from '@mui/material/styles';
import React, { useState } from 'react';

import { PopupProps } from './PopupTypes';

export const DEFAULT_POPUP_CONTENT_AWARE_PADDING = 5;

const PopupRoot = styled(BasePopup, {
  name: 'SfPopup',
  slot: 'root',
})(() => () => ({
  height: 'auto',
  minWidth: 'max-content',
}));

const PopupListenerWrapper = styled('div', {
  name: 'SfPopup',
  slot: 'listenerWrapper',
})({
  position: 'relative',
  width: '100%',
});

const PopupContent = styled('div', {
  name: 'SfPopup',
  slot: 'content',
})(({ theme }) => ({
  boxShadow: theme.shadow.md,
  background: theme.palette.white,
  borderRadius: theme.shape.borderRadius,
  height: '100%',
  width: '100%',
}));

export const Popup = React.forwardRef<HTMLDivElement, PopupProps>(
  function Popup(inProps, ref) {
    const props = useThemeProps({ props: inProps, name: 'SfPopup' });
    const {
      children,
      contentSameWidthAsTrigger = false,
      open: openProp,
      onOpenChange,
      renderTrigger,
      offset: offsetProp = 8,
      placement = 'bottom',
      middleware = [
        flip(),
        offset(offsetProp),
        size({
          padding: 5,
          apply({ availableHeight, elements }) {
            const { width } = elements.reference.getBoundingClientRect();
            if (contentSameWidthAsTrigger) {
              Object.assign(elements.floating.style, {
                maxHeight: availableHeight,
                width: `${width}px`,
              });
            }
          },
        }),
        shift({
          crossAxis: true,
        }),
      ],
      ...rest
    } = props;
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

    const [open, setOpen] = useControlled({
      controlled: openProp,
      default: false,
      name: 'Popup',
    });
    const handleOpenChange = (_event: React.SyntheticEvent) => {
      setOpen((prev) => !prev);
      onOpenChange?.(!open);
    };

    return (
      <ClickAwayListener
        onClickAway={() => {
          setOpen(false);
          onOpenChange?.(false);
        }}
      >
        <PopupListenerWrapper ref={ref}>
          {renderTrigger(
            {
              ref: setAnchorEl,
              onClick: handleOpenChange,
            },
            { open },
          )}
          <PopupRoot
            anchor={anchorEl}
            open={open}
            offset={offset}
            placement={placement}
            middleware={middleware}
            {...rest}
          >
            <PopupContent>{children}</PopupContent>
          </PopupRoot>
        </PopupListenerWrapper>
      </ClickAwayListener>
    );
  },
);
