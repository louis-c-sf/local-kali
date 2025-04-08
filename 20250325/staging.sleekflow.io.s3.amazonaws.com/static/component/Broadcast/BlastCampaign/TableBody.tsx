import React from "react";
import { Dropdown, Table } from "semantic-ui-react";
import { InfoTooltip } from "../../shared/popup/InfoTooltip";
import { CampaignStatus } from "../CampaignStatus";
import { Link } from "react-router-dom";
import { Button } from "../../shared/Button/Button";
import { TableContextMenu } from "../../shared/grid/TableContextMenu";
import { formatNumber } from "../../../utility/string";
import { staffDisplayName } from "../../Chat/utils/staffDisplayName";
import { BlastCampaignType } from "../../../api/Broadcast/Blast/BlastCampaignType";
import { useTranslation } from "react-i18next";
import useRouteConfig from "../../../config/useRouteConfig";
import { useCurrentUtcOffset } from "../../Chat/hooks/useCurrentUtcOffset";
import useCompanyChannels from "../../Chat/hooks/useCompanyChannels";
import { ChannelsIconList } from "../../shared/grid/ChannelsIconList";
import { getUtcMoment } from "../../../utility/moment";
import { useCompanyStaff } from "../../../api/User/useCompanyStaff";

export function TableBody(props: {
  loading: boolean;
  batchLoading: boolean;
  results: BlastCampaignType[];
  exportLoadingId: string | null;
  isChecked: (id: string) => boolean;
  toggleItem: (id: string) => void;
  downloadRecipients: (id: string) => () => void;
}) {
  const {
    loading,
    batchLoading,
    exportLoadingId,
    isChecked,
    results,
    toggleItem,
    downloadRecipients,
  } = props;
  const { t } = useTranslation();
  const { routeTo } = useRouteConfig();

  const utcOffset = useCurrentUtcOffset();
  const companyChannels = useCompanyChannels();
  const staff = useCompanyStaff();

  function getSenderName(id: number) {
    const staffFound = staff.staffList.find((s) => s.staffId === id);
    return staffFound ? staffDisplayName(staffFound) : "-";
  }

  function formatDate(date: string | null) {
    if (!date) {
      return "-";
    }
    return getUtcMoment(utcOffset, date)?.format("MMMM D YYYY, HH:mma") ?? date;
  }

  return (
    <Table.Body>
      {results.map((item) => (
        <Table.Row
          cells={[
            /* {
                          key: "id",
                          className: "checkbox",
                          content: (
                            <>
                              <div className="checkbox-wrap">
                                {(isChecked(item.id) && batchLoading) ||
                                exportLoadingId === item.id ? (
                                  <Loader inline active size={"small"} />
                                ) : (
                                  <Checkbox
                                    checked={isChecked(item.id)}
                                    onClick={() => toggleItem(item.id)}
                                  />
                                )}
                              </div>
                            </>
                          ),
                        },*/
            {
              key: "status",
              className: "status",
              content: (
                <InfoTooltip
                  offset={[0, -30]}
                  placement={"right"}
                  children={t("broadcast.tooltip.field.status")}
                  trigger={
                    <CampaignStatus value={item.status} type={"blast"} />
                  }
                />
              ),
            },
            {
              key: "name",
              className: `name cell-name ${
                item.name ? "" : "cell-name_untitled"
              }`,
              content: (
                <>
                  <Link to={routeTo(`/campaigns/blast/${item.id}`)}>
                    {item.name ?? t("broadcast.grid.row.campaign.untitled")}
                  </Link>
                </>
              ),
            },
            {
              key: "actions",
              className: "name cell-name",
              content: (
                <div className={"wrap"}>
                  <div className="button-area fluid">
                    {item.status === "Sent" &&
                      item.messageHubRequestResultCsvFileUrl && (
                        <Button
                          as={"a"}
                          href={item.messageHubRequestResultCsvFileUrl}
                          content={t("broadcast.grid.button.exportResult")}
                          disabled={exportLoadingId === item.id}
                        />
                      )}
                  </div>
                  {["Sent", "Error"].includes(item.status) && (
                    <TableContextMenu>
                      {(closeMenu) => (
                        <>
                          {item.messageHubRequestResultCsvFileUrl && (
                            <Dropdown.Item key={"export"}>
                              <a
                                href={item.messageHubRequestResultCsvFileUrl}
                                target={"_blank"}
                                rel={"noreferrer noopener"}
                              >
                                {t("broadcast.grid.button.exportResult")}
                              </a>
                            </Dropdown.Item>
                          )}
                          <Dropdown.Item
                            key={"download"}
                            disabled={loading || batchLoading}
                            onClick={() => {
                              downloadRecipients(item.id)();
                              closeMenu();
                            }}
                          >
                            <span>
                              {t("broadcast.grid.button.downloadRecipients")}
                            </span>
                          </Dropdown.Item>
                        </>
                      )}
                    </TableContextMenu>
                  )}
                </div>
              ),
            },
            {
              key: "sent",
              content: formatNumber(
                item.messageHubRequestProgress?.totalCount ?? 0,
                { maximumFractionDigits: 0 }
              ),
            },
            {
              key: "delivered",
              content: formatNumber(
                item.messageHubRequestProgress?.sentCount ?? 0,
                { maximumFractionDigits: 0 }
              ),
            },
            {
              key: "channel",
              className: "cell-displayName",
              content: (
                <ChannelsIconList
                  channelsAvailable={companyChannels}
                  value={[item.targetedChannelWithIds]}
                />
              ),
            },
            {
              key: "sentAt",
              content: formatDate(item.sentAt),
            },
            {
              key: "deliveredAt",
              content: formatDate(item.completedAt),
            },
            {
              key: "createdBy",
              content: item.savedById ? getSenderName(item.savedById) : "-",
            },
          ]}
        />
      ))}
    </Table.Body>
  );
}
