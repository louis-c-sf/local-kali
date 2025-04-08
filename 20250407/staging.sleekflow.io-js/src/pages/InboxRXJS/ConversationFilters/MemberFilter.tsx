import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { InputLabel } from '@/components/InputLabel';
import { StaffComboBox } from '@/components/form/StaffComboBox';
import useMyStaff from '@/pages/InboxRXJS/hooks/useMyStaff';
import { StaffCore } from '@/services/companies/types';

import { useGetConversationsFilter } from '../hooks/useGetConversationsFilter';
import { useTypedPosthog } from '@/posthog/useTypedPosthog';

export default function MemberFilter() {
  const { t } = useTranslation();
  const myStaff = useMyStaff();
  const posthog = useTypedPosthog();
  const { getConversationsFilter, setGetConversationsFilter } =
    useGetConversationsFilter();

  const onMemberSelect = (staff: StaffCore) => {
    const selectedValue = staff.staffIdentityId;
    const selectedMember = getConversationsFilter?.assignedStaffId;
    posthog.capture('inbox:select_inbox_search_filters_by_members', {});
    setGetConversationsFilter({
      assignedStaffId:
        selectedValue === selectedMember ? undefined : selectedValue,
    });
  };

  if (myStaff?.roleType === 'Staff' || !myStaff) {
    return <></>;
  }

  return (
    <Box
      sx={{
        height: '100%',
        width: '260px',
        padding: (theme) => theme.spacing(1, 0.5, 0, 1.5),
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <InputLabel>{t('inbox.conversations-list.filters.members')}</InputLabel>
      <StaffComboBox
        slotProps={{
          list: {
            height: 330,
          },
        }}
        multiple={false}
        getOptions={(options) => {
          let _result = options;

          // DEVS-9109 commented out the filter for team admin
          if (myStaff.roleType === 'TeamAdmin') {
            // Filter out the staffs that are not associated with the team if team admin
            _result = _result.filter((staff) => {
              return (staff.associatedTeamIds || []).some((teamId) => {
                return myStaff?.associatedTeams.some((myTeam) => {
                  return myTeam.id === teamId;
                });
              });
            });
          }

          // Filter out the current user
          _result = _result.filter((staff) => {
            return myStaff?.id !== staff.staffIdentityId;
          });

          return _result;
        }}
        value={
          {
            staffIdentityId: getConversationsFilter?.assignedStaffId,
          } as StaffCore
        }
        onChange={(event, value) => {
          if (!value) {
            return;
          }
          onMemberSelect(value);
        }}
      />
    </Box>
  );
}
