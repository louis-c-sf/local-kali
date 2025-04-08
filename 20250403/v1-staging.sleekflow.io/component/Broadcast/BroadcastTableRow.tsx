import React from "react";
import BroadcastCampaignType, {
  TargetedChannelType,
} from "../../types/BroadcastCampaignType";
import { Button, Checkbox, Dropdown, Loader, Table } from "semantic-ui-react";
import { InfoTooltip } from "../shared/popup/InfoTooltip";
import moment from "moment";
import { Link } from "react-router-dom";
import { TableContextMenu } from "../shared/grid/TableContextMenu";
import { ChannelConfiguredType } from "../Chat/Messenger/types";
import { staffDisplayName } from "../Chat/utils/staffDisplayName";
import { useTranslation } from "react-i18next";
import useRouteConfig from "../../config/useRouteConfig";
import { ChannelsIconList } from "../shared/grid/ChannelsIconList";
import { CampaignStatus } from "./CampaignStatus";
import { v2LanguageMap } from "AppRootContext";
import i18n from "i18n";
import { WEB_VERSION_V2_URL } from "auth/Auth0ProviderWithRedirect";

export function BroadcastTableRow(props: {
  onLoadCsv?: (broadcast: BroadcastCampaignType, title: string) => void;
  broadcast: BroadcastCampaignType;
  selectedTimeZone: number;
  showFields: string[];
  batchPending: boolean;
  handleCellSelected: (e: React.MouseEvent, id: string) => void;
  handleDuplicateCampaign: (campaign: BroadcastCampaignType) => void;
  handleTogglePause: (id: string, on: boolean) => Promise<void>;
  selectedBroadcast: string[];
  duplicateItemPending: BroadcastCampaignType | null;
  loadingCsv: boolean;
  companyChannels: ChannelConfiguredType<any>[];
}) {
  const {
    batchPending,
    broadcast,
    handleCellSelected,
    showFields,
    selectedBroadcast,
    duplicateItemPending,
    handleDuplicateCampaign,
    selectedTimeZone,
    loadingCsv,
    companyChannels,
    onLoadCsv,
  } = props;
  const { t } = useTranslation();
  const { routeTo } = useRouteConfig();

  async function togglePause(broadcasting: boolean) {
    await props.handleTogglePause(broadcast.id, broadcasting);
  }
  const { language } = i18n;
  function getBroadcastLink(broadcast: BroadcastCampaignType) {
    if (
      (broadcast.audienceTypes && broadcast.audienceTypes.length > 1) ||
      (broadcast.audienceTypes &&
        broadcast.audienceTypes.length === 1 &&
        !broadcast.audienceTypes?.some(
          (a) => a.fieldName.toLowerCase() === "importfrom"
        ))
    ) {
      const v2BroadcastLink = `${WEB_VERSION_V2_URL}/${v2LanguageMap[language]}/broadcasts/${broadcast.channelWithId?.channel}/${broadcast.id}`;
      return broadcast.status === "Draft"
        ? `${v2BroadcastLink}/edit`
        : `${v2BroadcastLink}/review`;
    }
    if (broadcast.status !== "Draft") {
      return routeTo(`/campaigns/${broadcast.id}/recipients`, true);
    }
    return routeTo(`/campaigns/${broadcast.id}`, true);
  }
  return (
    <Table.Row
      key={broadcast.id}
      onClick={(e: React.MouseEvent) => handleCellSelected(e, broadcast.id)}
    >
      {showFields.map((fieldName) => {
        if (broadcast[fieldName] === undefined) {
          return <td>-</td>;
        }
        const fieldValue = broadcast[fieldName];
        const key = `${broadcast.id}${fieldName}`;
        const isChecked = selectedBroadcast.indexOf(broadcast.id) > -1;
        const isDuplicatePending = duplicateItemPending?.id === broadcast.id;

        switch (fieldName as keyof BroadcastCampaignType) {
          case "id":
            return (
              <Table.Cell key={key} className={"checkbox"}>
                <div className="checkbox-wrap">
                  {(isChecked && batchPending) || isDuplicatePending ? (
                    <Loader inline active size={"small"} />
                  ) : (
                    <Checkbox
                      checked={isChecked}
                      onClick={(e: React.MouseEvent) =>
                        handleCellSelected(e, broadcast.id)
                      }
                    />
                  )}
                </div>
              </Table.Cell>
            );

          case "status":
            return (
              <Table.Cell key={key} className={"status"}>
                <InfoTooltip
                  offset={[0, -30]}
                  placement={"right"}
                  children={t("broadcast.tooltip.field.status")}
                  trigger={
                    <CampaignStatus value={fieldValue} type={"broadcast"} />
                  }
                />
              </Table.Cell>
            );

          case "lastUpdated":
            return (
              <Table.Cell key={key} className={`lastUpdated`}>
                {moment
                  .utc(fieldValue)
                  .utcOffset(selectedTimeZone)
                  .format("LLL")}
              </Table.Cell>
            );

          case "name":
            let title = fieldValue.trim();

            return (
              <>
                <Table.Cell
                  key={`${key}name`}
                  className={`name cell-name ${
                    !title ? "cell-name_untitled" : ""
                  } `}
                >
                  <div className="wrap">
                    {broadcast.status !== "Draft" ? (
                      <a
                        rel="noopener noreferrer"
                        href={getBroadcastLink(broadcast)}
                        className={"name"}
                      >
                        {title || t("broadcast.grid.row.campaign.untitled")}
                      </a>
                    ) : (
                      <a
                        rel="noopener noreferrer"
                        href={getBroadcastLink(broadcast)}
                        className={"name draft"}
                      >
                        {title || t("broadcast.grid.row.campaign.untitled")}
                      </a>
                    )}
                    <div className="button-area">
                      {broadcast.status &&
                        ["Paused", "Sending", "Scheduled"].includes(
                          broadcast.status
                        ) && (
                          <Button
                            className={"pause-toggle"}
                            onClick={(e) => {
                              e.stopPropagation();
                              togglePause(!broadcast.isBroadcastOn);
                            }}
                            content={
                              broadcast.isBroadcastOn
                                ? t("broadcast.action.pause")
                                : t("broadcast.action.resume")
                            }
                          />
                        )}
                    </div>
                    <TableContextMenu>
                      {(closeMenu) => (
                        <>
                          <Dropdown.Item>
                            <Link
                              to={routeTo(`/campaigns/${broadcast.id}`)}
                              className={"button-small"}
                            >
                              {t("form.button.edit")}
                            </Link>
                          </Dropdown.Item>
                          {!broadcast.stripePaymentRequestOption && (
                            <Dropdown.Item
                              disabled={Boolean(duplicateItemPending)}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDuplicateCampaign(broadcast);
                                closeMenu();
                              }}
                            >
                              <InfoTooltip
                                placement={"left"}
                                children={t(
                                  "broadcast.tooltip.action.duplicate"
                                )}
                                offset={[0, 0]}
                                trigger={
                                  <span>{t("broadcast.action.duplicate")}</span>
                                }
                              />
                            </Dropdown.Item>
                          )}
                          {["sent", "paused"].includes(
                            broadcast.status!.toLowerCase()
                          ) && (
                            <Dropdown.Item
                              onClick={(e) => {
                                e.stopPropagation();
                                onLoadCsv && onLoadCsv(broadcast, title);
                                closeMenu();
                              }}
                              className={"export"}
                            >
                              {loadingCsv ? (
                                <Loader active size={"tiny"}>
                                  {t("broadcast.action.exportCsv")}
                                </Loader>
                              ) : (
                                <InfoTooltip
                                  placement={"left"}
                                  children={t(
                                    "broadcast.tooltip.action.export"
                                  )}
                                  trigger={
                                    <span>
                                      {t("broadcast.action.exportCsv")}
                                    </span>
                                  }
                                />
                              )}
                            </Dropdown.Item>
                          )}
                        </>
                      )}
                    </TableContextMenu>
                  </div>
                </Table.Cell>
              </>
            );
          case "channelsWithIds":
            return (
              <Table.Cell key={key} className={`${fieldName} cell-displayName`}>
                <ChannelsIconList
                  channelsAvailable={companyChannels}
                  value={fieldValue as TargetedChannelType[]}
                />
              </Table.Cell>
            );
          case "createdBy":
            return (
              <Table.Cell key={key} className={`${fieldName} cell-displayName`}>
                {fieldValue ? staffDisplayName(fieldValue) : "-"}
              </Table.Cell>
            );
          case "startDate":
            return (
              <Table.Cell key={key} className={`${fieldName}`}>
                {fieldValue
                  ? moment
                      .utc(fieldValue)
                      .utcOffset(selectedTimeZone)
                      .format("LLL")
                  : "-"}
              </Table.Cell>
            );
          case "delivered":
          case "read":
          case "reply":
          case "sent":
            return (
              <Table.Cell key={key} className={`${fieldName} cell-displayName`}>
                {broadcast.status!.toLowerCase() === "draft" ? "-" : fieldValue}{" "}
                {broadcast[`${fieldName}Rate`] && (
                  <span className="percentage">
                    {broadcast[`${fieldName}Rate`]}
                  </span>
                )}
              </Table.Cell>
            );
          default:
            return (
              <Table.Cell key={key} className={`${fieldName} cell-displayName`}>
                {fieldValue}
              </Table.Cell>
            );
        }
      })}
    </Table.Row>
  );
}
