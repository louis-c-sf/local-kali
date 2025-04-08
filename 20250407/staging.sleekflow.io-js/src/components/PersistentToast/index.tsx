import { Stack, StackProps, Typography } from '@mui/material';
import { ReactNode } from 'react';
import { IconButton, IconButtonProps } from '../IconButton';
import Icon from '../Icon';
import { Button, ButtonProps } from '../Button';

export interface PersistentToastProps extends Omit<StackProps, 'title'> {
  'data-testid': string;
  title: ReactNode;
  description: ReactNode;
  closeButtonProps?: IconButtonProps;
  actionButtonProps?: ButtonProps;
}

export const PersistentToast = ({
  title,
  description,
  closeButtonProps,
  actionButtonProps,
  ...rest
}: PersistentToastProps) => {
  return (
    <Stack
      borderLeft={8}
      borderColor="blue.90"
      bgcolor="white"
      width={400}
      alignItems="flex-start"
      borderRadius={1}
      py="16px"
      px="28px"
      gap={2}
      boxShadow={(theme) => theme.shadows[4]}
      {...rest}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        width="100%"
      >
        <Typography variant="headline3">{title}</Typography>
        <IconButton sx={{ width: 20, height: 20 }} {...closeButtonProps}>
          <Icon icon="x-close" />
        </IconButton>
      </Stack>
      <Typography>{description}</Typography>
      <Button variant="contained" color="primary" {...actionButtonProps} />
    </Stack>
  );
};
