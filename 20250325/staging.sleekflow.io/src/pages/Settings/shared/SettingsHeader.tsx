import { Box, Stack } from '@mui/material';
import { Dispatch, SetStateAction } from 'react';

import GlobalTopMenu from '@/components/GlobalTopMenu';
import { testIds } from '@/playwright/lib/test-ids';

export default function SettingsHeader({
  setPageTitleEl,
}: {
  setPageTitleEl: Dispatch<SetStateAction<HTMLElement | null>>;
}) {
  return (
    <Stack
      data-testid={testIds.settingsLayoutHeader}
      direction="row"
      justifyContent="space-between"
      sx={{ borderColor: 'gray.30' }}
      borderBottom="1px solid"
      alignItems="center"
      paddingX="20px"
    >
      <Box
        ref={(ref: HTMLElement) => {
          setPageTitleEl(ref);
        }}
      />
      <Box
        display="flex"
        alignItems="center"
        justifyContent="flex-end"
        height="4rem"
      >
        <GlobalTopMenu />
      </Box>
    </Stack>
  );
}
