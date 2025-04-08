import { Alert, AlertProps, CircularProgress } from '@mui/material';
import type { SyntheticEvent } from 'react';
import type { Toast } from 'react-hot-toast';
import toast, { Renderable, ToastOptions } from 'react-hot-toast/headless';

export type SnackbarOptions = Pick<AlertProps, 'onClose' | 'action' | 'sx'> &
  Omit<ToastOptions, 'style'>;

export type SnackbarFn = (
  content: Renderable,
  options?: SnackbarOptions,
) => string;

export type LoadingSnackbarFn = (
  message: Renderable,
  options: SnackbarOptions & { completed?: boolean },
) => string;

export interface Snackbar {
  info: SnackbarFn;
  error: SnackbarFn;
  warning: SnackbarFn;
  success: SnackbarFn;
  loading: LoadingSnackbarFn;
  dismiss: (id?: string) => void;
}

const _close =
  (t: Toast, onClose?: (event: SyntheticEvent) => void) =>
  (e: SyntheticEvent) => {
    onClose && onClose(e);
    toast.dismiss(t.id);
  };

const infoSnackbar = (
  message: Renderable,
  options: SnackbarOptions = { duration: 5000 },
) => {
  const { action, onClose, sx, ...toastProps } = options;
  return toast(
    (t) => (
      <Alert
        onClose={action === undefined ? _close(t, onClose) : undefined}
        {...{ action, sx }}
        color="info"
      >
        {message}
      </Alert>
    ),
    toastProps,
  );
};

const successSnackbar = (
  message: Renderable,
  options: SnackbarOptions = { duration: 5000 },
) => {
  const { action, onClose, sx, ...toastProps } = options;
  return toast(
    (t) => (
      <Alert
        onClose={action === undefined ? _close(t, onClose) : undefined}
        {...{ action, sx }}
        color="success"
      >
        {message}
      </Alert>
    ),
    toastProps,
  );
};

const warningSnackbar = (
  message: Renderable,
  options: SnackbarOptions = { duration: 5000 },
) => {
  const { action, onClose, sx, ...toastProps } = options;
  return toast(
    (t) => (
      <Alert
        onClose={action === undefined ? _close(t, onClose) : undefined}
        {...{ action, sx }}
        color="warning"
      >
        {message}
      </Alert>
    ),
    toastProps,
  );
};

const errorSnackbar = (
  message: Renderable,
  options: SnackbarOptions = { duration: 5000 },
) => {
  const { action, onClose, sx, ...toastProps } = options;
  return toast(
    (t) => (
      <Alert
        onClose={action === undefined ? _close(t, onClose) : undefined}
        {...{ action, sx }}
        color="error"
      >
        {message}
      </Alert>
    ),
    toastProps,
  );
};

const loadingSnackbar = (
  message: Renderable,
  options: SnackbarOptions & { completed?: boolean } = {},
) => {
  const { action, onClose, sx, completed = false, ...toastProps } = options;
  return toast(
    (t) => (
      <Alert
        onClose={action === undefined ? _close(t, onClose) : undefined}
        action={completed ? null : <CircularProgress color="inherit" />}
        sx={sx}
        color="info"
      >
        {message}
      </Alert>
    ),
    toastProps,
  );
};

const dismissSnackbar = (id?: string) => toast.dismiss(id);

// A wrapper around react-hot-toast because it doesn't support custom variants
// https://github.com/timolins/react-hot-toast/issues/23
const useSnackbar = (): Snackbar => {
  return {
    info: infoSnackbar,
    success: successSnackbar,
    warning: warningSnackbar,
    error: errorSnackbar,
    loading: loadingSnackbar,
    dismiss: dismissSnackbar,
  };
};

export default useSnackbar;

export {
  infoSnackbar,
  successSnackbar,
  warningSnackbar,
  errorSnackbar,
  loadingSnackbar,
  dismissSnackbar,
};
