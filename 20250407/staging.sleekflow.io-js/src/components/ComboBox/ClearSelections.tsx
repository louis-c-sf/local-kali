import { Stack, StackProps, Typography } from '@mui/material';
import { MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '../Button';
import Icon from '../Icon';

interface ClearSelectionsProps extends StackProps {
  count?: number;
  handleClear: (e: MouseEvent<HTMLButtonElement>) => void;
}

export const ClearSelections = ({
  count,
  handleClear,
  ...rest
}: ClearSelectionsProps) => {
  const { t } = useTranslation();

  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      height="48px"
      paddingX={1.5}
      {...rest}
    >
      <Typography variant="body1">
        {t('select.menu-selected-count', {
          defaultValue: '{count} selected',
          count,
        })}
      </Typography>
      <Button
        startIcon={<Icon icon="discard" />}
        size="compact-small"
        onMouseDown={handleClear}
      >
        {t('select.menu-clear-selected-button', 'Clear')}
      </Button>
    </Stack>
  );
};
