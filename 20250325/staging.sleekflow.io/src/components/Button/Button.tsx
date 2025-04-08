import {
  Button as ButtonBase,
  ButtonBaseTypeMap,
  buttonClasses,
  keyframes,
  styled,
  useThemeProps,
} from '@mui/material';
import { OverridableComponent } from '@mui/material/OverridableComponent';
import React from 'react';

import Icon from '@/components/Icon';

import { ButtonOwnerState, ButtonProps } from './ButtonTypes';

const ButtonRoot = styled(ButtonBase, {
  name: 'SfButton',
  slot: 'root',
  overridesResolver: (styles) => {
    return [styles.root];
  },
})<{ ownerState: ButtonOwnerState }>(({ theme, ownerState }) => ({
  ...(ownerState.shape === 'rectangle' && {
    borderRadius: theme.shape.borderRadius,
  }),
  ...(ownerState.shape === 'pill' && {
    borderRadius: theme.shape.borderRadius * 500,
  }),
  ...(ownerState.loading && {
    [`&.${buttonClasses.root}`]: {
      color: theme.palette.transparent,
      ':hover': {
        color: theme.palette.transparent,
      },
    },
  }),
}));

export const ButtonStartDecorator = styled('span', {
  name: 'SfButton',
  slot: 'startDecorator',
  overridesResolver: (props, styles) => styles.startDecorator,
})<{ ownerState: ButtonOwnerState }>(({ theme }) => ({
  paddingRight: theme.spacing(1.25),
  display: 'inherit',
  alignItems: 'center',
  justifyContent: 'center',
  '& svg': {
    color: 'inherit',
    width: '16px',
    height: '16px',
  },
}));
const ButtonDivider = styled('span', {
  name: 'SfButton',
  slot: 'divider',
  overridesResolver: (props, styles) => styles.divider,
})<{ ownerState: ButtonOwnerState }>(({ theme }) => ({
  width: '1px',
  marginLeft: theme.spacing(2),
  marginRight: theme.spacing(2),
  background: 'currentColor',
  alignSelf: 'stretch',
}));

export const ButtonEndDecorator = styled('span', {
  name: 'SfButton',
  slot: 'endDecorator',
  overridesResolver: (props, styles) => styles.endDecorator,
})<{ ownerState: ButtonOwnerState }>(() => ({
  display: 'inherit',
  alignItems: 'center',
  justifyContent: 'center',
  '& svg': {
    color: 'inherit',
    width: '16px',
    height: '16px',
  },
}));

const rotate = keyframes`
0% {transform: rotate(0deg)}
100% {transform: rotate(360deg)}
`;

const ButtonLoadingIndicator = styled('div', {
  name: 'SfButton',
  slot: 'loadingIndicator',
})<{ ownerState: ButtonOwnerState }>(({ theme, ownerState }) => ({
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
    width: '20px',
    height: '20px',
  },
  transform: 'translate(-50%, -50%)',
  ...((ownerState.variant === 'primary' ||
    ownerState.variant === 'contained') && {
    color: theme.palette.componentToken.button.textPrimaryDisabled,
  }),
  ...((ownerState.variant === 'secondary' ||
    ownerState.variant === 'outlined') && {
    color: theme.palette.componentToken.button.textSecondaryDisabled,
  }),
  ...(ownerState.variant === 'tertiary' && {
    color: theme.palette.componentToken.button.textTertiaryDisabled,
  }),
}));

export const Button = React.forwardRef(function Button<
  RootComponentType extends React.ElementType = ButtonBaseTypeMap['defaultComponent'],
>(
  inProps: ButtonProps<RootComponentType>,
  ref: React.ForwardedRef<HTMLButtonElement>,
) {
  const props = useThemeProps({ props: inProps, name: 'SfButton' });

  const {
    selected,
    children,
    variant = 'tertiary',
    size = 'small',
    shape = 'rectangle',
    startIcon,
    endIcon,
    loading = false,
    disabled: disabledProp,
    ...other
  } = props;
  const disabled = disabledProp || loading;
  const ownerState = {
    ...other,
    selected,
    disabled,
    variant,
    size,
    loading,
    shape,
  };
  return (
    <ButtonRoot
      ref={ref}
      size={size}
      variant={variant}
      ownerState={ownerState}
      disabled={disabled}
      {...other}
    >
      {loading ? (
        <ButtonLoadingIndicator ownerState={ownerState}>
          <Icon icon="loading" />
        </ButtonLoadingIndicator>
      ) : null}
      {startIcon ? (
        <ButtonStartDecorator ownerState={ownerState}>
          {startIcon}
        </ButtonStartDecorator>
      ) : null}
      {children}
      {endIcon ? (
        <>
          <ButtonDivider ownerState={ownerState} />
          <ButtonEndDecorator ownerState={ownerState}>
            {endIcon}
          </ButtonEndDecorator>
        </>
      ) : null}
    </ButtonRoot>
  );
}) as OverridableComponent<ButtonBaseTypeMap<ButtonProps>>;
