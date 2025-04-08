import {
  Checkbox,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  useTheme,
} from '@mui/material';

import { TableColumnSizeOptions } from '@/constants/table';

const TableSkeletonColumn = ({
  headerArray,
  columnWidth,
}: {
  headerArray: number[] | string[];
  columnWidth: number;
}) => {
  return (
    <>
      {headerArray.map((header, index) => {
        if (index === 0) {
          return (
            <TableCell
              sx={{
                ...(typeof header !== 'string' && {
                  minWidth: `${columnWidth}px`,
                }),
              }}
              key={header}
            >
              {typeof header === 'string' ? (
                header
              ) : (
                <Skeleton
                  sx={{ backgroundColor: 'gray.30' }}
                  height={16}
                  variant="rectangular"
                />
              )}
            </TableCell>
          );
        }
        return (
          <TableCell
            key={header}
            sx={{ minWidth: `${columnWidth}px` }}
            width={columnWidth}
          >
            {typeof header === 'string' ? (
              header
            ) : (
              <Skeleton
                sx={{ backgroundColor: 'gray.30' }}
                height={16}
                variant="rectangular"
              />
            )}
          </TableCell>
        );
      })}
    </>
  );
};

const TableSkeletonRow = ({
  rowArray,
  columnsArray,
}: {
  rowArray: number[];
  columnsArray: number[];
}) => {
  return (
    <>
      {rowArray.map((row) => {
        return (
          <TableRow key={row}>
            {columnsArray.map((col) => {
              return (
                <TableCell key={col}>
                  <Skeleton height={16} variant="rectangular" />
                </TableCell>
              );
            })}
          </TableRow>
        );
      })}
    </>
  );
};

// Overload function to infer correct type for headerArray
function TableLoadingSkeleton<
  TColumnWidth extends TableColumnSizeOptions | number = 'lg',
>({
  rows,
  columns,
  columnWidth,
  withCheckbox,
  renderColumns,
  renderRows,
}: {
  rows?: number;
  renderRows?: (rowArray: number[], columnsArray: number[]) => React.ReactNode;
  columns: number;
  withCheckbox?: boolean;
  columnWidth?: TColumnWidth;
  renderColumns?: (
    columnsArray: number[],
    columnWidth: number,
  ) => React.ReactNode;
}): JSX.Element;

function TableLoadingSkeleton<
  TColumnWidth extends TableColumnSizeOptions | number = 'lg',
>({
  rows,
  columns,
  columnWidth,
  withCheckbox,
  renderColumns,
  renderRows,
}: {
  rows?: number;
  renderRows?: (rowArray: number[], columnsArray: number[]) => React.ReactNode;
  columns: string[];
  withCheckbox?: boolean;
  columnWidth?: TColumnWidth;
  renderColumns?: (
    columnsArray: string[],
    columnWidth: number,
  ) => React.ReactNode;
}): JSX.Element;

function TableLoadingSkeleton<
  TColumnWidth extends TableColumnSizeOptions | number = 'lg',
>({
  rows = 15,
  columns,
  columnWidth = 'lg' as TColumnWidth,
  withCheckbox,
  renderColumns = (columnsArray, columnWidth) => (
    <TableSkeletonColumn headerArray={columnsArray} columnWidth={columnWidth} />
  ),
  renderRows = (rowArray, columnsArray) => (
    <TableSkeletonRow rowArray={rowArray} columnsArray={columnsArray} />
  ),
}: {
  rows?: number;
  renderRows?: (rowArray: number[], columnsArray: number[]) => React.ReactNode;
  columns: number | string[];
  withCheckbox?: boolean;
  columnWidth?: TColumnWidth;
  renderColumns?: (columnsArray: any, columnWidth: number) => React.ReactNode;
}) {
  const {
    table: { columnSizes },
  } = useTheme();

  const formattedColumns =
    typeof columns === 'number'
      ? [...Array(columns).keys()]
      : (columns as string[] | number[]);
  return (
    <Table
      sx={{
        width: '100%',
        minWidth: 'max-content',
        borderCollapse: 'separate',
      }}
      aria-label="table loading skeleton"
    >
      <TableHead sx={{ position: 'sticky', top: 0, zIndex: 50 }}>
        <TableRow>
          {withCheckbox && (
            <TableCell
              width={columnSizes.xxs}
              sx={{
                maxWidth: `${columnSizes.xxs}px`,
              }}
            >
              <Checkbox />
            </TableCell>
          )}
          {renderColumns(
            formattedColumns,
            typeof columnWidth === 'string'
              ? columnSizes[columnWidth as TableColumnSizeOptions]
              : columnWidth,
          )}
        </TableRow>
      </TableHead>
      <TableBody>
        {renderRows(
          [...Array(rows).keys()],
          [
            ...Array(
              typeof columns === 'number'
                ? withCheckbox
                  ? columns + 1
                  : columns
                : withCheckbox
                ? columns.length + 1
                : columns.length,
            ).keys(),
          ],
        )}
      </TableBody>
    </Table>
  );
}

export default TableLoadingSkeleton;
