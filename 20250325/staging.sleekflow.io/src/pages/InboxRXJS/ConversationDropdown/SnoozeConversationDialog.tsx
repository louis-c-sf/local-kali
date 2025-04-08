import { yupResolver } from '@hookform/resolvers/yup';
import {
  Box,
  Dialog,
  IconButton,
  InputLabel,
  Stack,
  Typography,
} from '@mui/material';
import dayjs, { Dayjs, isDayjs } from 'dayjs';
import { Controller, useForm, useFormState } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';

import { Button } from '@/components/Button';
import Icon from '@/components/Icon';
import { DatePicker } from '@/components/date-time-pickers/DatePicker';
import { TimePicker } from '@/components/date-time-pickers/TimePicker';
import useSnackbar from '@/hooks/useSnackbar';
import { ConversationWrapper } from '@/services/conversations/managers/conversation-wrapper';
import { useSnoozeConversationMutation } from '@/api/conversation';

const validationSchema = yup.object().shape({
  conversationId: yup.string().required('Conversation ID is required'),
  selectedTime: yup
    .mixed((input): input is Dayjs => isDayjs(input))
    .required('Selected time is required'),
  selectedDate: yup
    .mixed((input): input is Dayjs => isDayjs(input))
    .required('Selected date is required')
    .test(
      'isAfterToday',
      'Selected date and time must be after the current date and time',
      function (selectedDate) {
        const { selectedTime } = this.parent;
        const combinedDateTime = selectedDate
          .hour(selectedTime.hour())
          .minute(selectedTime.minute());
        return combinedDateTime.isAfter(dayjs());
      },
    ),
});

const SnoozeConversationDialog = ({
  isSnoozeConversationModalOpen,
  setIsSnoozeConversationModalOpen,
  conversation,
}: {
  isSnoozeConversationModalOpen: boolean;
  setIsSnoozeConversationModalOpen: (isOpen: boolean) => void;
  conversation: ConversationWrapper;
}) => {
  const { t } = useTranslation();
  const snackbar = useSnackbar();
  const { mutateAsync } = useSnoozeConversationMutation(conversation.getId(), {
    onSuccess: () => {
      snackbar.info(
        t('inbox.open-conversation.success-toast', {
          defaultValue: 'You have snoozed this conversation successfully',
        }),
      );
      handleClose(undefined);
    },
    onError: () => {
      snackbar.error(
        t('inbox.open-conversation.error-toast', {
          defaultValue: 'You failed to snooze this conversation',
        }),
      );
    },
  });
  const dayjsNow = dayjs();
  const conversationId = conversation.getId();
  const methods = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      conversationId,
      selectedDate: dayjsNow,
      selectedTime: dayjsNow,
    },
    mode: 'all',
  });

  const { handleSubmit, control } = methods;
  const { isValid, isSubmitting } = useFormState({
    control,
  });
  const handleClose = (event: any | undefined) => {
    if (event && event.stopPropagation) {
      event.stopPropagation();
    }

    setIsSnoozeConversationModalOpen(false);
  };

  return (
    <Dialog open={isSnoozeConversationModalOpen} onClose={handleClose}>
      <Stack
        component="form"
        onSubmit={handleSubmit(async (data) => {
          const combinedDateTime = data.selectedDate
            .hour(data.selectedTime.hour())
            .minute(data.selectedTime.minute());
          await mutateAsync(combinedDateTime);
        })}
        sx={{ width: '640px', p: '40px' }}
        direction="column"
        spacing={3}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography
            variant="headline2"
            sx={{ fontSize: 20, fontWeight: 600, color: 'darkBlue.90' }}
          >
            {t('inbox.snooze-conversation.modal.title')}
          </Typography>
          <IconButton aria-label="Close modal" onClick={handleClose}>
            <Icon icon="x-close" size={24} />
          </IconButton>
        </Stack>
        <Typography
          variant="body1"
          sx={{ fontSize: 14, fontWeight: 400, color: 'gray.90' }}
        >
          {t('inbox.snooze-conversation.modal.description')}
        </Typography>

        <Stack direction="row" gap={3} alignItems="center" mb="16px">
          <Box flex="1 1">
            <InputLabel>{t('inbox.snooze-conversation.modal.date')}</InputLabel>
            <Controller
              control={control}
              render={({
                field: { onChange, value, ...rest },
                fieldState: { error },
              }) => {
                return (
                  <DatePicker
                    error={!!error}
                    value={value}
                    minDate={dayjsNow}
                    onChange={(newDate) => {
                      onChange(newDate);
                    }}
                    {...rest}
                  />
                );
              }}
              name="selectedDate"
            />
          </Box>
          <Box flex="1 1">
            <InputLabel>{t('inbox.snooze-conversation.modal.time')}</InputLabel>
            <Controller
              control={control}
              render={({
                field: { onChange, value, ...rest },
                fieldState: { error },
              }) => {
                return (
                  <TimePicker
                    error={!!error}
                    disablePast={true}
                    value={value}
                    onChange={(newDate) => {
                      onChange(newDate);
                    }}
                    interval={30}
                    {...rest}
                  />
                );
              }}
              name="selectedTime"
            />
          </Box>
        </Stack>
        <Stack justifyContent="flex-end" direction="row" paddingTop="8px">
          <Button
            disabled={!isValid}
            sx={{ minWidth: '84px' }}
            size="large"
            loading={isSubmitting}
            variant="contained"
            type="submit"
          >
            {t('inbox.snooze-conversation.modal.apply')}
          </Button>
        </Stack>
      </Stack>
    </Dialog>
  );
};

export default SnoozeConversationDialog;
