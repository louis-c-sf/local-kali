import { AssignmentType } from "../SettingTeams/types/TeamsType";
import { QRCodeChannelsType, MergeParamType } from "../types/SettingTypes";

export const formatQrCodeInfoRequestParam = (props: {
  assignments?: AssignmentType[];
  channels: QRCodeChannelsType[];
  type: "teams" | "user";
}) => {
  const { assignments = [], channels, type } = props;
  const merged: MergeParamType[] = [...assignments, ...channels];
  //use obj key to group teamId
  let requestParam = {};
  merged.forEach((row) => {
    const type =
      requestParam[row.id]?.qrCodeAssignmentType ?? row.assignmentType;
    const staffId =
      requestParam[row.id]?.qrCodeAssignmentStaffId ?? row.staffId;
    const resetChannel = row.resetChannel ?? false;
    const channel = requestParam[row.id]?.qrCodeChannel?.channel ?? row.channel;
    const ids = requestParam[row.id]?.qrCodeChannel?.ids ?? row.ids;
    requestParam[row.id] = {};
    if (type) {
      requestParam[row.id]["qrCodeAssignmentType"] = type;
    }
    if (staffId) {
      requestParam[row.id]["qrCodeAssignmentStaffId"] = staffId;
    }
    if ((channel || ids) && !resetChannel) {
      if (!requestParam[row.id]["qrCodeChannel"]) {
        requestParam[row.id]["qrCodeChannel"] = {};
      }
      requestParam[row.id]["qrCodeChannel"]["channel"] = channel;
      requestParam[row.id]["qrCodeChannel"]["ids"] = ids;
    }
  });

  //convert to array format
  const arr = [];
  for (let id in requestParam) {
    arr.push({
      ...(type === "teams" ? { teamId: id } : { staffId: id }),
      ...requestParam[id],
    });
  }
  return arr;
};
