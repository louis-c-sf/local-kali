import React, { ReactNode } from "react";
import { Table as UITable, TableCellProps } from "semantic-ui-react";
import gridStyles from "../../../../component/shared/grid/Grid.module.css";
import { useSalesforceObjectLink } from "../../API/Objects/useSalesforceObjectLink";
import EmptyContent from "../../../../component/EmptyContent";
import { RowMemo } from "./Row";
import { useObjectsGridContext } from "../ObjectsGrid/ObjectsGridContext";
import { getNextLoopItem } from "../../../../utility/getNextLoopItem";
import { SortType, ObjectNormalizedType } from "../../API/Objects/contracts";
import { GetObjectUrlInterface } from "../ObjectsGrid/ObjectsGridContextType";
import { equals } from "ramda";

type SortInterface = (param: SortType[] | null) => void;

export type TableFieldType<Item extends ObjectNormalizedType> = {
  name: string;
  head: string | ReactNode | TableCellProps;
  content?: string | TableCellProps;
  resolveValue?: <ItemInner extends Item>(item: ItemInner) => any;
  clickForDetails?: boolean;
  type?: "name" | "phone" | "link" | "owner" | "date";
};

export function Table<Item extends ObjectNormalizedType>(props: {
  getObjectUrl: GetObjectUrlInterface;
  sortBy: SortInterface;
  sortableFields?: Record<string, string[]>;
  fields: TableFieldType<Item>[];
  noResultsHead: string;
  noResultsSubHead: string;
  showAvatar: boolean;
}) {
  let {
    fields,
    getObjectUrl,
    noResultsHead,
    noResultsSubHead,
    sortBy,
    sortableFields,
  } = props;

  const { dispatch, state } = useObjectsGridContext<Item, any>();

  const {
    sort,
    continuousPager: { pageResults },
  } = state;
  const { openLink, isLoading } = useSalesforceObjectLink({
    getLeadUrl: getObjectUrl,
  });

  function openObjectDetails(item: Item) {
    return () => {
      dispatch({ type: "SHOW_LEAD", data: item });
    };
  }

  function handleLinkClick(leadId: string) {
    return openLink(leadId);
  }

  function getSortClass(fields: string[]) {
    const classMap = {
      asc: "ascending",
      desc: "descending",
    };
    if (isSameSortFields(sort, fields)) {
      let [firstSort] = sort ?? [];
      return classMap[firstSort?.direction] ?? "";
    }
  }

  function isSameSortFields(a: SortType[] | null, b: string[] | null) {
    if (a === null && b === null) {
      return true;
    }
    return equals(
      a?.map((s) => s.field_name),
      b
    );
  }

  function changeSort(fields: string[]) {
    const [currentSort] = sort ?? [];
    const sortLoop = [null, "asc", "desc"] as const;
    let nextDirection: typeof sortLoop[number];
    if (isSameSortFields(sort, fields)) {
      nextDirection = getNextLoopItem(currentSort?.direction ?? null, sortLoop);
    } else {
      nextDirection = getNextLoopItem(null, sortLoop);
    }
    const sortPayload: SortType[] | null = nextDirection
      ? fields.map((f) => ({
          field_name: f,
          direction: nextDirection!,
          is_case_sensitive: false,
        }))
      : null;
    dispatch({ type: "SORT_UPDATE", sort: sortPayload });

    sortBy(sortPayload);
  }

  return (
    <UITable className={gridStyles.grid} sortable>
      <UITable.Header>
        <UITable.Row
          cellAs={(props: any) => <UITable.HeaderCell {...props} />}
          cells={fields.map(({ head, name }) => {
            let cellProps: TableCellProps = {
              key: name,
              content: head,
            };
            if (sortableFields?.[name] !== undefined) {
              const fieldNames = sortableFields[name];

              cellProps = {
                ...cellProps,
                sortable: true,
                onClick: () => changeSort(fieldNames),
                sorted: getSortClass(fieldNames),
                className: "sortable",
              };
            }
            return cellProps;
          })}
        />
      </UITable.Header>
      <UITable.Body>
        {pageResults.length === 0 && (
          <EmptyContent
            centered
            header={noResultsHead}
            content={<a href={"https://salesforce.com"}>{noResultsSubHead}</a>}
          />
        )}
        {pageResults.map((item) => {
          return (
            <RowMemo
              showAvatar={props.showAvatar}
              key={item.id}
              fields={fields}
              onClick={openObjectDetails(item)}
              item={item}
              loading={isLoading(item.id)}
              handleLinkClick={handleLinkClick}
            />
          );
        })}
      </UITable.Body>
    </UITable>
  );
}
