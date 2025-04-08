import {
  useCreateNewUserEventTypeMutation,
  useGetAllUserEventsQuery,
} from '@/api/userEventTypes';
import Icon from '@/components/Icon';
import {
  Box,
  Button,
  Dialog,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TextField } from '@/components/TextField';

export function CreateNewUserEventTypeDialog({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation();

  const [inputRef, setInputRef] = useState<HTMLInputElement | null>(null);

  useEffect(() => {
    if (inputRef) {
      inputRef.focus();
    }
  }, [inputRef]);

  const [eventTypeName, setEventTypeName] = useState<string>('');
  const [isError, setIsError] = useState(false);
  const { data: userEventTypes } = useGetAllUserEventsQuery({});

  const createNewUserEventTypeMutation = useCreateNewUserEventTypeMutation({
    onSuccess: () => {
      setEventTypeName('');
      setIsError(false);
      onClose();
    },
    onError: () => {
      setIsError(true);
    },
  });

  return (
    <Dialog
      open={isOpen}
      onClose={() => {
        setEventTypeName('');
        setIsError(false);
        onClose();
      }}
      PaperProps={{
        sx: {
          overflow: 'auto',
          padding: '32px 40px 32px 40px',
          borderRadius: '8px',
          width: '600px',
          maxWidth: 'xl',
        },
      }}
    >
      <Box sx={{ width: '100%' }}>
        <Stack spacing={1}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{
              paddingBottom: '16px',
            }}
          >
            <Typography variant="headline2">
              {t('settings.conversion-logging.create-new-event.modal.title', {
                defaultValue: 'Create new lead conversion type',
              })}
            </Typography>
            <IconButton
              onClick={() => {
                setEventTypeName('');
                setIsError(false);
                onClose();
              }}
            >
              <Icon icon="x-close" />
            </IconButton>
          </Stack>
          <TextField
            variant="outlined"
            label={t(
              'settings.conversion-logging.create-new-event.modal.event-type-label',
              {
                defaultValue: 'Type name',
              },
            )}
            placeholder={t(
              'settings.conversion-logging.create-new-event.modal.event-type-hint',
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
                    page.records.map((record) =>
                      record.event_type.toLowerCase(),
                    ),
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
                    'settings.conversion-logging.create-new-event.modal.event-type-error',
                    {
                      defaultValue: 'Already in use',
                    },
                  )
                : ''
            }
            inputRef={setInputRef}
          />
          <Stack direction="row" justifyContent="end" sx={{ pt: '20px' }}>
            <Button
              variant="contained"
              sx={{
                whiteSpace: 'nowrap',
                textAlign: 'center',
                minWidth: '100px',
              }}
              size="lg"
              disabled={eventTypeName.trim() === '' || isError}
              onClick={() => {
                const trimmedName = eventTypeName.trim();
                createNewUserEventTypeMutation.mutate({
                  eventType: trimmedName,
                });
              }}
            >
              {t(
                'settings.conversion-logging.create-new-event.modal.create-button-text',
                {
                  defaultValue: 'Create',
                },
              )}
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Dialog>
  );
}
