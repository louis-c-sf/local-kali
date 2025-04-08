import { Box, Button, Stack, Typography } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import GlobalContactSearchModal from '@/components/GlobalContactSearchModal';
import { getDevicePlatform } from '@/utils/platform';

import Icon from '../Icon';
import { testIds } from '@/playwright/lib/test-ids';

const SearchCommandWrapper = ({ children }: { children: React.ReactNode }) => (
  <Box
    display="flex"
    alignItems="center"
    justifyContent="center"
    sx={{
      background: 'white',
      minWidth: 20,
      height: 20,
      borderRadius: '4px',
      p: '4px',
    }}
  >
    {children}
  </Box>
);

const GlobalSearchBar = () => {
  const [isSearchModalOpened, setIsSearchModalOpened] = useState(false);
  const platform = getDevicePlatform();
  const { t } = useTranslation();
  const onKeyDownHandler = useCallback(
    (e: KeyboardEvent) => {
      const isMacHotKeyPressed =
        e.metaKey && e.key === 'k' && platform === 'mac';
      const isWindowsHotKeyPressed =
        e.ctrlKey && e.key === 'k' && platform === 'windows';
      if (isMacHotKeyPressed || isWindowsHotKeyPressed) {
        handleModalToggle();
        // stop propagate shortcut
        e.preventDefault();
      }
    },
    [platform],
  );

  useEffect(() => {
    window.addEventListener('keydown', onKeyDownHandler);
    return () => {
      window.removeEventListener('keydown', onKeyDownHandler);
    };
  }, [onKeyDownHandler]);

  function handleModalToggle() {
    setIsSearchModalOpened((prev) => !prev);
  }

  return (
    <>
      <Button
        data-testid={testIds.globalSearchBarButton}
        variant="outlined"
        onClick={handleModalToggle}
        sx={(theme) => ({
          backgroundColor: 'gray.10',
          minWidth: 20,
          height: theme.spacing(4),
          borderRadius: '8px',
          borderColor: 'transparent',
          '&:focus, &:hover': {
            borderColor: 'transparent',
          },
        })}
      >
        <Stack
          spacing={1}
          direction="row"
          sx={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Icon icon="search" size={20} sx={{ color: 'gray.80' }} />
          <Typography
            variant="body1"
            sx={{
              color: 'gray.80',
              fontWeight: 400,
              fontSize: '14px',
              minWidth: '96px',
              textAlign: 'left',
            }}
          >
            {t('inbox.universal-search.top-bar-label')}
          </Typography>
          <Stack spacing={1 / 2} direction="row">
            <SearchCommandWrapper>
              <Typography
                variant="body1"
                sx={{ color: 'darkBlue.50', fontWeight: 600 }}
              >
                {platform === 'mac' ? '⌘' : 'Ctrl'}
              </Typography>
            </SearchCommandWrapper>
            <SearchCommandWrapper>
              <Typography
                variant="body1"
                sx={{ color: 'darkBlue.50', fontWeight: 600 }}
              >
                K
              </Typography>
            </SearchCommandWrapper>
          </Stack>
        </Stack>
      </Button>
      <GlobalContactSearchModal
        isOpened={isSearchModalOpened}
        onClose={handleModalToggle}
      />
    </>
  );
};

export default GlobalSearchBar;
