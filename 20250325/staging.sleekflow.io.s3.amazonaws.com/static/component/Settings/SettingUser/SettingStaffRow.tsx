import React, { useContext, useState } from "react";
import { Button, Checkbox, Label, Table } from "semantic-ui-react";
import moment from "moment";
import { POST_RESEND_INVITATION_COMPANY_STAFF_BY_ID } from "../../../api/apiPath";
import { post, postWithExceptions } from "../../../api/apiRequest";
import { useFlashMessageChannel } from "../../BannerMessage/flashBannerMessage";
import { TeamType } from "../../../types/TeamType";
import { equals, prop, uniqWith } from "ramda";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "../../../AppRootContext";
import { TargetedChannelType } from "../../../types/BroadcastCampaignType";
import { StaffType } from "../../../types/StaffType";
import {
  QrCodeChannelActionType,
  QRCodeChannelsType,
} from "../types/SettingTypes";
import { SettingUserContext } from "./hooks/SettingUserContext";
import { handleSelectedDownload } from "../helpers/downloadQrCode";
import { useFetchWhatsappQrCode } from "../../../container/Settings/hooks/useFetchWhatsappQrCode";
import { handleUpdateAccumulatedChannel } from "../helpers/handleUpdateAccumulatedChannel";
import { DownloadCell } from "../component/DownloadCell";
import QrCodeChannelCell from "../component/QrCodeChannelCell";
import styles from "../Setting.module.css";
import FilteredUnExistedDefaultChannels from "../helpers/FilteredUnExistedDefaultChannels";
import useCompanyChannels from "../../Chat/hooks/useCompanyChannels";
import { htmlEscape } from "../../../lib/utility/htmlEscape";

interface SettingStaffRowProps {
  id: string;
  name: string;
  role: string;
  email: string;
  position: string;
  createdAt: string;
  isOwner: boolean;
  isLoggedInUser: boolean;
  isAccepted: boolean;
  onClick: Function;
  isCurrentUserAdmin: boolean;
  teams: TeamType[];
  staff: StaffType;
}

const SettingStaffRow = (props: SettingStaffRowProps) => {
  const {
    onClick,
    isCurrentUserAdmin,
    id,
    name,
    email,
    role,
    position,
    createdAt,
    isOwner,
    isAccepted,
    isLoggedInUser,
    teams,
    staff,
  } = props;
  const selectedTimeZone = useAppSelector((s) => s.selectedTimeZone);
  const isQRCodeMappingEnabled = useAppSelector(
    (s) => s.company?.isQRCodeMappingEnabled
  );
  const userWorkspaceLocation = useAppSelector(
    (s) => s.userWorkspaceLocation || ""
  );
  const qrCodeInfo = useContext(SettingUserContext);

  const { t } = useTranslation();
  const flash = useFlashMessageChannel();
  const { fetchQrCodeInfo } = useFetchWhatsappQrCode();
  const companyChannels = useCompanyChannels();

  const [selectedChannel, setSelectedChannel] =
    useState<QrCodeChannelActionType>({
      targetedChannelWithIds: staff.qrCodeChannel
        ? [staff.qrCodeChannel]
        : undefined,
    });
  let allDefaultChannels = teams.reduce(
    (acc: TargetedChannelType[], next) =>
      uniqWith(equals, [...acc, ...next.defaultChannels]),
    []
  );
  allDefaultChannels = FilteredUnExistedDefaultChannels(
    companyChannels,
    allDefaultChannels
  );

  const filteredDefaultChannels = allDefaultChannels.filter((row) =>
    row.channel.includes("whatsapp")
  );
  const hasQrCodeChannel =
    allDefaultChannels.length === 0 || filteredDefaultChannels.length > 0;

  const dispatchCallback = (channels: QRCodeChannelsType[]): void => {
    qrCodeInfo.dispatch({
      type: "UPDATE_CHANNELS",
      channels,
    });
  };

  const handleUpdateChannel = (currentChannel: QrCodeChannelActionType) => {
    setSelectedChannel(currentChannel);
    handleUpdateAccumulatedChannel({
      currentChannel,
      accumulatedChannels: qrCodeInfo.state.channels,
      row: staff,
      onChannelsUpdated: dispatchCallback,
    });
  };

  const handleClick = () => {
    onClick(isLoggedInUser, isCurrentUserAdmin, id);
  };

  const resendInvitation = async (email: string) => {
    const isNewSignup = process.env.REACT_APP_ENABLE_NEW_SIGNUP === "true";
    let result = "";
    if (isNewSignup) {
      result = await postWithExceptions(
        `/v1/tenant-hub/authorized/Companies/ResendInvitationEmail`,
        {
          param: {
            sleekflowUserId: id,
            location: userWorkspaceLocation,
          },
        }
      );
    } else {
      result = await post(
        POST_RESEND_INVITATION_COMPANY_STAFF_BY_ID.replace("{staffId}", id),
        { param: {} }
      );
    }
    if (result) {
      flash(t("flash.settings.user.reinvited", { email: htmlEscape(email) }));
    }
  };

  const downloadClickResolve = () => {
    flash(
      t("settings.whatsappQrCode.common.flashMsg.download.user", { count: 1 })
    );
  };

  return (
    <Table.Row className={styles.tableRow}>
      <Table.Cell className="hide"></Table.Cell>
      <Table.Cell className={"checkbox"}>
        <div className="checkbox-wrap">
          <Checkbox
            checked={qrCodeInfo.state.checkableItems.checkedIds.includes(id)}
            onChange={(event, data) => {
              if (data.checked) {
                qrCodeInfo.dispatch({ type: "CHECKED_ITEM", id: id });
              } else {
                qrCodeInfo.dispatch({ type: "UNCHECKED_ITEM", id: id });
              }
            }}
          />
        </div>
      </Table.Cell>
      <Table.Cell className="name">
        <span>{name.trim() || "-"}</span>
        {isLoggedInUser && t("settings.user.name.suffix.you")}
        {isOwner && (
          <Label className="owner">
            {t("settings.user.name.suffix.owner")}
          </Label>
        )}
        {!isAccepted && (
          <Label className="pending">
            {t("settings.user.name.suffix.pending")}
          </Label>
        )}
        {!isAccepted && (
          <Button
            className="action-link"
            onClick={() => resendInvitation(email)}
            content={t("settings.user.button.resend")}
          />
        )}
        {(isCurrentUserAdmin || isLoggedInUser) && (
          <Button onClick={handleClick} className="action-link">
            {t("form.button.edit")}
          </Button>
        )}
      </Table.Cell>
      <Table.Cell>{email}</Table.Cell>
      <Table.Cell>
        {teams.length > 0 ? teams.map(prop("name")).join(", ") : "-"}
      </Table.Cell>
      <Table.Cell>{role}</Table.Cell>
      <Table.Cell>{position}</Table.Cell>
      {isQRCodeMappingEnabled && (
        <>
          <Table.Cell className={styles.qrCodeChannel}>
            <QrCodeChannelCell
              defaultChannels={allDefaultChannels}
              selectedChannel={selectedChannel}
              handleUpdateChannel={handleUpdateChannel}
            />
          </Table.Cell>
          <Table.Cell className={styles.singleDownload}>
            {hasQrCodeChannel && (
              <DownloadCell
                isEdit={
                  qrCodeInfo.state.isEdit &&
                  qrCodeInfo.state.checkableItems.checkedIds.length === 0
                }
                handleSelectedDownload={() =>
                  handleSelectedDownload({
                    type: "user",
                    checkedIds: [id],
                    fetchQrCodeInfo,
                    resolve: downloadClickResolve,
                  })
                }
              />
            )}
          </Table.Cell>
        </>
      )}
      <Table.Cell>
        {moment.utc(createdAt).utcOffset(selectedTimeZone).format("LLL")}
      </Table.Cell>
    </Table.Row>
  );
};

export default SettingStaffRow;
