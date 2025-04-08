import {
  Box,
  FormControl,
  FormHelperText,
  InputAdornment,
  ListSubheader,
  Menu,
  MenuItem,
  OutlinedInput,
  OutlinedInputProps,
  Stack,
  TextField,
} from '@mui/material';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Control, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { FixedSizeList } from 'react-window';

import { useTeamListV1 } from '@/api/company';
import { useMenuAnchor } from '@/hooks/useMenuAnchor';
import ConversationListVirtualOuterElementType from '@/pages/InboxRXJS/ConversationLists/ConversationListVirtualOuterElementType';

import Icon from '../Icon';
import { InputLabel } from '../InputLabel';
import { ClearSelections } from '../Select/ClearSelections';
import { CustomLabelInput } from '../Select/CustomLabelInput';
import { TruncateSelectedItems } from '../Select/TruncateSelectedItems';
import { TeamItem } from './TeamItem';

export interface SelectTeamProps<T extends boolean> {
  'data-testid': string;
  label?: string;
  control?: Control<any>;
  fieldName?: string;
  shape?: 'pill' | 'default';
  size?: 'small' | 'medium';
  value?: T extends true ? string[] : string;
  disabled?: boolean;
  onChange?: T extends true
    ? (value: string[]) => void
    : (value: string) => void;
  onBlur?: () => void;
  fullWidth?: boolean;
  placeholder?: string;
  multiple?: T;
  sx?: OutlinedInputProps['sx'];
  menuWidth?: string;
  clearable?: boolean;
}

export const SelectTeams = <T extends boolean>({
  control,
  fieldName,
  value,
  onChange,
  fullWidth = true,
  ...props
}: SelectTeamProps<T>) => {
  const { t } = useTranslation();

  const isHookForm = !!(control && fieldName);

  if (isHookForm) {
    return (
      <Controller
        name={fieldName}
        control={control}
        render={({ field, fieldState }) => (
          <FormControl
            fullWidth={fullWidth}
            focused={false}
            error={!!fieldState.error?.message}
          >
            {props.label && <InputLabel>{props.label}</InputLabel>}
            <CommonSelectTeam
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              {...props}
            />
            {fieldState.error?.message && (
              <FormHelperText>
                {fieldState.error?.message ||
                  t('general.required-field-validation')}
              </FormHelperText>
            )}
          </FormControl>
        )}
      />
    );
  }

  return <CommonSelectTeam value={value} onChange={onChange} {...props} />;
};

const CommonSelectTeam = <T extends boolean>({
  value,
  onBlur,
  onChange,
  disabled,
  size,
  placeholder: placeholderProp,
  multiple,
  label,
  shape,
  sx,
  menuWidth,
  clearable,
  'data-testid': dataTestId,
}: Omit<SelectTeamProps<T>, 'control' | 'fieldName'>) => {
  const { t } = useTranslation();

  const placeholder =
    placeholderProp ?? t('general.select-placeholder', 'Select');

  const [keyword, setKeyword] = useState('');

  const { anchorEl, open, handleAnchorClick, handleAnchorClose } =
    useMenuAnchor();

  const { data: teams } = useTeamListV1();

  const searchedTeams = useMemo(
    () =>
      teams?.filter((team) =>
        team.teamName.toLowerCase().includes(keyword.toLowerCase()),
      ) ?? [],
    [keyword, teams],
  );

  const selectedValues = useMemo(() => {
    const matched = multiple
      ? (teams?.filter((team) => value?.includes(String(team.id))) ?? [])
      : (teams?.find((team) => String(team.id) === value) ?? []);

    return Array.isArray(matched) ? matched : [matched];
  }, [multiple, teams, value]);

  const [searchInputEl, setSearchInputEl] = useState<HTMLInputElement>();
  useEffect(() => {
    if (open && searchInputEl) {
      searchInputEl?.focus();
    }
  }, [open, searchInputEl]);

  const fixedSizeListOuterRef = useRef<HTMLDivElement | null>(null);

  const hasSelectedValueInMultipleMode = multiple && selectedValues.length > 0;

  return (
    <>
      <OutlinedInput
        size={size}
        data-testid={dataTestId}
        sx={[
          (theme) => ({
            flexShrink: 0,
            display: 'flex',
            cursor: 'pointer',
            justifyContent: 'space-between',
            ...(shape === 'pill' && {
              borderRadius: 6,
              ...(hasSelectedValueInMultipleMode && {
                '&.MuiOutlinedInput-root': {
                  color: 'blue.90',
                  background: theme.palette.blue[10],
                  borderColor: theme.palette.blue[20],
                  ':hover': {
                    background: theme.palette.blue[5],
                    borderColor: theme.palette.blue[20],
                  },
                  '&.Mui-focused': {
                    color: 'blue.90',
                    background: theme.palette.blue[10],
                  },
                },
                '& .MuiOutlinedInput-input': {
                  backgroundColor: theme.palette.blue[10],
                  backgroundClip: 'content-box',
                  ':hover': {
                    background: theme.palette.blue[5],
                    backgroundClip: 'content-box',
                  },
                },
              }),
            }),
            ...(multiple && {
              maxWidth: '320px',
              overflow: 'hidden',
            }),
            '& input': {
              position: 'absolute',
              width: '0 !important',
              opacity: 0,
            },
          }),
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
        disabled={disabled}
        {...(!disabled && { onClick: handleAnchorClick })}
        inputComponent={CustomLabelInput}
        inputProps={{
          size,
          'aria-hidden': true,
          children: multiple ? (
            <TruncateSelectedItems spacing={0.5} key={selectedValues.length}>
              {({ getPrefixLabelProps }) => (
                <>
                  {label && (
                    <span {...getPrefixLabelProps()}>
                      {t('general.select-label-prefix', {
                        defaultValue:
                          '{filterLabel}{count, plural, =0{} other{:}}',
                        filterLabel: label,
                        count: selectedValues.length,
                      })}
                    </span>
                  )}
                  {selectedValues.map((team, index) => (
                    <span key={team.id}>
                      {team.teamName}
                      {index === selectedValues.length - 1 ? '' : ','}
                    </span>
                  ))}
                </>
              )}
            </TruncateSelectedItems>
          ) : (
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{
                color: selectedValues[0] ? undefined : 'gray.70',
                overflow: 'hidden',
              }}
            >
              <Box sx={(theme) => ({ ...theme.typography.ellipsis })}>
                {selectedValues[0]?.teamName ?? placeholder}
              </Box>
            </Stack>
          ),
        }}
        value={Array.isArray(value) ? value.join(',') : value}
        endAdornment={
          <Icon
            icon="chevron-down"
            size={size === 'small' ? 16 : 20}
            sx={{
              transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
              flexShrink: 0,
              p: '2px',
            }}
          />
        }
      />
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => {
          handleAnchorClose();
          onBlur?.();
        }}
        elevation={0}
        sx={{ mt: 1 }}
        MenuListProps={{
          sx: {
            width: menuWidth ?? '400px',
            ...(multiple && { pb: 0 }),
          },
        }}
      >
        <ListSubheader sx={{ px: 1.5, mb: '2px' }}>
          <TextField
            inputRef={setSearchInputEl}
            fullWidth
            onKeyDown={(e) => {
              if (e.key !== 'Escape') {
                e.stopPropagation();
              }
            }}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder={t('general.search-team', 'Search team')}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Icon icon="search" size={16} sx={{ color: 'gray.70' }} />
                </InputAdornment>
              ),
            }}
            onClick={(e) => e.stopPropagation()}
          />
        </ListSubheader>
        {multiple && clearable && (
          <ClearSelections
            count={selectedValues.length}
            handleClear={() => onChange?.([] as any)}
          />
        )}
        {searchedTeams.length === 0 && (
          <MenuItem sx={{ '&.Mui-disabled': { opacity: 1 } }} disabled>
            {t(
              'form-inputs.generic-select-no-results-found-label',
              'No results found',
            )}
          </MenuItem>
        )}
        {searchedTeams.length <= 7 ? (
          searchedTeams.map((team) => (
            <TeamItem
              key={team.id}
              style={{
                height: '48px',
                paddingTop: 0,
                paddingBottom: 0,
                marginBottom: 0,
              }}
              team={team}
              onChange={onChange}
              handleAnchorClose={handleAnchorClose}
              multiple={multiple}
              value={value}
            />
          ))
        ) : (
          <FixedSizeList
            itemKey={(index, data) => `${data[index].id}-${index}`}
            itemSize={48}
            width="100%"
            height={336}
            overscanCount={25}
            outerRef={fixedSizeListOuterRef}
            itemData={searchedTeams}
            itemCount={searchedTeams.length}
            outerElementType={ConversationListVirtualOuterElementType}
          >
            {({ index, style, data }) => (
              <TeamItem
                key={data[index].id}
                style={style}
                team={data[index]}
                onChange={onChange}
                handleAnchorClose={handleAnchorClose}
                multiple={multiple}
                value={value}
              />
            )}
          </FixedSizeList>
        )}
      </Menu>
    </>
  );
};
