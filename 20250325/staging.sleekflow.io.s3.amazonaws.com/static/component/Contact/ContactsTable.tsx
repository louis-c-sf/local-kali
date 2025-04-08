import React, { ReactNode, useCallback, useEffect, useMemo } from "react";
import { Checkbox, Table } from "semantic-ui-react";
import ContactType, { CustomProfileField } from "../../types/ContactType";
import ProfileSearchType from "../../types/ProfileSearchType";
import { catchLinkClicked } from "../../utility/dom";
import {
  DeselectAllEvent,
  getPageSize,
  isAllSelected,
  isPageSelected,
  isPending,
  isSelected,
  SelectAllEvent,
  SelectAllMachineEvent,
  SelectAllMachineStateType,
} from "../../xstate/selectAllIItemsMachine";
import { SortParamType } from "../../container/Contact";
import { TargetedChannelType } from "../../types/BroadcastCampaignType";
import { DataColumnType, TableListBody } from "./ContactsTable/TableListBody";
import { SelectAllDialog } from "./ContactsTable/SelectAllDialog";
import { assocPath, equals } from "ramda";
import { useTranslation } from "react-i18next";
import { InfoTooltip } from "../shared/popup/InfoTooltip";
import { useFieldLocales } from "./locaizable/useFieldLocales";
import { ProfileType } from "../../types/LoginType";
import { useAppSelector } from "../../AppRootContext";
import { useTeams } from "container/Settings/useTeams";

const sortableColumns = [
  "createdAt",
  "updatedAt",
  "displayName",
  "LastContact",
  "LastContactFromCustomers",
];

const prependColumns = ["id", "displayName"];
const appendColumns = ["createdAt", "updatedAt"];

const fieldTypeMapping = {
  displayName: "singlelinetext",
  createdAt: "datetime",
  company: "string",
  updatedAt: "datetime",
};

export function getProfileChannels(profile: ProfileType | ProfileSearchType) {
  let channels: TargetedChannelType[] = [];
  if (profile.facebookAccount) {
    channels = [
      ...channels,
      {
        channel: "facebook",
        ids: [profile.facebookAccount.pageId],
      },
    ];
  }
  if (profile.emailAddress) {
    channels = [
      ...channels,
      {
        channel: "email",
      },
    ];
  }
  if (profile.whatsAppAccount) {
    channels = [
      ...channels,
      {
        channel: "whatsapp",
        ids: [profile.whatsAppAccount.instanceId],
      },
    ];
  }
  if (profile.whatsApp360DialogUser) {
    channels = [
      ...channels,
      {
        channel: "whatsapp360dialog",
        ids: [profile.whatsApp360DialogUser.channelId + ""],
      },
    ];
  }
  if (profile.whatsappCloudApiUser) {
    channels = [
      ...channels,
      {
        channel: "whatsappcloudapi",
        ids: [profile.whatsappCloudApiUser.whatsappChannelPhoneNumber],
      },
    ];
  }
  if (profile.webClient) {
    channels = [
      ...channels,
      {
        channel: "web",
      },
    ];
  }
  if (profile.weChatUser) {
    channels = [
      ...channels,
      {
        channel: "wechat",
      },
    ];
  }
  if (profile.lineUser) {
    channels = [
      ...channels,
      {
        channel: "line",
      },
    ];
  }
  if (profile.instagramUser) {
    channels = [
      ...channels,
      {
        channel: "instagram",
      },
    ];
  }
  return channels;
}

export function isAllContactSelected(
  selectAllState: SelectAllMachineStateType
) {
  return (
    Boolean(selectAllState.matches("selectedPage")) ||
    Boolean(selectAllState.matches("selectedAll")) ||
    Boolean(selectAllState.matches("pending"))
  );
}

export default function ContactsTable(props: {
  loading: boolean;
  customFields: CustomProfileField[];
  profileResult: readonly ProfileSearchType[];
  selectAllState: SelectAllMachineStateType;
  selectAllUpdate: (e: SelectAllMachineEvent) => SelectAllMachineStateType;
  sort?: SortParamType[];
  sortBy?: (param: SortParamType) => void;
  allSelected?: boolean;
  emptyContent: ReactNode;
  contextActions: ReactNode;
}) {
  const { selectAllUpdate, sort, selectAllState, loading } = props;
  const { sortBy, customFields, profileResult, contextActions } = props;
  const [staffList, selectedTimeZone] = useAppSelector(
    (s) => [s.staffList, s.selectedTimeZone],
    equals
  );
  const customFieldsOrdered = (customFields || [])
    .filter((field) => field.isVisible)
    .sort((a, b) => a.order - b.order);
  const { listFieldsName, cellValueFactory } = useFieldLocales();

  const columns: DataColumnType[] = useMemo(() => {
    return prependColumns
      .map((fieldName) => {
        return {
          fieldName: fieldName,
          displayName: listFieldsName[fieldName] ?? fieldName,
          sortable: sortableColumns.includes(fieldName),
          dataType: fieldTypeMapping[fieldName] ?? "string",
        };
      })
      .concat(
        customFieldsOrdered.map((field) => {
          return {
            fieldName: field.fieldName,
            displayName: field.displayName,
            sortable: sortableColumns.includes(field.fieldName),
            dataType: field.type,
          };
        })
      )
      .concat(
        appendColumns.map((fieldName) => {
          return {
            fieldName: fieldName,
            displayName: listFieldsName[fieldName] ?? fieldName,
            sortable: sortableColumns.includes(fieldName),
            dataType: fieldTypeMapping[fieldName] ?? "string",
          };
        })
      );
  }, [JSON.stringify(customFieldsOrdered)]);

  const mappingResult = useMemo(
    () =>
      profileResult.map((profile) => {
        const initialContact: Partial<ContactType> = {
          id: cellValueFactory("id", profile),
          displayName: cellValueFactory("displayName", profile),
          createdAt: cellValueFactory("createdAt", profile),
          updatedAt: cellValueFactory("updatedAt", profile),
          tags: cellValueFactory("tags", profile),
          pic: cellValueFactory("pic", profile),
          contactLists: cellValueFactory("contactLists", profile),
          customFields: {},
          collaborators: cellValueFactory("collaborators", profile),
        };
        return (prependColumns as (string | CustomProfileField)[])
          .concat(customFieldsOrdered)
          .concat(appendColumns)
          .reduce<ContactType>((acc, next) => {
            const fieldName = typeof next === "string" ? next : next.fieldName;
            return assocPath(
              ["customFields", fieldName],
              cellValueFactory(next, profile),
              acc
            );
          }, initialContact as ContactType);
      }),
    [
      JSON.stringify([
        profileResult,
        prependColumns,
        customFieldsOrdered,
        appendColumns,
      ]),
    ]
  );

  const handleAllSelected = () => {
    let e: SelectAllEvent = {
      type: "SELECT_ALL",
    };
    selectAllUpdate(e);
  };
  const handleAllDeselect = () => {
    let e: DeselectAllEvent = {
      type: "DESELECT_ALL",
    };
    selectAllUpdate(e);
  };

  const handleCellSelected = useCallback(
    (e: React.MouseEvent, id: string) => {
      if (catchLinkClicked(e)) {
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      if (isSelected(id, selectAllState)) {
        selectAllUpdate({
          type: "DESELECT",
          id,
        });
      } else {
        selectAllUpdate({
          type: "SELECT",
          id,
        });
      }
    },
    [JSON.stringify(selectAllState), selectAllUpdate]
  );
  const { refreshTeams, teams, booted } = useTeams();

  const hasResults = mappingResult.length > 0;
  const hasMoreToSelect =
    isPageSelected(selectAllState) &&
    selectAllState.context.total > getPageSize(selectAllState);

  const getIsSelected = useCallback(
    (id: string) => isSelected(id, selectAllState),
    [JSON.stringify(selectAllState)]
  );
  useEffect(() => {
    if (!booted) {
      refreshTeams();
    }
  }, [booted]);
  return (
    <>
      <Table sortable basic={"very"} className={loading ? "blocked" : ""}>
        <Header
          columns={columns}
          sort={sort}
          sortBy={sortBy}
          selectAllState={selectAllState}
          selectAllUpdate={selectAllUpdate}
        />
        {!isAllSelected(selectAllState) &&
          !hasMoreToSelect &&
          !isPending(selectAllState) &&
          contextActions}
        <SelectAllDialog
          totalCount={selectAllState.context.total}
          isPageSelected={isPageSelected(selectAllState)}
          isAllSelected={isAllSelected(selectAllState)}
          pageCount={getPageSize(selectAllState)}
          selectAll={handleAllSelected}
          deselectAll={handleAllDeselect}
          pending={isPending(selectAllState)}
          hasMoreToSelect={hasMoreToSelect}
        />
        {hasResults ? (
          <Table.Body>
            <TableListBody
              columns={columns}
              data={mappingResult ?? []}
              handleCellSelected={handleCellSelected}
              selectedTimeZone={selectedTimeZone}
              staffList={staffList}
              teams={teams}
              isSelected={getIsSelected}
              checkboxLocked={selectAllState.matches("pending")}
            />
          </Table.Body>
        ) : (
          <>
            <Table.Body>
              <tr>{props.emptyContent}</tr>
            </Table.Body>
          </>
        )}
      </Table>
    </>
  );
}

function Header(props: {
  columns: DataColumnType[];
  sort?: SortParamType[];
  sortBy?: (param: SortParamType) => void;
  selectAllState: SelectAllMachineStateType;
  selectAllUpdate: (e: SelectAllMachineEvent) => SelectAllMachineStateType;
}) {
  let { columns, sort, sortBy, selectAllState, selectAllUpdate } = props;
  const { t } = useTranslation();

  return (
    <Table.Header>
      <Table.Row verticalAlign="middle">
        {columns.map((field, fIndex) => {
          let classNames = [];
          const fieldName = field.fieldName;
          let sortDirection: "ascending" | "descending" | undefined = undefined;
          let sortHandler: Function | undefined = undefined;

          if (sort && sortBy && field.sortable) {
            classNames.push("sortable");
            const sortParam = sort.find((s) => s.field === fieldName) ?? {
              field: fieldName,
              direction: undefined,
            };
            const sortSteps = ["ASC", "DESC", undefined] as const;
            const sortStepsTranslated = [
              "ascending",
              "descending",
              undefined,
            ] as const;
            sortDirection =
              sortStepsTranslated[sortSteps.indexOf(sortParam.direction)] ??
              undefined;
            sortHandler = () => {
              const currentStepIndex = sortSteps.indexOf(sortParam.direction);
              const nextStepIndex =
                currentStepIndex === sortSteps.length - 1
                  ? 0
                  : currentStepIndex + 1;
              sortBy!({
                field: field.fieldName,
                direction: sortSteps[nextStepIndex],
              });
            };
          }
          if (fieldName === "id") {
            classNames.push("checkbox");
          }

          const disableToggleAll =
            !selectAllState.nextEvents.includes("TOGGLE_PAGE");

          return (
            <Table.HeaderCell
              key={`cell${fIndex}`}
              className={classNames.join(" ")}
              sorted={sortDirection}
              onClick={sortHandler}
            >
              {fieldName === "id" ? (
                <div className="checkbox-wrap">
                  <InfoTooltip
                    placement={"right"}
                    children={t("profile.tooltip.grid.selectAll")}
                    trigger={
                      <Checkbox
                        checked={isAllContactSelected(selectAllState)}
                        label=""
                        disabled={disableToggleAll}
                        onClick={
                          disableToggleAll
                            ? undefined
                            : () => {
                                if (
                                  selectAllState.context.hasSelectedAll &&
                                  Boolean(
                                    selectAllState.matches("selectedSome")
                                  )
                                ) {
                                  selectAllUpdate({ type: "SELECT_ALL" });
                                } else {
                                  selectAllUpdate({ type: "TOGGLE_PAGE" });
                                }
                              }
                        }
                      />
                    }
                  />
                </div>
              ) : (
                <div className="field-header">{field.displayName}</div>
              )}
            </Table.HeaderCell>
          );
        })}
      </Table.Row>
    </Table.Header>
  );
}
