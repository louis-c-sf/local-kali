import React, { useContext } from "react";
import styles from "./ContactsGrid.module.css";
import { Checkbox, Table } from "semantic-ui-react";
import { CampaignDetailsContext } from "./CampaignDetailsContext";
import { useTranslation } from "react-i18next";
import { useFieldLocales } from "../../Contact/locaizable/useFieldLocales";
import { Link, NavLink } from "react-router-dom";
import useRouteConfig from "../../../config/useRouteConfig";
import {
  getPageSize,
  isAllSelected,
  isPending,
  SelectAllMachineStateType,
} from "../../../xstate/selectAllIItemsMachine";
import { SelectAllDialog } from "../../Contact/ContactsTable/SelectAllDialog";
import ProfileSearchType from "../../../types/ProfileSearchType";
import {
  BroadcastStatusAliasType,
  BroadcastStatusMap,
  TargetedChannelType,
} from "../../../types/BroadcastCampaignType";
import { ChannelsIconList } from "../../shared/grid/ChannelsIconList";
import useCompanyChannels from "../../Chat/hooks/useCompanyChannels";
import { ContactLabels } from "../../Contact/ContactsTable/ContactLabels";
import { BroadcastUserStatusResponseType } from "../../../api/Broadcast/fetchBroadcastUsersStatus";
import { defaultTo, find, head, pipe, toPairs } from "ramda";
import { useSelectMessageByLink } from "../../Chat/hooks/Labels/useSelectMessageByLink";
import MessageType from "../../../types/MessageType";
import { useCampaignStatusLocales } from "../useCampaignStatusLocales";
import { FieldError } from "../../shared/form/FieldError";
import { useAccessRulesGuard } from "../../Settings/hooks/useAccessRulesGuard";
import { useAppSelector } from "../../../AppRootContext";
import { useTeams } from "../../../container/Settings/useTeams";
import { getTwilioErrorCodeMap } from "../../../config/MessageErrorCodeMapping";
import { isAllContactSelected } from "../../Contact/ContactsTable";

export function ContactsGrid(props: {
  togglePage: () => void;
  selectItem: (id: string) => void;
  deselectItem: (id: string) => void;
  selectAllState: SelectAllMachineStateType;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  hasMoreToSelect: boolean;
}) {
  const {
    selectAllState,
    selectItem,
    deselectItem,
    onSelectAll,
    onDeselectAll,
    hasMoreToSelect,
    togglePage,
  } = props;

  const { contacts, contactsPending, contactStatusDetails, statusSelected } =
    useContext(CampaignDetailsContext);

  const companyChannels = useCompanyChannels();
  const { routeTo } = useRouteConfig();
  const { cellValueFactory } = useFieldLocales();
  const userId = useAppSelector((s) => s.user.id);
  const accessRulesGuard = useAccessRulesGuard();
  const { t } = useTranslation();
  const { getRoute } = useSelectMessageByLink();
  const { statusMapping } = useCampaignStatusLocales();
  const { teams } = useTeams();
  const twilioErrorCodeMap = getTwilioErrorCodeMap(t);

  const disableSelectAll = contacts.length === 0 || contactsPending;

  function isRowSelected(contact: ProfileSearchType) {
    return selectAllState.context.targetIds.includes(contact.id);
  }

  const getStatusAlias = (
    statusRecord: BroadcastUserStatusResponseType
  ): BroadcastStatusAliasType =>
    pipe(
      () => toPairs(BroadcastStatusMap),
      find(([alias, status]) => status === statusRecord.broadcastMessageStatus),
      defaultTo([]),
      head
    )();

  function getStatusText(statusRecord: BroadcastUserStatusResponseType) {
    const statusAlias = getStatusAlias(statusRecord);
    return statusAlias ? statusMapping[statusAlias] : "";
  }

  function isAllowedToViewChat(
    chat: BroadcastUserStatusResponseType["conversation"]
  ) {
    return (
      accessRulesGuard.canSeeOtherAssigneesConversation() ||
      chat.assignee?.userInfo.id === userId ||
      teams
        .find((t) => t.id === chat?.assignedTeam?.id)
        ?.members.some((m) => m.userInfo.id === userId)
    );
  }

  const isShowStatus = ["delivered", "read", "sent"].includes(statusSelected);
  const isShowReason = ["failed"].includes(statusSelected);
  const isShowReply = ["replied"].includes(statusSelected);
  const getErrorMessage = (statusRecord: BroadcastUserStatusResponseType) => {
    const key =
      statusRecord.broadcastMessage?.ChannelStatusMessage ??
      statusRecord.broadcastMessage?.channelStatusMessage;
    const unknownKey = "unknown";
    return (
      twilioErrorCodeMap[key ?? unknownKey] ??
      `${key ?? ""} ${twilioErrorCodeMap[unknownKey]}`
    );
  };

  return (
    <div className={`${styles.component} campaign-contacts-grid-wrap`}>
      <Table basic={"very"} className={"campaign-contacts-grid"}>
        <Table.Header className={styles.header}>
          <Table.Row>
            <Table.HeaderCell key={`id`} className={"checkbox"}>
              <div className="checkbox-wrap">
                <Checkbox
                  checked={isAllContactSelected(selectAllState)}
                  disabled={disableSelectAll}
                  label=""
                  onClick={disableSelectAll ? undefined : togglePage}
                />
              </div>
            </Table.HeaderCell>
            <Table.HeaderCell key={`recipient`}>
              <div className="field-header">
                {t("broadcast.details.grid.header.recipient")}
              </div>
            </Table.HeaderCell>
            <Table.HeaderCell key={`channel`}>
              <div className="field-header">
                {t("broadcast.details.grid.header.channel")}
              </div>
            </Table.HeaderCell>
            <Table.HeaderCell key={`phone`}>
              <div className="field-header">
                {t("broadcast.details.grid.header.phone")}
              </div>
            </Table.HeaderCell>
            <Table.HeaderCell key={`labels`}>
              <div className="field-header">
                {t("broadcast.details.grid.header.labels")}
              </div>
            </Table.HeaderCell>
            {isShowStatus && (
              <Table.HeaderCell key={`status`}>
                <div className="field-header">
                  {t("broadcast.details.grid.header.status")}
                </div>
              </Table.HeaderCell>
            )}
            {isShowReason && (
              <Table.HeaderCell key={`reason`}>
                <div className="field-header">
                  {t("broadcast.details.grid.header.reason")}
                </div>
              </Table.HeaderCell>
            )}
            {isShowReply && (
              <Table.HeaderCell key={`reply`}>
                <div className="field-header">
                  {t("broadcast.details.grid.header.reply")}
                </div>
              </Table.HeaderCell>
            )}
            <Table.HeaderCell key={`view`}>
              <div className="field-header">
                {t("broadcast.details.grid.header.viewMessage")}
              </div>
            </Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <SelectAllDialog
          totalCount={selectAllState.context.total}
          isPageSelected={isAllSelected(selectAllState)}
          isAllSelected={isAllSelected(selectAllState)}
          pageCount={getPageSize(selectAllState)}
          selectAll={onSelectAll}
          deselectAll={onDeselectAll}
          pending={isPending(selectAllState)}
          hasMoreToSelect={hasMoreToSelect}
        />
        <Table.Body className={styles.body}>
          {contacts.map((contact, idx) => {
            const statusRecord = contactStatusDetails.find(
              (d) => d.userProfileId === contact.id
            );
            const outMessage = statusRecord?.broadcastMessage;
            const channels: TargetedChannelType[] = outMessage?.channel
              ? [{ channel: outMessage.channel }]
              : [];

            return (
              <Table.Row key={statusRecord?.conversationId ?? idx}>
                <Table.Cell key={"id"} className={"checkbox"}>
                  <div className="checkbox-wrap">
                    <Checkbox
                      checked={isRowSelected(contact)}
                      disabled={contactsPending}
                      onClick={() =>
                        isRowSelected(contact)
                          ? deselectItem(contact.id)
                          : selectItem(contact.id)
                      }
                    />
                  </div>
                </Table.Cell>
                <Table.Cell key={"recipient"} className={styles.name}>
                  <NavLink to={routeTo(`/profile/${contact.id}`)}>
                    {cellValueFactory("displayName", contact)}
                  </NavLink>
                </Table.Cell>
                <Table.Cell key={"channel"}>
                  {channels && (
                    <ChannelsIconList
                      channelsAvailable={companyChannels}
                      value={channels}
                    />
                  )}
                </Table.Cell>
                <Table.Cell key={"phone"}>
                  {cellValueFactory("PhoneNumber", contact)}
                </Table.Cell>
                <Table.Cell key={"labels"}>
                  <ContactLabels
                    tags={contact.conversationHashtags ?? []}
                    limit={3}
                  />
                </Table.Cell>
                {isShowStatus && (
                  <Table.Cell key={"status"}>
                    {statusRecord &&
                    getStatusAlias(statusRecord) === "failed" ? (
                      <span className={styles.failed}>
                        <FieldError text={getStatusText(statusRecord)} />
                      </span>
                    ) : (
                      statusRecord && getStatusText(statusRecord)
                    )}
                  </Table.Cell>
                )}
                {isShowReason &&
                  statusRecord &&
                  getStatusAlias(statusRecord) === "failed" && (
                    <Table.Cell key={"reason"}>
                      {t(getErrorMessage(statusRecord))}
                    </Table.Cell>
                  )}
                {isShowReply && statusRecord?.repliedMessage && (
                  <Table.Cell key={"reason"}>
                    <span className={styles.reply}>
                      {statusRecord?.repliedMessage?.messageContent ?? ""}
                    </span>
                  </Table.Cell>
                )}
                <Table.Cell key={"view"}>
                  {statusRecord &&
                    isAllowedToViewChat(statusRecord.conversation) && (
                      <Link
                        children={t("form.button.view")}
                        to={getRoute(
                          statusRecord.broadcastMessage as MessageType,
                          statusRecord.conversationId,
                          statusRecord.conversation.assignee?.userInfo.id
                        )}
                      />
                    )}
                </Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table>
    </div>
  );
}
