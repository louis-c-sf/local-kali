import { AlertColor } from '@mui/material';
import { injectable } from 'inversify';

import {
  infoSnackbar,
  successSnackbar,
  warningSnackbar,
  errorSnackbar,
  loadingSnackbar,
  dismissSnackbar,
  SnackbarOptions,
} from '@/hooks/useSnackbar';

export type ToastMessageType = AlertColor | 'loading';

@injectable()
export class ToastMessagesService {
  public showToastMessage(
    type: ToastMessageType,
    message: string,
    options?: SnackbarOptions & {
      completed?: boolean;
    },
  ) {
    switch (type) {
      case 'info':
        return infoSnackbar(message, options);
      case 'success':
        return successSnackbar(message, options);
      case 'warning':
        return warningSnackbar(message, options);
      case 'error':
        return errorSnackbar(message, options);
      case 'loading':
        return loadingSnackbar(message, options);
    }
  }

  public dismissToastMessage(id: string) {
    dismissSnackbar(id);
  }
}
