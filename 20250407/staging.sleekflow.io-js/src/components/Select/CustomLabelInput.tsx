import { Stack } from '@mui/material';
import { ComponentPropsWithoutRef, forwardRef } from 'react';

export interface CustomLabelInputProps
  extends Omit<ComponentPropsWithoutRef<'input'>, 'size'> {
  size?: 'small' | 'medium';
}

export const CustomLabelInput = forwardRef<
  HTMLInputElement,
  CustomLabelInputProps
>(({ children, size, ...props }, ref) => {
  return (
    <>
      <Stack
        direction="row"
        alignItems="center"
        overflow="hidden"
        sx={(theme) => ({
          height: '24px',
          pointerEvents: 'none', // for retaining focus on <Select /> after closing menu
          paddingInlineStart: 1.5,
          ...theme.typography[size === 'small' ? 'body2' : 'body1'],
          color: 'inherit',
          bgcolor: 'inherit',
        })}
      >
        {children}
      </Stack>
      <input ref={ref} {...props} />
    </>
  );
});

CustomLabelInput.displayName = 'CustomLabelInput';
