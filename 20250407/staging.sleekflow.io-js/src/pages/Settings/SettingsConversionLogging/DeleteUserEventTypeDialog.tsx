import { useTranslation } from 'react-i18next';

import { CustomDialog } from '../../../components/AlertDialog';
import { Button } from '../../../components/Button';
import { DialogState } from './useEventsTable';
import { useDeleteUserEventTypesMutation } from '@/api/userEventTypes';

export function DeleteUserEventTypeDialog({
  dialogState,
  onClose,
}: {
  dialogState: DialogState | null;
  onClose: () => void;
}) {
  const { t } = useTranslation();

  const userEventTypes =
    dialogState?.type === 'delete' ? dialogState.userEventTypes : [];

  const singleTitle = t('settings.conversion-logging.delete.title', {
    defaultValue: 'Delete event type?',
  });

  const multiTitle = t('settings.conversion-logging.delete-multi.title', {
    defaultValue:
      'Delete {count, number} {count, plural,\n\none {event type}\n\nother {event types}\n\n}?',
    count: userEventTypes.length,
  });

  const descriptionSingle = t(
    'settings.conversion-logging.delete.description',
    {
      defaultValue: 'Deleting the selected event type cannot be undone.',
    },
  );
  const descriptionMulti = t(
    'settings.conversion-logging.delete-multi.description',
    {
      defaultValue: 'Deleting the selected event types cannot be undone.',
    },
  );

  const deleteUserEventTypeMutation = useDeleteUserEventTypesMutation({
    onSuccess: () => {
      onClose();
    },
  });

  return (
    <CustomDialog
      open={dialogState?.type === 'delete'}
      title={userEventTypes.length === 1 ? singleTitle : multiTitle}
      description={
        userEventTypes.length === 1 ? descriptionSingle : descriptionMulti
      }
      onClose={onClose}
      renderDialogActions={() => {
        return (
          <Button
            variant={'primary'}
            onClick={() => {
              deleteUserEventTypeMutation.mutate({
                ids: userEventTypes.map((type) => type.id),
              });
            }}
          >
            {t('delete', {
              defaultValue: 'Delete',
            })}
          </Button>
        );
      }}
    />
  );
}
