import { CheckedIdsType } from "../types/SettingTypes";
import {
  GET_TEAM_WHATSAPP_QR_CODE,
  GET_PERSONAL_WHATSAPP_QR_CODE,
} from "../../../api/apiPath";
import { QrCodeInfoType } from "../../shared/QrCodeInfoType";

const downloadQrCode = async (
  downloadedQrCodeInfo: (QrCodeInfoType | undefined)[],
  resolve: () => void
) => {
  const downloadItems = downloadedQrCodeInfo.map((row) => row?.qrcodeUrl);
  downloadItems.map((url) => {
    window.open(url ?? "", "download_qrCode");
  });
  resolve();
};

const getQrCodeInfo = async (props: {
  type: "teams" | "user";
  checkedIds: CheckedIdsType[];
  fetchQrCodeInfo: (path: string) => Promise<QrCodeInfoType | undefined>;
}) => {
  const { checkedIds, fetchQrCodeInfo, type } = props;
  return await Promise.all(
    checkedIds.map((id) =>
      type === "teams"
        ? fetchQrCodeInfo(
            GET_TEAM_WHATSAPP_QR_CODE.replace("{teamId}", id.toString())
          )
        : fetchQrCodeInfo(
            GET_PERSONAL_WHATSAPP_QR_CODE.replace("{staffId}", id.toString())
          )
    )
  ).then((result) => {
    return result.map((row) => {
      if (row) {
        return row;
      }
    });
  });
};

export const handleSelectedDownload = async (props: {
  type: "teams" | "user";
  checkedIds: CheckedIdsType[];
  fetchQrCodeInfo: (path: string) => Promise<QrCodeInfoType | undefined>;
  resolve: () => void;
}) => {
  const { checkedIds, fetchQrCodeInfo, type, resolve } = props;
  const downloadedInfo = await getQrCodeInfo({
    type,
    checkedIds,
    fetchQrCodeInfo,
  });
  if (downloadedInfo && downloadedInfo.length > 0) {
    await downloadQrCode(downloadedInfo, resolve);
  }
};
