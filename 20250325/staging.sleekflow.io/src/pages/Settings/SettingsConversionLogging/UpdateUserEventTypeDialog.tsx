import {
  useGetAllUserEventsQuery,
  useUpdateUserEventTypeMutation,
} from '@/api/userEventTypes';
import { TextField } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DialogState } from './useEventsTable';
import { CustomDialog } from '@/components/AlertDialog';
import { Button } from '@/components/Button';

export function UpdateUserEventTypeDialog({
  dialogState,
  onClose,
}: {
  dialogState: DialogState | null;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const userEventType =
    dialogState?.type === 'edit' ? dialogState.userEventType : null;
  const [eventTypeName, setEventTypeName] = useState<string>(
    userEventType?.event_type || '',
  );
  const [isError, setIsError] = useState(false);
  const { data: userEventTypes } = useGetAllUserEventsQuery({});

  const updateUserEventTypeMutation = useUpdateUserEventTypeMutation({
    onSuccess: () => {
      setIsError(false);
      onClose();
    },
    onError: () => {
      setIsError(true);
    },
  });

  const handleUpdate = () => {
    if (!userEventType || eventTypeName.trim() === '') return;

    const trimmedName = eventTypeName.trim();

    // Skip update if name hasn't changed
    if (userEventType.event_type === trimmedName) {
      console.log('Update is skipped as the event type name is unchanged.');
      setIsError(false);
      onClose();
      return;
    }

    // Check for duplicates one final time before updating
    const existingNames =
      userEventTypes?.pages?.flatMap((page) =>
        page.records
          .filter((record) => record.id !== userEventType.id) // Exclude current event type
          .map((record) => record.event_type.toLowerCase()),
      ) || [];

    if (existingNames.includes(trimmedName.toLowerCase())) {
      setIsError(true);
      return;
    }

    setIsError(false);
    updateUserEventTypeMutation.mutate({
      id: userEventType.id,
      updatedEventType: trimmedName,
    });
  };

  return (
    <CustomDialog
      open={dialogState?.type === 'edit'}
      title={t('settings.conversion-logging.update-event.modal.title', {
        defaultValue: 'Update lead conversion type',
      })}
      description={t(
        'settings.conversion-logging.update-event.modal.description',
        {
          defaultValue:
            'Once renamed, you will not be able to use the existing name again. Please ensure that the new name accurately reflects the purpose of this log type',
        },
      )}
      onClose={() => {
        setEventTypeName('');
        setIsError(false);
        onClose();
      }}
      componentProps={{
        dialog: {
          maxWidth: 'sm',
          children: (
            <TextField
              fullWidth
              variant="outlined"
              label={t(
                'settings.conversion-logging.update-event.modal.event-type-label',
                {
                  defaultValue: 'Type name',
                },
              )}
              placeholder={t(
                'settings.conversion-logging.update-event.modal.event-type-hint',
                {
                  defaultValue: 'For example: Reading a campaign message',
                },
              )}
              value={eventTypeName}
              onChange={(event) => {
                const newValue = event.target.value;
                setEventTypeName(newValue);

                if (newValue.trim() !== '') {
                  const existingNames =
                    userEventTypes?.pages?.flatMap((page) =>
                      page.records
                        .filter((record) => record.id !== userEventType?.id) // Exclude current event type
                        .map((record) => record.event_type.toLowerCase()),
                    ) || [];

                  setIsError(
                    existingNames.includes(newValue.trim().toLowerCase()),
                  );
                } else {
                  setIsError(false);
                }
              }}
              error={isError}
              helperText={
                isError
                  ? t(
                      'settings.conversion-logging.update-event.modal.event-type-error',
                      {
                        defaultValue: 'Already in use',
                      },
                    )
                  : ''
              }
              sx={{ mt: 3 }}
            />
          ),
        },
      }}
      renderDialogActions={() => {
        return (
          <Button
            variant="primary"
            disabled={!eventTypeName.trim() || isError}
            onClick={handleUpdate}
          >
            {t(
              'settings.conversion-logging.update-event.modal.update-button-text',
              {
                defaultValue: 'Update',
              },
            )}
          </Button>
        );
      }}
    />
  );
}
