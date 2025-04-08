import {
  CellContext,
  createColumnHelper,
  getCoreRowModel,
  RowSelectionState,
  useReactTable,
} from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { TFunction, useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';

import { getTablePaginationPageNumber, TABLE_PAGE_SIZE } from '@/utils/table';

import { SEARCH_PARAMS } from './constant';
import { useGetAllUserEventsQuery } from '@/api/userEventTypes';
import { UserEventType } from './types';
import { TableColumnSizeOptions } from '@/constants/table';
import { LinkOverlay } from '../../../components/LinkOverlay';
import { Box, Button, Checkbox, Stack, Typography } from '@mui/material';
import Icon from '@/components/Icon';
import theme from '@/themes';

export type DialogState =
  | {
      type: 'edit';
      userEventType: UserEventType;
    }
  | {
      type: 'delete';
      userEventTypes: UserEventType[];
    };

export type EventType = {
  eventTypeId: string;
  eventType: string;
};

export default function useEventsTable() {
  const columnHelper = createColumnHelper<UserEventType>();
  const [eventsSelected, setEventsSelected] = useState<RowSelectionState>({});
  const [dialogState, setDialogState] = useState<DialogState | null>(null);
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const page = getTablePaginationPageNumber(
    searchParams.get(SEARCH_PARAMS.page),
  );

  const getColumns = (
    t: TFunction,
    columnSizes: Record<TableColumnSizeOptions, number>,
  ) => [
    columnHelper.display({
      id: 'rowSelect',
      size: columnSizes.xxs,
      meta: { shrink: true },
      header: ({ table }) => (
        <LinkOverlay
          component={Checkbox}
          checked={table.getIsAllPageRowsSelected()}
          indeterminate={table.getIsSomeRowsSelected()}
          onChange={table.getToggleAllPageRowsSelectedHandler()}
        />
      ),
      cell: ({ row }) => (
        <LinkOverlay
          component={Checkbox}
          checked={row.getIsSelected()}
          indeterminate={row.getIsSomeSelected()}
          onChange={row.getToggleSelectedHandler()}
        />
      ),
    }),

    columnHelper.accessor((row) => row, {
      id: 'userEvents',
      size: columnSizes.lg,
      header: () => {
        return (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
            }}
          >
            <span>
              {t('settings.conversion-logging.table.header.name', {
                defaultValue: 'Lead conversion log types',
              })}
            </span>
          </Box>
        );
      },
      cell: (info: unknown) => {
        const customCellProps = info as CellContext<UserEventType, string>;
        const userEventType = customCellProps.row.original;
        return <Typography>{userEventType.event_type}</Typography>;
      },
    }),

    columnHelper.display({
      id: 'actions',
      header: () => '',
      size: columnSizes.xxs,
      meta: { shrink: true },
      cell: (info: unknown) => {
        const customCellProps = info as CellContext<UserEventType, string>;
        const userEventType = customCellProps.row.original;

        return (
          <Stack direction={'row'} spacing={1}>
            <Button
              variant={'text'}
              sx={{ flex: '0 1 auto', minWidth: 0, px: 1 }}
            >
              <Icon
                icon={'edit'}
                size={18}
                sx={{
                  cursor: 'pointer',
                }}
                onClick={() => {
                  setDialogState({
                    type: 'edit',
                    userEventType: userEventType,
                  });
                }}
              />
            </Button>
            <Button
              variant={'text'}
              sx={{ flex: '0 1 auto', minWidth: 0, px: 1 }}
            >
              <Icon
                icon={'trash'}
                size={19}
                sx={{ cursor: 'pointer' }}
                onClick={() => {
                  setDialogState({
                    type: 'delete',
                    userEventTypes: [userEventType],
                  });
                }}
              />
            </Button>
          </Stack>
        );
      },
    }),
  ];

  const columns = useMemo(() => getColumns(t, theme.table.columnSizes), [t]);

  const {
    data: userEventTypes,
    isFetching,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useGetAllUserEventsQuery({
    limit: 100,
  });

  const table = useReactTable({
    data: userEventTypes?.pages.flatMap((page) => page.records) ?? [],
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
    enableRowSelection: true,
    state: {
      pagination: {
        pageIndex: page - 1 || 0,
        pageSize: TABLE_PAGE_SIZE,
      },
      rowSelection: eventsSelected,
    },
    onRowSelectionChange: (e) => {
      setEventsSelected(e);
    },
    manualPagination: true,
    pageCount: userEventTypes?.pages.length ?? 0,
    getRowId: (row) => row.id,
  });

  const tableHeaders = table.getFlatHeaders();

  return {
    tableHeaders,
    columns,
    dialogState,
    setDialogState,
    table,
    isFetching,
    isLoading,
    currenPage: page,
    rowSelection: eventsSelected,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  };
}
