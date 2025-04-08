import { Box, Button, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useGetAllUserEventsQuery } from '@/api/userEventTypes';
import EmptyResult from '@/components/EmptyResult';
import PageLayoutSlot from '@/components/PageLayoutSlot';
import PageTitle from '@/components/PageTitle';

import { useSettingAccessRuleGuard } from '../hooks/useLegacySettingAccessRuleGuard';
import SettingsAccessDeniedError from '../shared/SettingsAccessDeniedError';
import { useSettingsLayout } from '../shared/SettingsLayout';
import { CreateNewUserEventTypeDialog } from './CreateNewUserEventTypeDialog';
import EventTypesTable from './EventTypesTable';
import { useAnalyticsEventsFeatureGuard } from '@/pages/Analytics/hooks/useAnalyticsEventsFeatureGuard';

export default function SettingsConversionLogging() {
  const { pageTitleEl } = useSettingsLayout();
  const { t } = useTranslation();
  const { data: userEventTypes } = useGetAllUserEventsQuery({});
  const settingsGuard = useSettingAccessRuleGuard();

  const [
    isCreateNewUserEventTypeDialogOpen,
    setIsCreateNewUserEventTypeDialogOpen,
  ] = useState(false);

  const handleCreateNewEvent = () => {
    setIsCreateNewUserEventTypeDialogOpen(true);
  };
  const featureGuard = useAnalyticsEventsFeatureGuard();

  if (
    !settingsGuard.isConversionLoggingAllowToView ||
    !featureGuard.settingsEnabled
  ) {
    throw new SettingsAccessDeniedError();
  }

  const hasEvents = (userEventTypes?.pages?.[0]?.records?.length || 0) > 0;

  return (
    <Stack sx={{ p: '4px 0', height: '100%' }}>
      <PageLayoutSlot anchorEl={pageTitleEl}>
        <PageTitle
          title={t('settings.menu.contacts-and-data.conversion-logging', {
            defaultValue: 'Conversion logging',
          })}
          subtitleComponent={
            <Typography variant="subtitle" sx={{ textTransform: 'uppercase' }}>
              {t('settings.menu.contacts-and-data.title')}
            </Typography>
          }
        />
      </PageLayoutSlot>
      {hasEvents ? (
        <Stack spacing={3}>
          <Stack
            direction="row"
            p="8px 0px 0px 0px"
            justifyContent="space-between"
            alignItems="flex-start"
            spacing={4}
          >
            <Typography variant="body1">
              {t('conversion-logging.brief', {
                defaultValue:
                  'Set up conversion events to automatically track user interactions and campaign effectiveness through the flow builder. Customize each event type to ensure you gather meaningful data that supports your marketing strategies.',
              })}
            </Typography>
            <Button
              variant="contained"
              sx={{
                whiteSpace: 'nowrap',
                textAlign: 'center',
                minWidth: '150px',
              }}
              onClick={handleCreateNewEvent}
            >
              {t('settings.conversion-logging.create-user-event', {
                defaultValue: 'Create new type',
              })}
            </Button>
          </Stack>

          <Typography variant="body2" color="text.secondary">
            {t('conversion-logging.total-count', {
              defaultValue: 'Total: {count} / 100 events',
              count: userEventTypes?.pages[0]?.count ?? 0,
            })}
          </Typography>

          <EventTypesTable />
        </Stack>
      ) : (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            textAlign: 'center',
            mt: -8,
          }}
        >
          <EmptyResult
            title={t('conversion-logging.empty-state.title', {
              defaultValue: 'No conversion tracking events here',
            })}
            description={t('conversion-logging.empty-state.description', {
              defaultValue:
                'Create conversion tracking events to automatically track user interactions and campaign effectiveness through Flow Builder, and analyze conversion data using the Conversion Analytics Dashboard',
            })}
            actions={
              <Button variant="contained" onClick={handleCreateNewEvent}>
                {t('conversion-logging.empty-state.button', {
                  defaultValue: 'Create new event',
                })}
              </Button>
            }
          />
        </Box>
      )}
      <CreateNewUserEventTypeDialog
        isOpen={isCreateNewUserEventTypeDialogOpen}
        onClose={() => {
          setIsCreateNewUserEventTypeDialogOpen(false);
        }}
      />
    </Stack>
  );
}
