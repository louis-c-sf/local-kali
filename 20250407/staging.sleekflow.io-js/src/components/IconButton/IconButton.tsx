import {
  IconButton as IconButtonBase,
  iconButtonClasses,
  keyframes,
  useThemeProps,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import React from 'react';

import Icon from '@/components/Icon';

import { IconButtonOwnerState, IconButtonProps } from './IconButtonTypes';

const IconButtonRoot = styled(IconButtonBase, {
  name: 'SfIconButton',
  slot: 'root',
  overridesResolver: (props, styles) => {
    return [styles.root];
  },
})<IconButtonProps & { ownerState: IconButtonOwnerState }>(
  ({ theme, ownerState }) => ({
    ...(ownerState.shape === 'rectangle' && {
      borderRadius: theme.shape.borderRadius * 2,
    }),
    ...(ownerState.shape === 'pill' && {
      borderRadius: theme.shape.borderRadius * 999,
    }),
    ...(ownerState.variant === 'primary' && {
      color: theme.palette.componentToken.button.textPrimaryEnabled,
      borderColor: theme.palette.componentToken.button.borderPrimaryEnabled,
      background: theme.palette.componentToken.button.bgPrimaryEnabled,
      ...(ownerState.color === 'red' && {
        color: theme.palette.componentToken.button.textPrimaryEnabled,
        borderColor: theme.palette.componentToken.button.borderPrimaryEnabled,
        background: theme.palette.red[90],
      }),
      ...(ownerState.color === 'mustard' && {
        color: theme.palette.componentToken.button.textPrimaryEnabled,
        borderColor: theme.palette.componentToken.button.borderPrimaryEnabled,
        background: theme.palette.orange[90],
      }),
      [`&:not(.${iconButtonClasses.disabled})`]: {
        ':hover': {
          color: theme.palette.componentToken.button.textPrimaryHover,
          borderColor: theme.palette.componentToken.button.borderPrimaryHover,
          background: theme.palette.componentToken.button.bgPrimaryHover,
          ...(ownerState.color === 'red' && {
            color: theme.palette.componentToken.button.textPrimaryHover,
            background: theme.palette.red[80],
            borderColor: theme.palette.componentToken.button.borderPrimaryHover,
          }),
          ...(ownerState.color === 'mustard' && {
            color: theme.palette.componentToken.button.textPrimaryHover,
            background: theme.palette.orange[80],
            borderColor: theme.palette.componentToken.button.borderPrimaryHover,
          }),
        },
      },
      [`&.${iconButtonClasses.disabled}`]: {
        color: theme.palette.componentToken.button.textPrimaryDisabled,
        borderColor: theme.palette.componentToken.button.borderPrimaryDisabled,
        background: theme.palette.componentToken.button.bgPrimaryDisabled,
      },
    }),
    ...(ownerState.variant === 'secondary' && {
      color: theme.palette.componentToken.button.textSecondaryEnabled,
      borderColor: theme.palette.componentToken.button.borderSecondaryEnabled,
      background: theme.palette.componentToken.button.bgSecondaryEnabled,
      ...(ownerState.color === 'red' && {
        borderColor: theme.palette.red[90],
        color: theme.palette.red[90],
        background: theme.palette.componentToken.button.bgSecondaryEnabled,
      }),
      ...(ownerState.color === 'mustard' && {
        borderColor: theme.palette.orange[90],
        color: theme.palette.orange[90],
        background: theme.palette.componentToken.button.bgSecondaryEnabled,
      }),
      [`&:not(.${iconButtonClasses.disabled})`]: {
        ':hover': {
          borderColor: theme.palette.componentToken.button.borderSecondaryHover,
          color: theme.palette.componentToken.button.textSecondaryHover,
          background: theme.palette.componentToken.button.bgSecondaryHover,
          ...(ownerState.color === 'red' && {
            borderColor: theme.palette.red[90],
            color: theme.palette.red[90],
            background: theme.palette.red[5],
          }),
          ...(ownerState.color === 'mustard' && {
            borderColor: theme.palette.orange[90],
            color: theme.palette.orange[90],
            background: theme.palette.orange[10],
          }),
        },
      },
      [`&.${iconButtonClasses.disabled}`]: {
        borderColor:
          theme.palette.componentToken.button.borderSecondaryDisabled,
        color: theme.palette.componentToken.button.textSecondaryDisabled,
        background: theme.palette.componentToken.button.bgSecondaryDisabled,
      },
    }),
    [`&.${iconButtonClasses.root}`]: {
      ...(ownerState.loading && {
        color: theme.palette.transparent,
        ':hover': {
          color: theme.palette.transparent,
        },
      }),
    },
  }),
);

const rotate = keyframes`
0% {transform: rotate(0deg)}
100% {transform: rotate(360deg)}
`;

const ButtonLoadingIndicator = styled('div', {
  name: 'SfIconButton',
  slot: 'loadingIndicator',
})<{ ownerState: IconButtonOwnerState }>(({ theme, ownerState }) => ({
  position: 'absolute',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  left: '50%',
  top: '50%',
  '& svg': {
    animationName: `${rotate}`,
    animationDuration: '1s',
    animationTimingFunction: 'linear',
    animationIterationCount: 'infinite',
    color: 'inherit',
  },
  transform: 'translate(-50%, -50%)',
  ...(ownerState.variant === 'primary' && {
    color: theme.palette.componentToken.button.textPrimaryDisabled,
  }),
  ...(ownerState.variant === 'secondary' && {
    color: theme.palette.componentToken.button.textSecondaryDisabled,
  }),
  ...(ownerState.variant === 'tertiary' && {
    color: theme.palette.componentToken.button.textTertiaryDisabled,
  }),
}));

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  function Button(inProps, ref) {
    const props = useThemeProps({ props: inProps, name: 'SfIconButton' });
    const {
      children,
      variant = 'tertiary',
      size = 'small',
      shape = 'rectangle',
      loading = false,
      disabled: disabledProp,
      ...other
    } = props;
    const disabled = disabledProp || loading;
    const ownerState = { ...props, disabled, variant, size, loading, shape };

    return (
      <IconButtonRoot
        ref={ref}
        size={size}
        ownerState={ownerState}
        disabled={disabled}
        {...other}
      >
        {loading ? (
          <ButtonLoadingIndicator ownerState={ownerState}>
            <Icon icon="loading" />
          </ButtonLoadingIndicator>
        ) : null}
        {children}
      </IconButtonRoot>
    );
  },
);
