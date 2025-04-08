import {
  Dialog,
  DialogActions,
  DialogContentText,
  DialogProps,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';

import { Avatar } from '@/components/Avatar';
import Icon from '@/components/Icon';

const AlertDialog = ({
  onClose,
  renderDialogActions,
  title,
  description,
  renderButton,
  componentProps,
}: {
  onClose?: () => void;
  renderDialogActions: ({
    closeModal,
  }: {
    closeModal: () => void;
  }) => React.ReactNode;
  title: string;
  description: string;
  renderButton: ({
    setOpen,
    isOpen,
  }: {
    setOpen: () => void;
    isOpen: boolean;
  }) => React.ReactNode;
  componentProps?: {
    dialog?: Omit<DialogProps, 'open'>;
  };
}) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {renderButton({ setOpen: () => setOpen(true), isOpen: open })}
      <CustomDialog
        open={open}
        onClose={() => {
          onClose?.();
          setOpen(false);
        }}
        renderDialogActions={renderDialogActions}
        title={title}
        description={description}
        componentProps={componentProps}
      />
    </>
  );
};

export default AlertDialog;

export function CustomDialog({
  open,
  onClose,
  renderDialogActions,
  title,
  description,
  componentProps,
  icon = (
    <Avatar color="lightRed" size={44}>
      <Icon icon="alert-triangle" />
    </Avatar>
  ),
  hideIcon = false,
}: {
  open: boolean;
  onClose?: () => void;
  renderDialogActions: ({
    closeModal,
  }: {
    closeModal: () => void;
  }) => React.ReactNode;
  title: string;
  description: React.ReactNode;
  icon?: React.ReactNode;
  componentProps?: {
    dialog?: Omit<DialogProps, 'open'>;
  };
  hideIcon?: boolean;
}) {
  return (
    <Dialog
      open={open}
      {...componentProps?.dialog}
      onClose={(event, reason) => {
        componentProps?.dialog?.onClose?.(event, reason);
        onClose?.();
      }}
    >
      <Stack justifyContent="space-between" padding="40px" borderRadius="8px">
        <Stack spacing={hideIcon ? 1 : 2} direction="row">
          {!hideIcon && icon}
          <Stack
            spacing="16px"
            sx={{ marginTop: hideIcon ? 0 : '-100px' }}
            width="464px"
          >
            <DialogTitle
              sx={{
                marginTop: '-5px',
                padding: 0,
              }}
              component={Stack}
              display="flex"
              direction="row"
              alignItems="center"
              justifyContent="space-between"
            >
              <Typography variant="headline2">{title}</Typography>

              <IconButton
                aria-label={'close'}
                onClick={() => {
                  onClose?.();
                }}
              >
                <Icon icon="x-close" />
              </IconButton>
            </DialogTitle>

            <DialogContentText component={Typography}>
              {description}
            </DialogContentText>
          </Stack>
        </Stack>
        {componentProps?.dialog?.children}
        <DialogActions sx={{ padding: '0', marginTop: '32px' }}>
          {renderDialogActions({ closeModal: () => onClose?.() })}
        </DialogActions>
      </Stack>
    </Dialog>
  );
}
