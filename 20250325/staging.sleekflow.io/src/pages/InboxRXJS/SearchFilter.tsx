import {
  Box,
  IconButton,
  InputAdornment,
  List,
  Menu,
  MenuItem,
  OutlinedInput,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { TFunction, useTranslation } from 'react-i18next';
import { useDebounce } from 'react-use';

import Dropdown from '@/components/DropdownMenu';
import Icon from '@/components/Icon';
import { useGetConversationsFilter } from '@/pages/InboxRXJS/hooks/useGetConversationsFilter';
import { useTypedPosthog } from '@/posthog/useTypedPosthog';
import { testIds } from '@/playwright/lib/test-ids';

import SearchFilterContext from './SearchFilterContext';

const getSortOptions = (t: TFunction) => [
  { label: t('inbox.conversation-list.newest-first'), value: 'desc' as const },
  { label: t('inbox.conversation-list.oldest-first'), value: 'asc' as const },
];

const SearchFilter = () => {
  const { t } = useTranslation();
  const globalGetConversationsFilter = useGetConversationsFilter();
  const [search, setSearch] = useState(
    globalGetConversationsFilter.searchKeyword,
  );
  const posthog = useTypedPosthog();

  const { setGetConversationsFilter } = useGetConversationsFilter();
  useDebounce(
    () => {
      posthog.capture('inbox:submit_search_conversations_by_keyword', {
        search_keyword: search,
      });
      globalGetConversationsFilter.setSearchKeyword(search);
    },
    200,
    [search],
  );

  return (
    <Box
      display={'flex'}
      justifyContent={'space-between'}
      px="20px"
      py="12px"
      gap={0.5}
      alignItems="center"
    >
      <Tooltip
        title={t('inbox.conversation-list.search-by-conversations-tooltip')}
      >
        <OutlinedInput
          sx={{
            flexGrow: 1,
          }}
          data-testid={testIds.inboxConversationsSearchbar}
          placeholder={t('inbox.conversation-list.search-by-conversations')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          startAdornment={
            <InputAdornment position="start">
              <Icon icon="search" size={16} sx={{ color: 'gray.70' }} />
            </InputAdornment>
          }
          endAdornment={
            search && (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setSearch('')}
                  size="sm"
                  aria-label="Clear Search"
                >
                  <Icon icon="x-close" size={16} sx={{ color: 'gray.70' }} />
                </IconButton>
              </InputAdornment>
            )
          }
        />
      </Tooltip>

      <Stack spacing={0.5} direction={'row'}>
        {/* TODO integrate search PR  */}
        <Dropdown>
          {({ handleOpen, onClose, ...menuProps }) => (
            <>
              <IconButton onClick={handleOpen} disabled={!!search}>
                <Icon icon="switch-vertical" size={20} />
              </IconButton>
              <Menu {...menuProps} onClose={onClose}>
                <Typography
                  variant="subtitle"
                  sx={{
                    px: '12px',
                    pt: '12px',
                    textTransform: 'uppercase',
                  }}
                >
                  {t('inbox.conversation-list.sort-by')}
                </Typography>
                <List sx={{ pt: '16px' }}>
                  {getSortOptions(t).map((item) => (
                    <MenuItem
                      key={item.label}
                      onClick={() => {
                        onClose();
                        setGetConversationsFilter({
                          orderBy: item.value,
                        });
                      }}
                    >
                      {item.label}
                    </MenuItem>
                  ))}
                </List>
              </Menu>
            </>
          )}
        </Dropdown>

        {/* <FilterMenu disabled={!!search} /> */}
        <SearchFilterContext disabled={!!search} />
      </Stack>
    </Box>
  );
};

export default SearchFilter;
