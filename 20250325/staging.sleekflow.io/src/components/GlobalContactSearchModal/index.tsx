import { Dialog, Input, InputAdornment, Stack, styled } from '@mui/material';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebounce } from 'react-use';

import { useUserProfileQuery } from '@/api/userProfile';
import Icon from '@/components/Icon';

import LoadingSkeleton from './LoadingSkeleton';
import SearchResultMenu from './SearchResultMenu';
import SearchTips from './SearchTips';
import { useCompany } from '../../api/company';
import {
  findEmailUserProfileField,
  findPhoneNumberUserProfileField,
} from '../../pages/Contacts/shared/utils';
import { isValidPhoneNumber, parsePhoneNumber } from 'libphonenumber-js/min';
import { testIds } from '@/playwright/lib/test-ids';

interface SelectedProfileInfo {
  id: string;
  conversationId: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
}

const SEARCH_PAGE_LIMIT = 10;

const StyledDialog = styled(Dialog)({
  '.MuiBackdrop-root': {
    background: 'transparent',
  },
  '& .MuiDialog-paper': {
    borderRadius: '8px',
    boxShadow: '0px 16px 48px 0px rgba(0, 0, 0, 0.16)',
    position: 'fixed',
    top: '34px',
    overflowX: 'hidden',
  },
});

const GlobalContactSearchModal = ({
  onClose,
  isOpened = false,
}: {
  onClose: () => void;
  isOpened?: boolean;
}) => {
  const { t } = useTranslation();
  const searchRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState('');
  // debouncedVal will be used as api param
  const [debouncedVal, setDebouncedVal] = useState(search);

  const { data: fieldIds } = useCompany({
    select: (data) => {
      const { customUserProfileFields } = data;
      return {
        phone: findPhoneNumberUserProfileField(customUserProfileFields)?.id,
        email: findEmailUserProfileField(customUserProfileFields)?.id,
      };
    },
  });

  const { data, isLoading } = useUserProfileQuery<{
    userProfiles: SelectedProfileInfo[];
    totalResult: number;
  }>({
    limit: SEARCH_PAGE_LIMIT,
    offset: 0,
    data: [
      {
        fieldName: 'displayname',
        conditionOperator: 'Contains',
        values: [debouncedVal],
        nextOperator: 'Or',
      },
      {
        fieldName: 'firstName',
        conditionOperator: 'Contains',
        values: [debouncedVal],
        nextOperator: 'Or',
      },
      {
        fieldName: 'phonenumber',
        conditionOperator: 'Contains',
        values: [debouncedVal.replace(/\s/g, '').replace(/\+/g, '')],
        nextOperator: 'Or',
      },
      {
        fieldName: 'email',
        conditionOperator: 'Contains',
        values: [debouncedVal],
        nextOperator: 'Or',
      },
      {
        fieldName: 'lastName',
        conditionOperator: 'Contains',
        values: [debouncedVal],
        nextOperator: 'And',
      },
    ],
    enabled: !!debouncedVal,
    select: (data) => ({
      userProfiles: data.userProfiles.map((profile) => {
        const phoneValue =
          profile.customFields.find(
            (f) => f.companyDefinedFieldId === fieldIds?.phone,
          )?.value || '';
        const emailValue =
          profile.customFields.find(
            (f) => f.companyDefinedFieldId === fieldIds?.email,
          )?.value || '';

        const phoneFormatted = isValidPhoneNumber(`+${phoneValue}`)
          ? parsePhoneNumber(`+${phoneValue}`).formatInternational()
          : (phoneValue ?? '');

        return {
          id: profile.id,
          conversationId: profile.conversationId || '',
          firstName: profile.firstName,
          lastName: profile.lastName,
          phoneNumber: phoneFormatted,
          email: emailValue ?? '',
        };
      }),
      totalResult: data.totalResult,
    }),
  });

  const handleClose = () => {
    onClose();
  };

  useDebounce(
    () => {
      if (!search) {
        setDebouncedVal('');
      } else {
        setDebouncedVal(search);
      }
    },
    500,
    [search],
  );

  const handleSearching = (value: string) => {
    setSearch(value);
  };

  return (
    <StyledDialog
      data-testid={testIds.globalSearchBarDialog}
      open={isOpened}
      onClose={handleClose}
    >
      <Stack sx={{ width: '50vw', p: '16px' }}>
        <Input
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus
          data-testid={testIds.globalSearchBarInput}
          inputRef={searchRef}
          value={search}
          placeholder={t('inbox.universal-search.placeholder')}
          onChange={(e) => {
            handleSearching(e.target.value);
          }}
          startAdornment={
            <InputAdornment position="start">
              <Icon icon="search" size={20} sx={{ color: 'gray.80' }} />
            </InputAdornment>
          }
          sx={{
            width: '540px',
          }}
        />
      </Stack>
      {!debouncedVal ? (
        <SearchTips />
      ) : isLoading ? (
        <LoadingSkeleton />
      ) : (
        <SearchResultMenu
          keyword={debouncedVal}
          data={data?.userProfiles ?? ([] as SelectedProfileInfo[])}
          onCloseModal={onClose}
        />
      )}
    </StyledDialog>
  );
};

export default GlobalContactSearchModal;
