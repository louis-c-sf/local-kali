import React, { useRef } from "react";
import { catchLinkClicked } from "../../../utility/dom";
import { Button, Checkbox, Icon, Table } from "semantic-ui-react";
import { UserProfileGroupType } from "./UserProfileGroupType";
import moment from "moment";
import { postWithExceptions } from "../../../api/apiRequest";
import { POST_REORDER_USER_PROFILE_GROUP } from "../../../api/apiPath";
import { BatchItemType, ListDashboardAction } from "./reducer";
import { swapOrderables } from "../../../component/AssignmentRules/helpers/swapOrderables";
import { clone, propEq, whereEq } from "ramda";
import { useTranslation } from "react-i18next";
import useRouteConfig from "../../../config/useRouteConfig";
import { GridSelection } from "../../../component/shared/grid/GridSelection";
import { DeleteConfirmationAwareType } from "../../../component/shared/grid/GridHeader";
import { useAccessRulesGuard } from "../../../component/Settings/hooks/useAccessRulesGuard";
import { InfoTooltip } from "../../../component/shared/popup/InfoTooltip";
import { useSignalRGroup } from "../../../component/SignalR/useSignalRGroup";
import { TaskResponseType } from "../../../component/Header/ProgressBar/types/TaskType";
import { useAppSelector } from "../../../AppRootContext";
import { ReactSortable } from "react-sortablejs";
import { noop } from "lib/utility/noop";
import { Link } from "react-router-dom";

export function getTotalImportedNumber(item: UserProfileGroupType) {
  return item.totalContactCount;
}

export const MAXIMUM_EXPORT_LIMIT = 5000;

export function ContactsListsTable(
  props: {
    dispatch: (action: ListDashboardAction) => void;
    list: any[];
    checkedIds: number[];
    batchItems: BatchItemType[];
    batchOperationToggleChecked: boolean;
    exportingId: number | undefined;
    handleBookmark: (list: UserProfileGroupType) => void;
    emptyContent: JSX.Element;
  } & DeleteConfirmationAwareType
) {
  const {
    dispatch,
    list,
    batchItems,
    batchOperationToggleChecked,
    exportingId,
    handleBookmark,
  } = props;
  const { t } = useTranslation();
  const taskId = useRef();
  const signalRGroupName = useAppSelector((s) => s.user?.signalRGroupName);
  const hasResults = list.length > 0;

  function handleRowClick(e: React.MouseEvent, id: number) {
    if (catchLinkClicked(e)) {
      return;
    }
    dispatch({
      type: "ITEM_SELECT_TOGGLE",
      checked: !batchItems.some(whereEq({ id, checked: true })),
      id: id,
    });
  }

  async function exportList(id: number) {
    dispatch({
      type: "EXPORT_STARTED",
      id,
    });
    try {
      const result = await postWithExceptions(
        "/UserProfile/Export/background",
        {
          param: {
            listIds: [id],
          },
        }
      );
      if (result) {
        taskId.current = result.id;
      }

      dispatch({
        type: "EXPORT_COMPLETED",
      });
    } catch (error) {
      dispatch({
        type: "EXPORT_ERROR",
        error,
      });
    }
  }

  const willHandleBookmark =
    (list: UserProfileGroupType) => async (e: React.MouseEvent) => {
      e.stopPropagation();
      try {
        handleBookmark(list);
      } catch (e) {
        console.error("#handleBookmark", { list, e });
      }
    };

  const handleDropRow = async (
    from: number | undefined,
    to: number | undefined,
    offset: number
  ) => {
    if (from === undefined || to === undefined) {
      return;
    }
    const restoreItems = clone(list);
    try {
      const swapped = swapOrderables(list, from + offset, to + offset);
      dispatch({ type: "REORDER_COMPLETED", items: swapped });

      await postWithExceptions(POST_REORDER_USER_PROFILE_GROUP, {
        param: swapped.map((item, idx) => ({ listId: item.id, order: idx })),
      });
    } catch (e) {
      dispatch({ type: "REORDER_RESTORED", items: restoreItems });
    }
  };

  const bookmarkedList = list.filter(propEq("isBookmarked", true));
  const unBookmarkedList = list.filter(propEq("isBookmarked", false));

  useSignalRGroup(
    signalRGroupName,
    {
      OnBackgroundTaskStatusChange: [
        (state, task: TaskResponseType) => {
          if (
            task.isCompleted &&
            task.id === taskId.current &&
            task.result?.url
          ) {
            window.open(task.result?.url);
          }
        },
      ],
    },
    "ContactsListsTable"
  );
  const draggableOffset = bookmarkedList.length;

  return (
    <Table className={"imported-contacts-table dnd"} basic={"very"}>
      <TableHeader
        checked={batchOperationToggleChecked}
        hasResults={hasResults}
        dispatch={dispatch}
      />
      <GridSelection
        selectedItemsCount={props.checkedIds.length}
        itemsSingular={t("profile.lists.grid.header.singular")}
        itemsPlural={t("profile.lists.grid.header.plural")}
        deleteConfirmationRequested={props.deleteConfirmationRequested}
      />
      <tbody>
        {!hasResults && <tr>{props.emptyContent}</tr>}
        {hasResults &&
          bookmarkedList.map((item: UserProfileGroupType, key: number) => (
            <ListRow
              key={key}
              item={item}
              handleProps={null}
              exportingId={exportingId}
              exportList={exportList}
              handleBookmark={willHandleBookmark}
              handleCheckToggle={(isChecked) => {
                dispatch({
                  type: "ITEM_SELECT_TOGGLE",
                  checked: Boolean(isChecked),
                  id: key as number,
                });
              }}
              handleRowClick={handleRowClick}
              isChecked={props.checkedIds.includes(item.id)}
            />
          ))}
      </tbody>
      <ReactSortable
        tag={"tbody"}
        list={unBookmarkedList}
        direction={"vertical"}
        forceFallback
        onEnd={(ev) => handleDropRow(ev.oldIndex, ev.newIndex, draggableOffset)}
        handle={".drag-handle"}
        setList={noop}
        animation={200}
      >
        {hasResults &&
          unBookmarkedList.map((item: UserProfileGroupType, key: number) => (
            <ListRow
              key={item.id}
              item={item}
              exportingId={exportingId}
              exportList={exportList}
              handleProps={null}
              handleBookmark={willHandleBookmark}
              handleCheckToggle={(isChecked) => {
                dispatch({
                  type: "ITEM_SELECT_TOGGLE",
                  checked: Boolean(isChecked),
                  id: key as number,
                });
              }}
              handleRowClick={handleRowClick}
              isChecked={props.checkedIds.includes(item.id)}
            />
          ))}
      </ReactSortable>
    </Table>
  );
}

function ListRow(props: {
  item: UserProfileGroupType;
  handleRowClick: (e: React.MouseEvent, id: number) => void;
  handleProps: any;
  handleBookmark: (
    item: UserProfileGroupType
  ) => (e: React.MouseEvent) => Promise<any>;
  isChecked: boolean;
  exportingId: number | undefined;
  exportList: (id: number) => void;
  handleCheckToggle: (isChecked: boolean) => void;
}) {
  const {
    exportList,
    exportingId,
    handleBookmark,
    handleCheckToggle,
    handleProps,
    handleRowClick,
    isChecked,
    item,
  } = props;
  const { t } = useTranslation();
  const { routeTo } = useRouteConfig();
  let importStatusClass: string;
  let importStatusName: string;
  if (item.isImported) {
    const isComplete = ["imported", "completed"].includes(
      item.status?.toLowerCase() || ""
    );
    importStatusClass = isComplete ? "completed" : "running";
    importStatusName = isComplete
      ? t("profile.lists.status.imported")
      : t("profile.lists.status.processing");
  } else {
    importStatusClass = "manual";
    importStatusName = t("profile.lists.status.manual");
  }
  const accessRulesGuard = useAccessRulesGuard();
  const { totalContactCount, importedCount, updatedCount, isImported } = item;

  return (
    <tr
      className={`${item.isBookmarked ? "bookmarked" : ""}`}
      onClick={(e) => handleRowClick(e, item.id)}
    >
      <Table.Cell className="checkbox">
        <div className="checkbox-wrap">
          <div
            className={`drag-handle ${item.isBookmarked ? "disabled" : ""}`}
            {...handleProps}
          >
            <Icon className={"button-dots"} />
          </div>
          <i className="icon bookmark-round" onClick={handleBookmark(item)} />
          <Checkbox
            value={item.id}
            checked={isChecked}
            onClick={(_, { checked }) => {
              handleCheckToggle(Boolean(checked));
            }}
          />
        </div>
      </Table.Cell>
      <Table.Cell className={"cell-name"}>
        <div className="cell-flex">
          <Link to={routeTo(`/contacts/lists/${item.id}`)} className="name">
            {item.importName}
          </Link>
          <ExportButton
            onClick={(e) => {
              e.preventDefault();
              exportList(item.id);
            }}
            loading={exportingId === item.id}
            isAllowedToExportByAccess={accessRulesGuard.canExportContacts()}
            isAllowedToExportByLimit={
              item.totalContactCount <= MAXIMUM_EXPORT_LIMIT
            }
          />
        </div>
      </Table.Cell>
      <Table.Cell className={"cell-status"}>
        <span className={`import-status import-status-${importStatusClass}`}>
          {importStatusName}
        </span>
      </Table.Cell>
      <Table.Cell className={"cell-count"}>
        {totalContactCount || "-"}
      </Table.Cell>
      <Table.Cell className={"cell-count"}>{importedCount || "-"}</Table.Cell>
      <Table.Cell className={"cell-count"}>{updatedCount || "-"}</Table.Cell>
      <Table.Cell className={"cell-status"}>
        {isImported
          ? t("profile.lists.status.imported")
          : t("profile.lists.status.manual")}
      </Table.Cell>
      <Table.Cell className={"cell-label"}>
        {item?.importedFrom?.userInfo.displayName || "-"}
      </Table.Cell>
      <Table.Cell className={"cell-date"}>
        {moment(item.createdAt).format("LLL")}
      </Table.Cell>
    </tr>
  );
}

export function TableHeader(props: {
  checked: boolean;
  hasResults: boolean;
  dispatch: Function;
}) {
  const { t } = useTranslation();
  return (
    <Table.Header>
      <Table.Row>
        <Table.HeaderCell className="checkbox">
          <div className="checkbox-wrap">
            <Checkbox
              checked={props.checked}
              disabled={!props.hasResults}
              onClick={
                props.hasResults
                  ? (event, data) =>
                      props.dispatch({
                        type: "BATCH_SELECT_TOGGLE",
                        checked: data.checked,
                      })
                  : undefined
              }
            />
          </div>
        </Table.HeaderCell>
        <Table.HeaderCell className={"cell-name"}>
          {t("profile.lists.grid.header.name")}
        </Table.HeaderCell>
        <Table.HeaderCell className={"cell-status"}>
          {t("profile.lists.grid.header.status")}
        </Table.HeaderCell>
        <Table.HeaderCell className={"cell-count"}>
          {t("profile.lists.grid.header.contacts")}
        </Table.HeaderCell>
        <Table.HeaderCell className={"cell-count"}>
          {t("profile.lists.grid.header.newRecords")}
        </Table.HeaderCell>
        <Table.HeaderCell className={"cell-count"}>
          {t("profile.lists.grid.header.updRecords")}
        </Table.HeaderCell>
        <Table.HeaderCell className={"cell-status"}>
          {t("profile.lists.grid.header.type")}
        </Table.HeaderCell>
        <Table.HeaderCell className={"cell-label"}>
          {t("profile.lists.grid.header.user")}
        </Table.HeaderCell>
        <Table.HeaderCell className={"cell-date"}>
          {t("profile.lists.grid.header.created")}
        </Table.HeaderCell>
      </Table.Row>
    </Table.Header>
  );
}

export function ExportButton(props: {
  isAllowedToExportByAccess: boolean;
  isAllowedToExportByLimit: boolean;
  loading: boolean;
  onClick?: (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => void | Promise<void>;
}) {
  const { t } = useTranslation();
  if (!props.isAllowedToExportByAccess) {
    return null;
  }
  return props.isAllowedToExportByLimit ? (
    <Button
      loading={props.loading}
      className={`view-link`}
      onClick={props.loading ? undefined : props.onClick}
    >
      {t("profile.lists.button.export")}
    </Button>
  ) : (
    <InfoTooltip
      placement={"right"}
      offset={[0, 0]}
      children={t("profile.lists.tooltip.disabledExport")}
      trigger={
        <div
          className={`view-link ui button disabled clickable`}
          onClick={undefined}
        >
          {t("profile.lists.button.export")}
        </div>
      }
    />
  );
}
