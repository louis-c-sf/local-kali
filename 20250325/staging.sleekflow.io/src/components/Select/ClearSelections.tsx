import { ListSubheader, Stack, Typography } from '@mui/material';
import { MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '../Button';
import Icon from '../Icon';

interface ClearSelectionsProps {
  count?: number;
  handleClear: (e: MouseEvent<HTMLButtonElement>) => void;
}

export const ClearSelections = ({
  count,
  handleClear,
}: ClearSelectionsProps) => {
  const { t } = useTranslation();

  return (
    <ListSubheader sx={{ px: 1.5 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        height="52px"
        pt={0.5}
      >
        <Typography variant="link1" fontWeight={600}>
          {t('select.menu-selected-count', {
            defaultValue: '{count} selected',
            count,
          })}
        </Typography>
        <Button
          startIcon={<Icon icon="discard" />}
          size="compact-small"
          onClick={handleClear}
        >
          {t('select.menu-clear-selected-button', 'Clear')}
        </Button>
      </Stack>
    </ListSubheader>
  );
};
