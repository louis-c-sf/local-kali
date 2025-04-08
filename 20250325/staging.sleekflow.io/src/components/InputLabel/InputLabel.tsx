import { useFormControlContext } from '@mui/base';
import {
  generateUtilityClasses,
  InputLabel as InputLabelBase,
  useThemeProps,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import React, { useEffect, useState } from 'react';

import { InputLabelOwnerState, InputLabelProps } from './InputLabelTypes';

const InputLabelRoot = styled(InputLabelBase, {
  name: 'SfInputLabel',
  slot: 'root',
  overridesResolver: (props, styles) => {
    return [styles.root];
  },
})<InputLabelProps & { ownerState: InputLabelOwnerState }>(
  ({ theme, ownerState }) => ({
    textTransform: 'uppercase',
    ...theme.typography.subtitle,
    color: theme.palette.componentToken.input.titleEnabled,
    ...(ownerState.error && {
      color: theme.palette.componentToken.input.titleError,
    }),
    ...(ownerState.focused && {
      color: theme.palette.componentToken.input.titleFocus,
    }),
    display: 'flex',
  }),
);

const EndIconWrapper = styled('div', {
  name: 'SfFormLabel',
  slot: 'endIconWrapper',
})<{ ownerState: InputLabelOwnerState }>(({ theme, ownerState }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  pointerEvents: 'auto',
  '& svg': {
    width: '12px',
    height: '12px',
    marginLeft: theme.spacing(0.5),
    color: theme.palette.componentToken.input.titleEnabled,
    ...(ownerState.error && {
      color: theme.palette.componentToken.input.titleError,
    }),
    ...(ownerState.focused && {
      color: theme.palette.componentToken.input.titleFocus,
    }),
  },
}));

export const InputLabel = React.forwardRef<HTMLLabelElement, InputLabelProps>(
  function FormLabel(inProps, ref) {
    const formControlContext = useFormControlContext();
    const [dirty, setDirty] = useState(false);
    const focused = formControlContext?.focused;

    useEffect(() => {
      if (formControlContext?.filled) {
        setDirty(true);
      }
    }, [formControlContext]);

    const showRequiredError =
      dirty && formControlContext?.required && !formControlContext.filled;
    const props = useThemeProps({ props: inProps, name: 'SfFormLabel' });
    const { sx, error: errorProp, children, endIcon, ...other } = props;
    const error = formControlContext?.error || showRequiredError || errorProp;
    const defaultClasses = generateUtilityClasses('SfInput', ['root']);
    const ownerState = {
      ...props,
      error,
      focused,
    };

    return (
      <InputLabelRoot
        ref={ref}
        className={defaultClasses.root}
        sx={sx}
        ownerState={ownerState}
        {...other}
      >
        {children}
        <EndIconWrapper ownerState={ownerState}>{endIcon}</EndIconWrapper>
      </InputLabelRoot>
    );
  },
);
