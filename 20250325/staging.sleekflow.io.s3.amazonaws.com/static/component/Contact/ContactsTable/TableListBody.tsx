import ContactType from "../../../types/ContactType";
import React from "react";
import { Checkbox, Image, Table } from "semantic-ui-react";
import Avatar from "react-avatar";
import { ChatLabel } from "../../Chat/ChatLabel";
import moment from "moment";
import { staffDisplayName } from "../../Chat/utils/staffDisplayName";
import { channelPhoneNumberImage } from "../../Chat/ChatGroupItemImage/ChatGroupItemImage";
import { isEmail } from "../Individual/ProfileContentNote";
import ContactListRow from "../Lists/ContactListRow";
import { TeamType } from "../../../types/TeamType";
import { equals, propEq } from "ramda";
import { StaffType } from "../../../types/StaffType";
import labelStyles from "../../shared/Labels.module.css";
import MessageContent from "../../Chat/Records/MessageContent";
import { CollaboratorItem } from "component/Chat/ChatHeader/CollaboratorsInput";
import { getStaffId } from "types/TeamType";
import styles from "./TableListBody.module.css";
import { Link } from "react-router-dom";
import useRouteConfig from "../../../config/useRouteConfig";
import { htmlEscape } from "../../../lib/utility/htmlEscape";

export interface DataColumnType {
  displayName: string;
  fieldName: string;
  sortable: boolean;
  dataType: string;
}

export const MAX_LENGTH_LABELS = 3;
export const MAX_LENGTH_LISTS = 1;
export const TableListBody = (props: {
  columns: DataColumnType[];
  data: ContactType[];
  handleCellSelected: (e: React.MouseEvent, id: string) => void;
  selectedTimeZone: number;
  staffList: StaffType[];
  checkboxLocked: boolean;
  teams: TeamType[];
  isSelected: (id: string) => boolean;
}) => {
  const {
    columns,
    data,
    handleCellSelected,
    selectedTimeZone,
    staffList,
    checkboxLocked,
    isSelected,
    teams,
  } = props;

  return (
    <>
      {data.map((profile, index) => {
        return (
          <TableRowMemo
            key={`contact${profile.id}-${index}`}
            handleCellSelected={handleCellSelected}
            selectedTimeZone={selectedTimeZone}
            profile={profile}
            columns={columns}
            teams={teams}
            isSelected={isSelected}
            checkboxLocked={checkboxLocked}
            staffList={staffList}
          />
        );
      })}
    </>
  );
};

function TableRow(props: {
  profile: ContactType;
  handleCellSelected: (e: React.MouseEvent, id: string) => void;
  columns: DataColumnType[];
  selectedTimeZone: number;
  staffList: StaffType[];
  checkboxLocked: boolean;
  teams: TeamType[];
  isSelected: (id: string) => boolean;
}) {
  const {
    checkboxLocked,
    columns,
    isSelected,
    handleCellSelected,
    profile,
    selectedTimeZone,
    staffList,
    teams,
  } = props;
  const onRowClick = (e: React.MouseEvent) => {
    handleCellSelected(e, profile.id);
  };
  const { routeTo } = useRouteConfig();
  return (
    <Table.Row
      className={
        profile.contactLists.length > 0 &&
        columns.some((c) => c.dataType === "Lists")
          ? "list-row"
          : ""
      }
    >
      {columns.map((column, cellIndex) => {
        const fieldName = column.fieldName;
        const fieldType = column.dataType;
        if (fieldName.toLowerCase() === "id") {
          return (
            <Table.Cell key={cellIndex} className={"checkbox"}>
              <div className="checkbox-wrap">
                <Checkbox
                  checked={isSelected(profile.id)}
                  disabled={checkboxLocked}
                  onClick={onRowClick}
                />
              </div>
            </Table.Cell>
          );
        } else if (fieldName.toLowerCase() === "displayname") {
          const foundLastChannelField = columns.find(
            (col) => col.fieldName === "LastChannel"
          );
          const channelValue = foundLastChannelField?.fieldName
            ? profile.customFields[foundLastChannelField.fieldName]
            : "";
          const channelName = channelValue?.includes("WhatsApp")
            ? "whatsapp"
            : channelValue?.includes("SMS")
            ? "sms"
            : "";
          const phoneNumberImage = channelPhoneNumberImage(
            profile.displayName,
            channelName || ""
          );
          return (
            <Table.Cell className={"cell-displayName"} key={cellIndex}>
              <Link
                to={routeTo(`/profile/${profile.id}`)}
                className={"profile-link"}
              >
                <div className="displayName">
                  {profile.pic || phoneNumberImage ? (
                    <Image circular src={profile.pic || phoneNumberImage} />
                  ) : (
                    <Avatar
                      name={profile.displayName}
                      round={true}
                      maxInitials={2}
                      size={"24px"}
                    />
                  )}
                  <div className={"field-major"}>{profile.displayName}</div>
                </div>
              </Link>
            </Table.Cell>
          );
        } else if (fieldType === "Labels") {
          const channelsOutstanding = profile.tags.length - MAX_LENGTH_LABELS;
          return (
            <Table.Cell key={`${cellIndex}-labels`}>
              <div className={labelStyles.container}>
                {profile.tags.length > 0 ? (
                  <>
                    {profile.tags.slice(0, MAX_LENGTH_LABELS).map((tag, t) => (
                      <ChatLabel tag={tag} key={t} />
                    ))}
                    {channelsOutstanding > 0 && (
                      <span className={labelStyles.counterLabel}>
                        +{channelsOutstanding}
                      </span>
                    )}
                  </>
                ) : (
                  "-"
                )}
              </div>
            </Table.Cell>
          );
        } else if (fieldType === "Lists") {
          const channelsOutstanding =
            profile.contactLists.length - MAX_LENGTH_LISTS;
          return (
            <Table.Cell key={`${cellIndex}-labels`}>
              <div className={labelStyles.listContainer}>
                {profile.contactLists.length > 0 ? (
                  <>
                    {profile.contactLists
                      .slice(0, MAX_LENGTH_LISTS)
                      .map((list) => (
                        <ContactListRow list={list} key={list.id} />
                      ))}
                    {channelsOutstanding > 0 && (
                      <span className={labelStyles.counterLabel}>
                        +{channelsOutstanding}
                      </span>
                    )}
                  </>
                ) : (
                  "-"
                )}
              </div>
            </Table.Cell>
          );
        } else if (fieldType === "Collaborators") {
          return (
            <Table.Cell key={`${cellIndex}-labels`}>
              <div className={styles.collaboratorColumn}>
                {profile.collaborators?.length > 0
                  ? profile.collaborators.map((staff) => {
                      const targetStaff = staffList.find(
                        (s) => getStaffId(s) === staff.identityId
                      );

                      if (targetStaff) {
                        return (
                          <CollaboratorItem
                            key={staff.identityId}
                            staff={
                              staffList.find(
                                (s) => getStaffId(s) === staff.identityId
                              )!
                            }
                          />
                        );
                      }
                      return "-";
                    })
                  : "-"}
              </div>
            </Table.Cell>
          );
        }
        if (
          fieldName.toLowerCase().includes("email") ||
          isEmail(profile.customFields[fieldName])
        ) {
          return (
            <Table.Cell className="origin email" key={cellIndex}>
              <div className="message-content-transformed">
                {profile.customFields[fieldName] ? (
                  <a
                    className="origin"
                    href={`mailto:${htmlEscape(
                      profile.customFields[fieldName]
                    )}`}
                  >
                    {profile.customFields[fieldName]}
                  </a>
                ) : (
                  "-"
                )}
              </div>
            </Table.Cell>
          );
        }

        if (profile.customFields[fieldName]?.includes("$$boolean$$")) {
          return (
            <Table.Cell key={cellIndex}>
              <div className="channels">{profile.customFields[fieldName]}</div>
            </Table.Cell>
          );
        }

        if (fieldName === "createdAt" || fieldName === "updatedAt") {
          return (
            <Table.Cell key={cellIndex}>
              {moment
                .utc(profile[fieldName])
                .utcOffset(selectedTimeZone)
                .format("LLL")}
            </Table.Cell>
          );
        }

        if (fieldType === "TravisUser") {
          const selectedStaff = staffList.find(
            (staff) => staff.userInfo.id === profile.customFields[fieldName]
          );
          return (
            <Table.Cell key={cellIndex}>
              {selectedStaff ? staffDisplayName(selectedStaff) : "-"}
            </Table.Cell>
          );
        }
        if (fieldName === "AssignedTeam") {
          const selectedTeam = teams.find(
            propEq("id", Number(profile.customFields[fieldName]))
          );
          return (
            <Table.Cell key={cellIndex}>{selectedTeam?.name ?? "-"}</Table.Cell>
          );
        }

        if (fieldName === "PhoneNumber") {
          return (
            <Table.Cell key={cellIndex} className="origin">
              <a href={`tel:${htmlEscape(profile.customFields[fieldName])}`}>
                {profile.customFields[fieldName]}
              </a>
            </Table.Cell>
          );
        }

        return (
          <Table.Cell key={cellIndex}>
            {profile.customFields[fieldName] ? (
              <MessageContent
                className={"origin"}
                message={profile.customFields[fieldName]}
              />
            ) : (
              "-"
            )}
          </Table.Cell>
        );
      })}
    </Table.Row>
  );
}

const TableRowMemo = React.memo(TableRow, (prev, next) => {
  return (
    prev.checkboxLocked === next.checkboxLocked &&
    prev.isSelected === next.isSelected &&
    prev.handleCellSelected === next.handleCellSelected &&
    equals(prev.staffList, next.staffList) &&
    equals(prev.teams, next.teams) &&
    equals(prev.columns, next.columns) &&
    equals(prev.profile, next.profile)
  );
});
