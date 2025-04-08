export const getTablePaginationPageNumber = (
  pageFromSearchParam: string | null,
) => {
  return Math.round(Number(pageFromSearchParam || '1') || 1);
};

export const TABLE_PAGE_SIZE = 15;
