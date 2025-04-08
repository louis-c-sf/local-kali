import { Checkbox, MenuItem, Stack, Typography } from '@mui/material';
import { CSSProperties } from 'react';

import { Team } from '@/api/types';

import Icon from '../Icon';

interface Props {
  style?: CSSProperties;
  team: Team;
  multiple?: boolean;
  value?: unknown;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange?: (value: any) => void;
  handleAnchorClose: () => void;
}

export const TeamItem = ({
  style,
  team,
  multiple,
  value,
  onChange,
  handleAnchorClose,
}: Props) => (
  <MenuItem
    style={style}
    onClick={() => {
      const id = String(team.id);
      if (multiple) {
        const values = (value || []) as string[];
        const newValues = values.includes(id)
          ? values.filter((v) => v !== id)
          : [...values, id];
        onChange?.(newValues);
      } else {
        onChange?.(id);
      }
      !multiple && handleAnchorClose();
    }}
  >
    <Stack
      direction="row"
      spacing={1}
      alignItems="center"
      flexGrow={1}
      overflow="hidden"
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        flexGrow={1}
        overflow="hidden"
        textOverflow="ellipsis"
        spacing={1}
      >
        <Stack overflow="hidden">
          <Typography sx={(theme) => ({ ...theme.typography.ellipsis })}>
            {team.teamName}
          </Typography>
          <Typography
            variant="body2"
            color="gray.80"
            sx={(theme) => ({ ...theme.typography.ellipsis })}
          >
            {`${team.members.length} ${
              team.members.length === 1 ? 'member' : 'members'
            }`}
          </Typography>
        </Stack>
        <Stack justifyContent="center">
          {typeof value === 'string' && value === String(team.id) && (
            <Icon icon="check-single" size={16} sx={{ color: 'blue.90' }} />
          )}
          {Array.isArray(value) && (
            <Checkbox
              checked={value.includes(String(team.id))}
              style={{ padding: '2px' }}
            />
          )}
        </Stack>
      </Stack>
    </Stack>
  </MenuItem>
);
