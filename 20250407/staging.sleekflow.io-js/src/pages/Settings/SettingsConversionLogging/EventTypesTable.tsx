import {
  Box,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { flexRender } from '@tanstack/react-table';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useGlobalBanner } from '@/GlobalBanner';
import { Button } from '@/components/Button';
import Icon, { IconProps } from '@/components/Icon';
import { ScrollArea } from '@/components/ScrollArea';
import TableFetchingOverlay from '@/pages/Contacts/shared/TableFetchingOverlay';
import { TABLE_COLUMNS } from './constant';
import useEventsTable from './useEventsTable';
import TableLoadingSkeleton from '@/components/TableLoadingSkeleton';
import theme from '@/themes';
import { UserEventType } from './types';
import { LinkBox } from '@/components/LinkOverlay';
import { DeleteUserEventTypeDialog } from './DeleteUserEventTypeDialog';
import { UpdateUserEventTypeDialog } from './UpdateUserEventTypeDialog';
import InfiniteScroll from '@/components/InfiniteScroll';

export default function EventTypesTable() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const {
    tableHeaders,
    table,
    isFetching,
    isLoading,
    dialogState,
    setDialogState,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useEventsTable();

  const tableRows = table.getRowModel().rows;
  const selectedUserEventTypes = table
    .getSelectedRowModel()
    .rows.map((row) => row.original);

  const globalBannerHeight = useGlobalBanner((state) => state.totalHeight);

  return (
    <Stack height={`calc(100svh - 108px - ${globalBannerHeight}px)`}>
      <ScrollArea
        slotProps={{
          viewport: {
            ref: viewportRef,
            style: {
              overflowX: isFetching ? 'hidden' : 'scroll',
              overflowY: isFetching ? 'hidden' : 'scroll',
            },
          },
        }}
        sx={{
          position: 'relative',
          width: '100%',
          height: 'auto',
          padding: '0px 0px 16px 0px',
        }}
      >
        {isLoading ? (
          <TableLoadingSkeleton
            withCheckbox
            columns={3}
            columnWidth="md"
            renderColumns={(columnsArray, columnWidth) => {
              return columnsArray.map((header) => {
                if (header === 0) {
                  return (
                    <TableCell
                      key={header}
                      sx={{
                        width: 'auto',
                        minWidth: theme.table.columnSizes.xl,
                      }}
                    >
                      <Skeleton
                        sx={{ backgroundColor: 'gray.30' }}
                        height={16}
                        variant="rectangular"
                      />
                    </TableCell>
                  );
                }
                return (
                  <TableCell key={header} sx={{ width: columnWidth }}>
                    <Skeleton
                      sx={{ backgroundColor: 'gray.30' }}
                      height={16}
                      variant="rectangular"
                    />
                  </TableCell>
                );
              });
            }}
            rows={15}
          />
        ) : tableRows.length > 0 ? (
          <Box sx={{ position: 'relative' }}>
            <TableFetchingOverlay
              isFetching={isFetching}
              containerRef={viewportRef}
            />
            <InfiniteScroll
              loading={isFetchingNextPage}
              hasNext={hasNextPage}
              onNext={fetchNextPage}
              height="calc(100svh - 282px)"
            >
              <Table
                sx={{
                  borderCollapse: 'separate',
                }}
              >
                <colgroup>
                  {tableHeaders.map((header) => {
                    const meta = header.column.columnDef.meta as {
                      shrink?: boolean;
                    };
                    const size = header.getSize();
                    if (meta?.shrink && size) {
                      return <col key={header.id} width={size} />;
                    }
                    return <col key={header.id} />;
                  })}
                </colgroup>
                <TableHead sx={{ position: 'sticky', top: 0, zIndex: 50 }}>
                  <TableRow>
                    {tableHeaders.map((header) => (
                      <LinkBox component={TableCell} key={header.id}>
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                      </LinkBox>
                    ))}
                  </TableRow>
                  {selectedUserEventTypes.length > 0 && (
                    <TableActionBar
                      selectedUserEventTypes={selectedUserEventTypes}
                      onDeleteEventTypesClicked={(selected) =>
                        setDialogState({
                          type: 'delete',
                          userEventTypes: selected,
                        })
                      }
                    />
                  )}
                </TableHead>
                <TableBody>
                  {tableRows.map((r) => (
                    <TableRow
                      key={r.id}
                      selected={r.getIsSelected()}
                      sx={{
                        '& .MuiTableCell-root p': {
                          color: '#0D122C !important',
                        },
                      }}
                    >
                      {r.getVisibleCells().map((c) => (
                        <LinkBox component={TableCell} key={c.id}>
                          {flexRender(c.column.columnDef.cell, c.getContext())}
                        </LinkBox>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </InfiniteScroll>
          </Box>
        ) : null}
      </ScrollArea>
      <UpdateUserEventTypeDialog
        dialogState={dialogState}
        onClose={() => {
          setDialogState(null);
        }}
      />
      <DeleteUserEventTypeDialog
        dialogState={dialogState}
        onClose={() => {
          setDialogState(null);
        }}
      />
    </Stack>
  );
}

function TableActionBar({
  selectedUserEventTypes,
  onDeleteEventTypesClicked,
}: {
  selectedUserEventTypes: UserEventType[];
  onDeleteEventTypesClicked: (selectedEventTypes: UserEventType[]) => void;
}) {
  const { t } = useTranslation();

  return (
    <TableRow>
      <TableCell
        sx={{
          backgroundColor: 'gray.20',
        }}
        colSpan={Object.keys(TABLE_COLUMNS).length + 1}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography variant="headline4" color="darkBlue.90">
            {t('conversion-logging.selected-row', {
              count: selectedUserEventTypes.length,
              defaultValue:
                '{count, plural, one{# contact} other{# contacts}} selected',
            })}
          </Typography>
          <TableActionBarItem
            icon="trash-x"
            label={t('conversion-logging.delete-selected', {
              defaultValue: 'Delete events',
            })}
            onClick={() => onDeleteEventTypesClicked(selectedUserEventTypes)}
          />
        </Stack>
      </TableCell>
    </TableRow>
  );
}

function TableActionBarItem({
  icon,
  label,
  onClick,
}: {
  icon?: IconProps['icon'];
  label?: string;
  onClick?: () => void;
}) {
  return (
    <Button
      onClick={onClick}
      size="compact-small"
      sx={{
        color: 'darkBlue.70',
        padding: 0,

        '& > .MuiButton-startIcon': {
          marginRight: '8px',
        },
      }}
      startIcon={icon && <Icon size={16} icon={icon} />}
    >
      <Typography variant="menu1">{label}</Typography>
    </Button>
  );
}
