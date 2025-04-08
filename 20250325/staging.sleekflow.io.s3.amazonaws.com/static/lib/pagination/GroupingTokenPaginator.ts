import { PaginatorInterface } from "./PaginatorInterface";

export class GroupingTokenPaginator implements PaginatorInterface {
  constructor(
    private page: number,
    private pageSize: number,
    private pagesPerGroup: number,
    private groupItemsLoadedCount: number,
    private prevToken: string | null,
    private nextToken: string | null
  ) {}

  canNavigatePrevGroup(): boolean {
    const isSecondPageGroup =
      this.page > this.pagesPerGroup && this.page <= this.pagesPerGroup * 2;
    return isSecondPageGroup || this.prevToken !== null;
  }

  canNavigateNextGroup(): boolean {
    return this.nextToken !== null;
  }

  getGroupPageNumbers(): number[] {
    let groupStart = 1;
    while (
      groupStart <= this.page &&
      groupStart + this.pagesPerGroup <= this.page
    ) {
      groupStart += this.pagesPerGroup;
    }

    return [...Array(this.pagesPerGroup).keys()]
      .map((k) => k + groupStart)
      .slice(0, Math.ceil(this.groupItemsLoadedCount / this.pageSize));
  }
}
