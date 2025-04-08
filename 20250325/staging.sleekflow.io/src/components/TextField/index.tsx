import {
  inputClasses,
  outlinedInputClasses,
  styled,
  TextField as TextFieldBase,
  textFieldClasses,
  TextFieldProps as MuiTextFieldProps,
} from '@mui/material';

const TextFieldRoot = styled(TextFieldBase)<{
  ownerState: TextFieldOwnerState;
}>(({ ownerState, theme }) => ({
  [`&.${textFieldClasses.root} .${inputClasses.root},.${outlinedInputClasses.root}`]:
    {
      ...(ownerState?.InputProps?.shape === 'pill' && {
        borderRadius: theme.shape.borderRadius * 999,
      }),
    },
}));

export interface OutlinedInputProps
  extends Omit<MuiTextFieldProps, 'InputProps'> {
  InputProps?: MuiTextFieldProps['InputProps'] & {
    shape?: 'rectangle' | 'pill';
  };
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface TextFieldOwnerState extends OutlinedInputProps {}

export function TextField(props: OutlinedInputProps) {
  const { ...rest } = props;
  const ownerState = { ...rest };
  return <TextFieldRoot {...rest} ownerState={ownerState} />;
}
