import { useTranslation } from 'react-i18next';

import {
  useDeleteContacts,
  useHardDeleteUserProfilesMutation,
} from '@/api/userProfile';
import { CustomDialog } from '@/components/AlertDialog';
import { Button } from '@/components/Button';

interface Props {
  open: boolean;
  onClose: () => void;
  userProfileId: string;
}

export const DeleteContactConfirmationDialog = ({
  open,
  onClose,
  userProfileId,
}: Props) => {
  const { t } = useTranslation();
  const { mutateAsync: deleteContacts, isPending: isPreparing } =
    useDeleteContacts();
  const { mutateAsync: hardDeleteContacts, isPending: isDeleting } =
    useHardDeleteUserProfilesMutation();

  const handleProceed = async () => {
    await deleteContacts({
      userProfileIds: [userProfileId],
      groupListName: '',
    });
    await hardDeleteContacts([userProfileId]);
    const url = new URL(window.location.href);
    url.searchParams.delete('conversationId');
    window.location.href = url.toString();
  };

  return (
    <CustomDialog
      open={open}
      onClose={onClose}
      title={t(
        'debug-mode.delete-contact-dialog-title',
        'Delete this contact permanently?',
      )}
      description={t(
        'debug-mode.delete-contact-dialog-decription',
        'By deleting this contact permanently, all the messages and data associated with this contact will be lost. This action may take several minutes, and cannot be undone.',
      )}
      renderDialogActions={() => (
        <Button
          onClick={handleProceed}
          variant="primary"
          color="red"
          size="lg"
          loading={isPreparing || isDeleting}
        >
          {t('delete', 'Delete')}
        </Button>
      )}
    />
  );
};
