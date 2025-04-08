import { Box, BoxProps } from '@mui/material';
import { ForwardedRef, forwardRef } from 'react';

export const LinkOverlay = forwardRef(function LinkOverlay<
  E extends React.ElementType,
>(
  { sx, className, ...rest }: BoxProps<E, { component?: E }>,
  ref: ForwardedRef<E>,
) {
  return (
    <Box
      sx={[
        {
          position: 'static',
          '&::before': {
            content: "''",
            cursor: 'inherit',
            display: 'block',
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 0,
            width: '100%',
            height: '100%',
          },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      ref={ref}
      className={`sleekflow-linkbox__overlay ${className}`}
      {...rest}
    />
  );
});

export const LinkBox = forwardRef(function LinkBox<E extends React.ElementType>(
  { sx, ...rest }: BoxProps<E, { component?: E }>,
  ref: ForwardedRef<unknown>,
) {
  return (
    <Box
      sx={[
        {
          /* Elevate the links and abbreviations up */
          'a[href]:not(.sleekflow-linkbox__overlay), abbr[title]': {
            position: 'relative',
            zIndex: 1,
          },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      ref={ref}
      position="relative"
      {...rest}
    />
  );
});
