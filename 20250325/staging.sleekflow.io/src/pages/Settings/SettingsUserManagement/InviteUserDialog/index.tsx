import { useState } from 'react';
import { Button } from '@/components/Button';
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import Icon from '@/components/Icon';
import { useTranslation } from 'react-i18next';
import InviteByEmail from './InviteByEmail';
import InviteByLink from './InviteByLink';

const tabs = { email: 'email', link: 'link' } as const;
type Tab = (typeof tabs)[keyof typeof tabs];

export default function InviteUserDialog({
  renderButton,
}: {
  renderButton: ({
    setOpen,
    isOpen,
  }: {
    setOpen: () => void;
    isOpen: boolean;
  }) => React.ReactNode;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>(tabs.email);
  const [currentForm, setCurrentForm] = useState('invite-by-email-form');
  const [isLoading, setIsLoading] = useState(false);

  const closeDialog = () => {
    setOpen(false);
  };

  const changeActiveTab = (_event: unknown, value: Tab) => {
    setActiveTab(value);
    if (value === tabs.email) {
      setCurrentForm('invite-by-email-form');
    } else {
      setCurrentForm('invite-by-link-form');
    }
  };

  return (
    <>
      {renderButton({ setOpen: () => setOpen(true), isOpen: open })}
      <Dialog
        open={open}
        onClose={closeDialog}
        PaperProps={{ sx: { p: 4, width: '640px' } }}
      >
        <DialogTitle
          sx={{ p: 0 }}
          component={Stack}
          display="flex"
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography variant="headline2">
            {t('settings.invite-user-dialog.title', {
              defaultValue: 'Invite team member',
            })}
          </Typography>
          <IconButton onClick={closeDialog}>
            <Icon icon="x-close" />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ px: 0 }}>
          <Tabs
            value={activeTab}
            onChange={changeActiveTab}
            aria-label="basic tabs example"
          >
            <Tab
              label={t('settings.invite-user-dialog.invite-by-email.title', {
                defaultValue: 'Invite by email',
              })}
              value={tabs.email}
            />
            <Tab
              label={t('settings.invite-user-dialog.invite-with-link.title', {
                defaultValue: 'Invite with link',
              })}
              value={tabs.link}
            />
          </Tabs>
          <Box>
            {activeTab === tabs.email && (
              <InviteByEmail
                setIsLoading={setIsLoading}
                closeDialog={closeDialog}
              />
            )}
            {activeTab === tabs.link && (
              <InviteByLink
                setIsLoading={setIsLoading}
                closeDialog={closeDialog}
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 0 }}>
          <Button
            variant="contained"
            size="lg"
            type="submit"
            form={currentForm}
            loading={isLoading}
          >
            {activeTab === tabs.email
              ? t('settings.invite-user-dialog.invite-button', {
                  defaultValue: 'Invite',
                })
              : t('settings.invite-user-dialog.copy-link-button', {
                  defaultValue: 'Copy link',
                })}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
